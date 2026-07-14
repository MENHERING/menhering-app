import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase/server';
import { StoredLevelSchema } from '@/schemas/onboarding.schema';
import type { LevelTitle } from '@/types/level';

// 온보딩(레벨 설정) 완료 여부.
// - completed: user_progress.level 이 채워져 있음
// - incomplete: 세션은 있는데 레벨이 없음(행 자체가 없는 신규 유저 포함)
// - unauthenticated: 세션이 없음 → 로그인부터 해야 한다
// - unknown: 세션은 있으나 조회에 실패해 레벨 유무를 판별하지 못함
export type OnboardingStatus =
  | { status: 'completed'; level: LevelTitle }
  | { status: 'incomplete' }
  | { status: 'unauthenticated' }
  | { status: 'unknown' };

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: 'unauthenticated' };

  const { data, error } = await supabase
    .from('user_progress')
    .select('level')
    .eq('user_id', user.id)
    .maybeSingle();

  // 조회 실패는 "레벨 없음"과 구분한다. 일시적 장애를 온보딩 미완료로 오인하면
  // 이미 레벨이 있는 유저를 온보딩으로 되돌려보내게 된다.
  if (error) {
    console.error('[onboarding] user_progress 조회 실패:', error);
    return { status: 'unknown' };
  }

  // DB가 돌려준 text를 그대로 믿지 않고 스키마로 검증한다(허용 밖의 값 = 미설정 취급).
  const parsed = StoredLevelSchema.safeParse(data?.level ?? null);

  if (!parsed.success) {
    console.error('[onboarding] 알 수 없는 레벨 값:', data?.level);
    return { status: 'incomplete' };
  }

  return parsed.data ? { status: 'completed', level: parsed.data } : { status: 'incomplete' };
}

/**
 * 로그인 직후 이동할 경로.
 * 레벨이 없는 신규 유저만 온보딩으로 보내고, 그 외에는 원래 가려던 경로로 보낸다.
 * 판별 불가(unknown)일 때 온보딩으로 보내지 않는 이유: 저장이 함께 실패하는 상황이면
 * 온보딩을 끝낼 수 없어 로그인할 때마다 같은 화면에 갇히기 때문이다.
 */
export async function resolvePostLoginPath(next: string): Promise<string> {
  const onboarding = await getOnboardingStatus();

  return onboarding.status === 'incomplete' ? ROUTES.LEVEL : next;
}
