import { DizzyShape } from '@/components/avatar/DizzyShape';
import { HeartShape } from '@/components/avatar/HeartShape';
import { NoteShape } from '@/components/avatar/NoteShape';
import { TearShape } from '@/components/avatar/TearShape';
import { VeinShape } from '@/components/avatar/VeinShape';
import type { Mood } from '@/types/mypage/model';

interface TapSymbolProps {
  /** 생략(감정 미확정) 시 하트 — 기존 동작과 같다. */
  mood?: Mood;
  /** HeartShape의 그라데이션 id. 문서 전역이라 인스턴스마다 달라야 한다(호출부가 useId로 생성). */
  gradientId: string;
}

/**
 * 캐릭터를 탭했을 때 떠오르는 심볼. 평상시 심볼(MoodSymbol)과 같은 도형을 공유하되,
 * MoodSymbol이 비워두는 보통·지침에도 전용 심볼을 둔다 — 여긴 감정 표시가 아니라 탭에 대한
 * 반응이라, 심볼이 없으면 탭이 씹힌 것처럼 느껴지기 때문이다.
 *
 * 감정별 도형을 여기 한 곳에 모아, 탭 오버레이(Live2DCharacter)는 배치·애니메이션만 맡는다.
 */
export function TapSymbol({ mood, gradientId }: TapSymbolProps) {
  switch (mood) {
    case '우울':
      return <TearShape />;
    case '화남':
      return <VeinShape />;
    case '보통':
      return <NoteShape />;
    case '지침':
      return <DizzyShape />;
    // 행복과 감정 미확정(undefined)은 하트.
    case '행복':
    default:
      return <HeartShape gradientId={gradientId} />;
  }
}
