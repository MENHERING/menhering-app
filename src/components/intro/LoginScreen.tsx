import { TriangleAlert } from 'lucide-react';
import Image from 'next/image';

import { CharacterRenderer } from '@/components/avatar/CharacterRenderer';
import { SocialLoginButtons } from '@/components/intro/SocialLoginButtons';
import { DEFAULT_CHARACTER_TYPE, DEFAULT_COLOR_THEME } from '@/constants/avatar';

type LoginVariant = 'new' | 'returning';

interface LoginScreenProps {
  // 신규(안녕하세요) / 복귀(다시 시작해요)
  variant?: LoginVariant;
  // 로그인 성공 후 이동할 경로
  next?: string;
  // 로그인 실패 안내 문구 (콜백 실패 시 표시). null이면 배너 없음.
  errorMessage?: string | null;
}

const COPY: Record<
  LoginVariant,
  { heading: string; sub: string[]; kakao: string; google: string }
> = {
  new: {
    heading: '왔구나.. 기다렸잖아.. ㅠㅠ',
    sub: ['혹시 오늘 나랑 같이 있어주면 안 될까...?'],
    kakao: '카카오로 시작하기',
    google: 'Google로 시작하기',
  },
  returning: {
    heading: '또 와줄 줄 알았어... 히잉',
    sub: ['안 올까 봐 계속 문 앞에서 기다렸잖아.', '얼른 와, 우리 이어서 하자'],
    kakao: '카카오로 다시 시작하기',
    google: 'Google로 다시 시작하기',
  },
};

export function LoginScreen({ variant = 'new', next, errorMessage }: LoginScreenProps) {
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
            {/* 로고 아이콘: 홈 상단바와 동일하게 아바타 얼굴을 크롭(overflow-hidden + translate)해 임시 통일.
                전용 앱 아이콘(브랜드 마크)은 별도 이슈로 제작 예정. */}
            <span className="bg-primary flex size-9 items-center justify-center overflow-hidden rounded-full">
              <CharacterRenderer
                characterType={DEFAULT_CHARACTER_TYPE}
                colorTheme={DEFAULT_COLOR_THEME}
                className="size-8 translate-y-1"
              />
            </span>
            <span className="text-plum text-2xl font-extrabold">멘헤링</span>
          </div>
          <p className="text-primary text-sm font-medium">나만의 캐릭터와 함께하는 학습</p>
        </div>

        {/* 마스코트 */}
        <div className="relative mx-auto mt-8 h-56 w-56">
          <Image
            src="/mascot/red-panda.png"
            alt="멘헤링 마스코트"
            fill
            priority
            sizes="224px"
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
          {errorMessage && (
            <div
              role="alert"
              className="border-coral/30 bg-coral-soft/30 text-coral flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium"
            >
              <TriangleAlert className="size-4 shrink-0" aria-hidden />
              <span>{errorMessage}</span>
            </div>
          )}
          <SocialLoginButtons kakaoLabel={copy.kakao} googleLabel={copy.google} next={next} />
        </div>
      </div>
    </div>
  );
}
