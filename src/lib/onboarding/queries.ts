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
 * 온보딩 상태 → 이동 경로. 세션·레벨 상태를 이미 조회한 곳에서 재조회 없이 쓰는 순수 함수다.
 * 레벨이 없는 신규 유저만 온보딩으로 보내고, 그 외에는 next로 보낸다.
 * 판별 불가(unknown)일 때 온보딩으로 보내지 않는 이유: 저장이 함께 실패하는 상황이면
 * 온보딩을 끝낼 수 없어 로그인할 때마다 같은 화면에 갇히기 때문이다.
 */
export function toEntryPath(onboarding: OnboardingStatus, next: string = ROUTES.HOME): string {
  switch (onboarding.status) {
    case 'unauthenticated':
      return ROUTES.LOGIN;
    case 'incomplete':
      return ROUTES.LEVEL;
    default:
      // 로그인한 유저를 로그인 화면으로 되돌리지 않는다.
      // `?next=/login?next=/login...`처럼 중첩된 경로는 한 홉에 한 겹씩 벗겨지며 리다이렉트를 반복하므로,
      // 목적지가 로그인 화면이면 홈으로 끊는다.
      return isLoginPath(next) ? ROUTES.HOME : next;
  }
}

// 경로가 로그인 화면인지 판별한다. 쿼리스트링(`/login?next=...`)까지 포함하되,
// `/login`으로 시작하는 다른 경로(`/login-history` 등)는 걸리지 않게 한다.
function isLoginPath(path: string): boolean {
  return path === ROUTES.LOGIN || path.startsWith(`${ROUTES.LOGIN}?`);
}

// 로그인 직후 이동할 경로. next는 로그인 전에 가려던 경로다.
export async function resolvePostLoginPath(next: string): Promise<string> {
  return toEntryPath(await getOnboardingStatus(), next);
}

// 앱에 다시 진입했을 때(스플래시) 보여줄 경로. 세션이 살아 있으면 로그인 화면을 다시 띄우지 않는다.
export async function resolveEntryPath(): Promise<string> {
  return toEntryPath(await getOnboardingStatus());
}
