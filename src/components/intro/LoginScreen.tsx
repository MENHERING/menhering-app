import Image from 'next/image';

type LoginVariant = 'new' | 'returning';

interface LoginScreenProps {
  // 신규(안녕하세요) / 복귀(다시 시작해요) 카피·마스코트 분기
  variant?: LoginVariant;
}

const COPY: Record<
  LoginVariant,
  { heading: string; sub: string[]; kakao: string; google: string }
> = {
  new: {
    heading: '안녕하세요! 👋',
    sub: ['레드판다와 함께', '매일 조금씩 성장해봐요.'],
    kakao: '카카오로 시작하기',
    google: 'Google로 시작하기',
  },
  returning: {
    heading: '다시 시작해요!',
    sub: ['레드판다와 함께', '학습을 이어가요.'],
    kakao: '카카오로 다시 시작하기',
    google: 'Google로 다시 시작하기',
  },
};

export function LoginScreen({ variant = 'new' }: LoginScreenProps) {
  const copy = COPY[variant];

  // TODO: OAuth 실구현은 별도 이슈 (Supabase provider·콜백·세션). 현재 UI만.
  return (
    <div className="bg-sand relative flex min-h-dvh w-full flex-col items-center overflow-hidden px-6">
      {/* 배경 장식 원 */}
      <div className="bg-primary-soft/40 absolute -top-10 -left-10 size-40 rounded-full" />
      <div className="bg-primary-soft/30 absolute top-32 -right-12 size-32 rounded-full" />
      <div className="bg-primary-soft/30 absolute top-1/2 -left-16 size-36 rounded-full" />

      <div className="relative flex w-full max-w-107.5 flex-1 flex-col">
        {/* 브랜드 */}
        <div className="flex flex-col items-center gap-2 pt-12">
          <div className="flex items-center gap-2">
            <span className="bg-primary flex size-8 items-center justify-center rounded-full text-base text-white">
              ◕
            </span>
            <span className="text-plum text-xl font-extrabold">멘헤링</span>
          </div>
          <p className="text-primary text-xs font-medium">나만의 캐릭터와 함께하는 학습</p>
        </div>

        {/* 마스코트 */}
        <div className="relative mx-auto mt-8 h-44 w-44">
          <Image
            src="/mascot/red-panda.png"
            alt="멘헤링 마스코트"
            fill
            priority
            sizes="176px"
            className="object-contain drop-shadow-sm"
          />
        </div>

        {/* 카피 */}
        <div className="mt-8 flex flex-col gap-2">
          <h1 className="text-plum text-3xl font-extrabold tracking-tight">{copy.heading}</h1>
          <p className="text-primary/70 text-sm leading-6 font-medium">
            {copy.sub.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>

        <div className="mt-auto mb-10 flex flex-col gap-3">
          {/* 카카오 UI만 */}
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#FEE500] text-base font-bold text-[#191600] opacity-60"
          >
            <KakaoIcon />
            {copy.kakao}
          </button>

          {/* Google UI만 */}
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white text-base font-bold text-[#191600] opacity-60"
          >
            <GoogleIcon />
            {copy.google}
          </button>
        </div>
      </div>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden fill="#191600">
      <path d="M12 3.5C6.9 3.5 2.75 6.79 2.75 10.85c0 2.63 1.74 4.94 4.36 6.26-.19.69-.69 2.5-.79 2.89-.12.48.18.47.37.34.15-.1 2.36-1.6 3.32-2.26.65.1 1.31.15 1.99.15 5.1 0 9.25-3.29 9.25-7.35S17.1 3.5 12 3.5Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
