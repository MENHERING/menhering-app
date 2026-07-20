'use server';

import { DEFAULT_CHARACTER_TYPE, DEFAULT_COLOR_THEME, DEFAULT_NICKNAME } from '@/constants/avatar';
import { getLevelInfo } from '@/lib/level';
import { createClient } from '@/lib/supabase/server';
import type { Avatar, CharacterType, ColorTheme } from '@/types/avatar';

import {
  buyAvatarItemSchema,
  inventoryRowsSchema,
  saveAvatarSchema,
  type BuyAvatarItemInput,
  type SaveAvatarInput,
} from './validation';

function fallbackAvatar(): Avatar {
  const now = new Date().toISOString();

  return {
    id: '',
    userId: '',
    characterType: DEFAULT_CHARACTER_TYPE,
    colorTheme: DEFAULT_COLOR_THEME,
    nickname: DEFAULT_NICKNAME,
    createdAt: now,
    updatedAt: now,
  };
}

// Postgres 함수 get_my_avatar가 돌려주는 행(untyped supabase 클라이언트라 반환 타입을 명시).
// users 기준 left join avatars이므로, 아바타가 아직 없으면 avatar 필드는 null이고 nickname·coin만 온다.
interface AvatarRpcRow {
  id: string | null;
  user_id: string;
  character_type: string | null;
  color_theme: string | null;
  created_at: string | null;
  updated_at: string | null;
  nickname: string | null;
  coin: number | null;
  // 진행도 행이 없는 신규 유저는 left join이라 null (오류가 아님 → 0 XP = Lv.1로 본다).
  xp: number | null;
}

// 아바타 페이지 초기 데이터: 아바타 + 코인 잔액(users.coin) + 레벨(user_progress.xp 환산).
// 같은 조회에서 함께 받아 왕복을 줄인다.
export interface MyAvatarData {
  avatar: Avatar;
  coin: number;
  // 조회 실패 시 null → 레벨 뱃지를 숨긴다. 레벨은 순수 표시값이라 1로 폴백하면 실제
  // 고레벨 유저에게 거짓 정보를 보여주고 마이페이지 표기와도 어긋난다.
  level: number | null;
}

/**
 * 로그인 유저의 아바타·닉네임·코인·레벨을 Postgres 함수 get_my_avatar 하나로 조회한다(왕복 4→1).
 * 유저 식별은 함수 내부 auth.uid()가 하고 RLS(본인 행)로 스코프된다. 함수는 users 기준이라
 * 아바타 row가 없어도(첫 저장 전) 닉네임·코인은 온다 — 실제 아바타 생성은 저장(save_avatar upsert) 시.
 *
 * 레벨은 user_progress.xp를 마이페이지와 공유하는 getLevelInfo(xp 500당 1레벨)로 환산한 값이다.
 * 진행도 행이 없는 신규 유저는 xp가 null로 오지만 이는 오류가 아니므로 0 XP = Lv.1로 본다.
 */
export async function getMyAvatar(): Promise<MyAvatarData> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_my_avatar').maybeSingle<AvatarRpcRow>();

  if (error) {
    console.error('[avatar] 아바타 조회 실패:', error);
    return { avatar: fallbackAvatar(), coin: 0, level: null };
  }

  // users 행이 없으면(비로그인) 전체 폴백.
  if (!data) return { avatar: fallbackAvatar(), coin: 0, level: null };

  const nickname = data.nickname ?? DEFAULT_NICKNAME;
  const coin = data.coin ?? 0;
  const level = getLevelInfo(data.xp ?? 0).level;

  // 아바타 row가 아직 없으면(첫 저장 전) 기본 아바타에 실제 닉네임만 얹는다.
  // 닉네임을 avatars 존재 여부와 분리해, 신규 유저가 기본 닉네임으로 덮이는 것을 막는다.
  if (!data.id) {
    return { avatar: { ...fallbackAvatar(), userId: data.user_id, nickname }, coin, level };
  }

  return {
    avatar: {
      id: data.id,
      userId: data.user_id,
      characterType: (data.character_type ?? DEFAULT_CHARACTER_TYPE) as CharacterType,
      colorTheme: (data.color_theme ?? DEFAULT_COLOR_THEME) as ColorTheme,
      nickname,
      createdAt: data.created_at ?? new Date().toISOString(),
      updatedAt: data.updated_at ?? new Date().toISOString(),
    },
    coin,
    level,
  };
}

// 보유 목록(기본 보유 ∪ 구매분). get_my_avatar_items RPC가 종류별 행으로 돌려준다.
export interface OwnedItems {
  characters: CharacterType[];
  themes: ColorTheme[];
}

/**
 * 로그인 유저의 보유 목록을 조회한다. 유저 식별은 함수 내부 auth.uid()가 하고 RLS로 스코프된다.
 * 조회 실패 시 최소 기본값(레서판다/클래식)으로 폴백해, 최소한 기본 항목은 장착·선택 가능하게 한다.
 */
export async function getMyAvatarItems(): Promise<OwnedItems> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_my_avatar_items');

  const parsed = inventoryRowsSchema.safeParse(data);

  if (error || !parsed.success) {
    if (error) console.error('[avatar] 보유 목록 조회 실패:', error);
    else console.error('[avatar] 보유 목록 형식 오류:', parsed.error);

    return { characters: [DEFAULT_CHARACTER_TYPE], themes: [DEFAULT_COLOR_THEME] };
  }

  const rows = parsed.data;
  const characters = rows
    .filter((row) => row.item_kind === 'character')
    .map((row) => row.item_value as CharacterType);
  const themes = rows
    .filter((row) => row.item_kind === 'theme')
    .map((row) => row.item_value as ColorTheme);

  return { characters, themes };
}

export type SaveAvatarResult = { ok: true } | { ok: false; error: string };

/**
 * 아바타 커스터마이징(character_type/color_theme)을 avatars에, 닉네임을 users.nickname에 저장한다.
 * 여러 번의 왕복(getUser + avatars upsert + users update)을 Postgres 함수 save_avatar 하나로 묶어
 * 단일 왕복으로 처리한다(느린 회선에서 타임아웃이 쌓이는 것을 막음). 유저 식별은 함수 내부 auth.uid()가
 * 하고, RLS(본인 행)로 스코프되므로 서버에서 별도 getUser가 필요 없다.
 */
export async function saveAvatar(input: SaveAvatarInput): Promise<SaveAvatarResult> {
  const parsed = saveAvatarSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요.' };
  }

  const supabase = await createClient();
  const { characterType, colorTheme, nickname } = parsed.data;

  const { error } = await supabase.rpc('save_avatar', {
    p_character_type: characterType,
    p_color_theme: colorTheme,
    p_nickname: nickname,
  });

  if (error) {
    console.error('[avatar] 저장 실패:', error);
    // 함수에서 미인증 시 raise(errcode 28000)
    if (error.code === '28000') return { ok: false, error: '로그인이 필요합니다.' };

    return { ok: false, error: '저장에 실패했습니다.' };
  }

  // revalidatePath는 쓰지 않는다: /avatar는 동적 라우트라 다음 방문 때 새로 읽고, 저장 성공 시
  // 클라이언트(AvatarClient)가 이미 상태를 갱신한다. 재검증은 Server Action 응답에 /avatar 재렌더
  // (getMyAvatar 재조회)를 끼워 넣어 느린 회선에서 저장을 수십 초 지연시킨다.
  return { ok: true };
}

// 성공 시 서버가 차감한 실제 잔액(coin)을 돌려준다 → 클라가 이 값으로 잔액을 덮는다.
// coin이 null이면(반환값이 유한수가 아닌 이상치) 클라가 자체 계산(현재 잔액 - 결제액)으로 폴백한다.
export type BuyAvatarItemResult = { ok: true; coin: number | null } | { ok: false; error: string };

// RPC가 raise한 SQLSTATE → 사용자 메시지. 함수에서 던진 메시지를 그대로 신뢰하지 않고
// 코드로 매핑해, 원인이 바뀌어도 노출 문구를 서버 액션이 통제한다.
const BUY_ERROR_MESSAGE: Record<string, string> = {
  '28000': '로그인이 필요합니다.',
  '22023': '구매할 수 없는 항목이에요.',
  PT409: '이미 보유한 항목이에요.',
  PT402: '코인이 부족해요.',
};

/**
 * 코인으로 아바타 항목(테마/캐릭터)을 구매한다. 결제 금액과 보유 지급은 서버 RPC(buy_avatar_item)가
 * 단일 트랜잭션에서 원자적으로 처리한다 — 클라가 넘긴 값으로 차감하지 않는다(가격 위조 차단).
 */
export async function buyAvatarItem(input: BuyAvatarItemInput): Promise<BuyAvatarItemResult> {
  const parsed = buyAvatarItemSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: '구매할 수 없는 항목이에요.' };
  }

  const supabase = await createClient();
  const { kind, value } = parsed.data;

  const { data, error } = await supabase.rpc('buy_avatar_item', {
    p_kind: kind,
    p_value: value,
  });

  if (error) {
    console.error('[avatar] 구매 실패:', error);

    return { ok: false, error: BUY_ERROR_MESSAGE[error.code ?? ''] ?? '구매에 실패했습니다.' };
  }

  // 결제는 이미 트랜잭션으로 커밋됐으므로 반환값 형태가 이상해도 throw하지 않는다(성공을 실패로
  // 뒤집으면 재시도→이미보유 오류로 이어짐). 유한수가 아니면 null로 내려 클라가 폴백하게 한다.
  const coin = typeof data === 'number' && Number.isFinite(data) ? data : null;

  if (coin === null) console.error('[avatar] 구매 반환 잔액 형식 오류:', data);

  return { ok: true, coin };
}
