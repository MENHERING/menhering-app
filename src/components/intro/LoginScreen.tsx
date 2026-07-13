import Image from 'next/image';
import Link from 'next/link';

import { SocialLoginButtons } from '@/components/intro/SocialLoginButtons';

type LoginVariant = 'new' | 'returning';

interface LoginScreenProps {
  // 신규(안녕하세요) / 복귀(다시 시작해요)
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

  return (
    <div className="bg-sand relative flex min-h-dvh w-full flex-col items-center overflow-hidden px-6">
      {/* 배경 장식 원 */}
      <div className="bg-primary-soft/40 absolute -top-10 -left-10 size-40 rounded-full" />
      <div className="bg-primary-soft/30 absolute top-32 -right-12 size-32 rounded-full" />
      <div className="bg-primary-soft/30 absolute top-1/2 -left-16 size-36 rounded-full" />

      <div className="relative flex w-full max-w-[430px] flex-1 flex-col">
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
          <SocialLoginButtons kakaoLabel={copy.kakao} googleLabel={copy.google} />

          {/* 개발용 임시 이동 - OAuth 미설정 환경 우회 */}
          {process.env.NODE_ENV === 'development' && (
            <Link href="/level" className="text-primary/90 mt-1 text-center text-xl font-medium">
              [개발용] 로그인 패스(레벨 테스트)
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
