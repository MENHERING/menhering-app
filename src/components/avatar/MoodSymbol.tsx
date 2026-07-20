'use client';

import { useId } from 'react';

import { HeartShape } from '@/components/avatar/HeartShape';
import { TearShape } from '@/components/avatar/TearShape';
import { VeinShape } from '@/components/avatar/VeinShape';
import type { MoodSymbolAnchors } from '@/constants/character-registry';
import { cn } from '@/lib/cn';
import type { Mood } from '@/types/mypage/model';

// 감정 상태를 만화적 심볼로 캐릭터 "앞"에 덧그린다. 얼굴이 히어로에서 288px이라 눈썹 회전·눈뜸
// 같은 미세 표정이 뭉개진다(우울/지침이 거의 동일하게 보임) → 심볼이 실질적인 감정 채널이다.
//
// 캔버스와 형제인 절대배치 오버레이라 Live2D 모델을 재리깅하지 않는다.
// 위치는 캐릭터마다 실루엣이 달라 CHARACTER_REGISTRY의 moodAnchors(캔버스 % 기준 Tailwind 클래스)로
// 주입받는다 — 여기 좌표를 박으면 두 번째 캐릭터가 올라올 때 하트가 허공에 뜬다.
//
// 아트 규약: 캐릭터와 같은 두꺼운 자주색(plum) 외곽선 + 전용 심볼 색을 채운다.
// UI 아이콘(얇은 stroke)처럼 그리면 캐릭터 위에서 이물감이 생긴다.
// ⚠️ 뱃지용 `--*-soft` 토큰을 채움색으로 쓰지 말 것 — 어두운 글자 뒤 배경색이라 채도가 낮다.
// (blue-soft는 파랑이 아니라 페리윙클이라 눈물이 보라로 보였고, 지침의 purple-soft와도 충돌했다.)
//
// 지침은 여기 심볼이 없다 — 배경 세로 해칭(MoodBackdrop)이 담당한다.
// 화남은 관자놀이 핏줄만 쓴다(정수리 불꽃은 시안 검토 후 제외). 보통은 심볼 없음.
// ⚠️ 머리 위 top-[12%] 부근은 탭 반응 하트가 솟는 자리다(Live2DCharacter). 새 심볼을 거기 두지 말 것.

const OVERLAY_BASE = 'pointer-events-none absolute';

interface MoodSymbolProps {
  mood?: Mood;
  /** 캐릭터별 심볼 위치(CHARACTER_REGISTRY.live2d.moodAnchors). */
  anchors: MoodSymbolAnchors;
}

export function MoodSymbol({ mood, anchors }: MoodSymbolProps) {
  // 한 페이지에 아바타가 둘 이상 뜨면 고정 id가 중복돼, 두 하트가 모두 첫 인스턴스의
  // 그라데이션으로 칠해진다(문서 순서상 첫 정의가 이긴다). 인스턴스별 접두사로 막는다.
  // useId 결과에 콜론이 섞일 수 있어 지운다(url(#...) 참조 안전).
  const symbolId = useId().replace(/:/g, '');

  if (!mood) return null;

  // switch + never 가드: Mood에 감정이 추가되면 여기서 컴파일 에러가 난다.
  // if 체인으로 두면 새 감정이 조용히 "심볼 없음"으로 렌더된다.
  switch (mood) {
    case '행복':
      return (
        <>
          {/* 얼굴 양옆 배경에 뜬 하트. 좌우 위상을 엇갈리게 하면 늘 다른 높이에 떠서
              짝이 안 맞아 보인다 → 같이 뛴다. */}
          <span className={cn('animate-heart-bob', OVERLAY_BASE, anchors.heartLeft)}>
            <HeartShape gradientId={`${symbolId}-heart-left`} />
          </span>
          <span className={cn('animate-heart-bob', OVERLAY_BASE, anchors.heartRight)}>
            <HeartShape gradientId={`${symbolId}-heart-right`} />
          </span>
        </>
      );

    case '우울':
      return (
        // 눈가에서 맺혀 볼을 타고 흘러내린다. pointer-events-none으로 캐릭터 탭을 막지 않는다.
        <span className={cn('animate-tear-drop', OVERLAY_BASE, anchors.tear)}>
          <TearShape />
        </span>
      );

    case '화남':
      return (
        <span className={cn('animate-vein-pulse', OVERLAY_BASE, anchors.vein)}>
          <VeinShape />
        </span>
      );

    // 보통은 심볼 없음(대비의 기준선), 지침은 배경 세로 해칭(MoodBackdrop)이 담당한다.
    case '보통':
    case '지침':
      return null;

    default: {
      const unhandled: never = mood;
      return unhandled;
    }
  }
}
