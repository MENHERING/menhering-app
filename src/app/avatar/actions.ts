'use server';

import { DEFAULT_CHARACTER_TYPE, DEFAULT_COLOR_THEME, DEFAULT_NICKNAME } from '@/constants/avatar';
import { createClient } from '@/lib/supabase/server';
import type { Avatar, CharacterType, ColorTheme } from '@/types/avatar';

import { saveAvatarSchema, type SaveAvatarInput } from './validation';

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
// users 기준 left join avatars이므로, 아바타가 아직 없으면 avatar 필드는 null이고 nickname만 온다.
interface AvatarRpcRow {
  id: string | null;
  user_id: string;
  character_type: string | null;
  color_theme: string | null;
  created_at: string | null;
  updated_at: string | null;
  nickname: string | null;
}

/**
 * 로그인 유저의 아바타(+닉네임)를 Postgres 함수 get_my_avatar 하나로 조회한다(왕복 3→1).
 * 유저 식별은 함수 내부 auth.uid()가 하고 RLS(본인 행)로 스코프된다. 함수는 users 기준이라
 * 아바타 row가 없어도(첫 저장 전) 닉네임은 온다 — 실제 아바타 생성은 저장(save_avatar upsert) 시.
 */
export async function getMyAvatar(): Promise<Avatar> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_my_avatar').maybeSingle<AvatarRpcRow>();

  if (error) {
    console.error('[avatar] 아바타 조회 실패:', error);
    return fallbackAvatar();
  }

  // users 행이 없으면(비로그인) 전체 폴백.
  if (!data) return fallbackAvatar();

  const nickname = data.nickname ?? DEFAULT_NICKNAME;

  // 아바타 row가 아직 없으면(첫 저장 전) 기본 아바타에 실제 닉네임만 얹는다.
  // 닉네임을 avatars 존재 여부와 분리해, 신규 유저가 기본 닉네임으로 덮이는 것을 막는다.
  if (!data.id) {
    return { ...fallbackAvatar(), userId: data.user_id, nickname };
  }

  return {
    id: data.id,
    userId: data.user_id,
    characterType: (data.character_type ?? DEFAULT_CHARACTER_TYPE) as CharacterType,
    colorTheme: (data.color_theme ?? DEFAULT_COLOR_THEME) as ColorTheme,
    nickname,
    createdAt: data.created_at ?? new Date().toISOString(),
    updatedAt: data.updated_at ?? new Date().toISOString(),
  };
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
