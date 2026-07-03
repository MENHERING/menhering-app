'use server';

import { revalidatePath } from 'next/cache';

import { DEFAULT_CHARACTER_TYPE, DEFAULT_COLOR_THEME, DEFAULT_NICKNAME } from '@/constants/avatar';
import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase/server';
import type { Avatar, CharacterType, ColorTheme } from '@/types/avatar';

import { saveAvatarSchema, type SaveAvatarInput } from './validation';

interface AvatarRow {
  id: string;
  user_id: string;
  character_type: string;
  color_theme: string;
  created_at: string;
  updated_at: string;
}

function toAvatar(row: AvatarRow, nickname: string): Avatar {
  return {
    id: row.id,
    userId: row.user_id,
    characterType: row.character_type as CharacterType,
    colorTheme: row.color_theme as ColorTheme,
    nickname,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

/**
 * 로그인 유저의 아바타를 조회한다. 아바타 row가 없으면 기본값으로 생성한다.
 * 닉네임은 users.nickname에서 함께 읽는다.
 * 로그인 세션이 없으면(아직 auth 미연동) 기본 아바타를 반환해 UI만 렌더한다.
 */
export async function getMyAvatar(): Promise<Avatar> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return fallbackAvatar();

  // 독립적인 두 조회는 병렬 실행
  const [userResult, avatarResult] = await Promise.all([
    supabase.from('users').select('nickname').eq('id', user.id).maybeSingle(),
    supabase
      .from('avatars')
      .select('id, user_id, character_type, color_theme, created_at, updated_at')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  if (userResult.error) console.error('[avatar] users 조회 실패:', userResult.error);

  const nickname = (userResult.data?.nickname as string | undefined) ?? DEFAULT_NICKNAME;

  // 조회 오류는 "row 없음"과 구분한다: 일시적 조회 실패를 새 아바타 생성으로 오인하지 않도록 폴백 반환.
  if (avatarResult.error) {
    console.error('[avatar] avatars 조회 실패:', avatarResult.error);
    return { ...fallbackAvatar(), userId: user.id, nickname };
  }

  if (avatarResult.data) return toAvatar(avatarResult.data as AvatarRow, nickname);

  // 조회 성공 + row 없음일 때만 기본 아바타 생성 (color_theme은 DB 기본값 '클래식')
  const { data: inserted, error: insertError } = await supabase
    .from('avatars')
    .insert({ user_id: user.id, character_type: DEFAULT_CHARACTER_TYPE })
    .select('id, user_id, character_type, color_theme, created_at, updated_at')
    .single();

  if (insertError) console.error('[avatar] 기본 아바타 생성 실패:', insertError);

  return inserted
    ? toAvatar(inserted as AvatarRow, nickname)
    : { ...fallbackAvatar(), userId: user.id, nickname };
}

export type SaveAvatarResult = { ok: true } | { ok: false; error: string };

/**
 * 아바타 커스터마이징(character_type/color_theme)을 avatars에, 닉네임을 users.nickname에 저장한다.
 * RLS가 auth.uid() 기준이므로 로그인 세션이 있어야 실제로 반영된다.
 */
export async function saveAvatar(input: SaveAvatarInput): Promise<SaveAvatarResult> {
  const parsed = saveAvatarSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: '로그인이 필요합니다.' };
  }

  const { characterType, colorTheme, nickname } = parsed.data;
  const now = new Date().toISOString();

  // avatars: 있으면 update, 없으면 insert (user_id 유니크 제약에 의존하지 않도록 분기)
  const { data: updatedRows, error: updateError } = await supabase
    .from('avatars')
    .update({ character_type: characterType, color_theme: colorTheme, updated_at: now })
    .eq('user_id', user.id)
    .select('id');

  if (updateError) {
    console.error('[avatar] avatars 업데이트 실패:', updateError);
    return { ok: false, error: '아바타 저장에 실패했습니다.' };
  }

  if (!updatedRows || updatedRows.length === 0) {
    const { error: insertError } = await supabase
      .from('avatars')
      .insert({ user_id: user.id, character_type: characterType, color_theme: colorTheme });

    if (insertError) {
      console.error('[avatar] avatars 생성 실패:', insertError);
      return { ok: false, error: '아바타 저장에 실패했습니다.' };
    }
  }

  // 닉네임은 users 테이블 소관 (users RLS: auth.uid() = id)
  const { error: nicknameError } = await supabase
    .from('users')
    .update({ nickname, updated_at: now })
    .eq('id', user.id);

  if (nicknameError) {
    console.error('[avatar] 닉네임 저장 실패:', nicknameError);
    return { ok: false, error: '닉네임 저장에 실패했습니다.' };
  }

  revalidatePath(ROUTES.AVATAR);

  return { ok: true };
}
