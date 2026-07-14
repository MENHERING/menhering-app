'use server';

import { findLevelByStep } from '@/constants/level';
import { createClient } from '@/lib/supabase/server';
import {
  SaveOnboardingLevelSchema,
  type SaveOnboardingLevelInput,
} from '@/schemas/onboarding.schema';

export type SaveOnboardingLevelResult = { ok: true } | { ok: false; error: string };

const INVALID_LEVEL_MESSAGE = '올바른 레벨을 선택해주세요.';
const SAVE_FAILED_MESSAGE = '레벨 저장에 실패했습니다. 잠시 후 다시 시도해주세요.';
// 유니크 제약 위반(user_progress.user_id). 두 탭에서 동시에 저장할 때만 발생한다.
const UNIQUE_VIOLATION = '23505';

/**
 * 온보딩에서 고른 실력 단계를 user_progress.level에 저장한다.
 * 레벨은 최초 1회만 확정한다(이미 값이 있으면 덮어쓰지 않음).
 * 회원가입 트리거가 user_progress 행을 만들지 않으므로, 행이 없으면 함께 생성한다.
 */
export async function saveOnboardingLevel(
  input: SaveOnboardingLevelInput,
): Promise<SaveOnboardingLevelResult> {
  const parsed = SaveOnboardingLevelSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? INVALID_LEVEL_MESSAGE };
  }

  // DB에는 단계 번호가 아니라 한글 난이도명이 들어간다(학습 화면의 난이도 값과 동일).
  const level = findLevelByStep(parsed.data.step);

  if (!level) return { ok: false, error: INVALID_LEVEL_MESSAGE };

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: '로그인이 필요합니다.' };

  const { data: progress, error: selectError } = await supabase
    .from('user_progress')
    .select('id, level')
    .eq('user_id', user.id)
    .maybeSingle();

  // 조회 실패는 "행 없음"과 구분한다. 일시적 장애를 신규 행으로 오인해 중복 생성하지 않도록 중단.
  if (selectError) {
    console.error('[onboarding] user_progress 조회 실패:', selectError);
    return { ok: false, error: SAVE_FAILED_MESSAGE };
  }

  // 이미 확정된 레벨이 있으면 그대로 둔다(최초 1회 설정).
  if (progress?.level) return { ok: true };

  if (!progress) {
    const { error: insertError } = await supabase
      .from('user_progress')
      .insert({ user_id: user.id, level: level.title });

    // 동시 저장으로 행이 먼저 생겼다면 이미 레벨이 확정된 것이므로 성공으로 본다.
    if (insertError && insertError.code !== UNIQUE_VIOLATION) {
      console.error('[onboarding] user_progress 생성 실패:', insertError);
      return { ok: false, error: SAVE_FAILED_MESSAGE };
    }

    return { ok: true };
  }

  const { error: updateError } = await supabase
    .from('user_progress')
    .update({ level: level.title })
    .eq('user_id', user.id)
    .is('level', null);

  if (updateError) {
    console.error('[onboarding] 레벨 저장 실패:', updateError);
    return { ok: false, error: SAVE_FAILED_MESSAGE };
  }

  return { ok: true };
}
