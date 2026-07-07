import { BookOpen, UserPlus, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/common/Button';

type RankingEmptyStateVariant = 'no-friends' | 'not-started';

interface RankingEmptyStateProps {
  variant: RankingEmptyStateVariant;
  // 'not-started'일 때만 사용(학습 화면으로 이동).
  onStartLearning?: () => void;
}

const CONTENT: Record<
  RankingEmptyStateVariant,
  { Icon: LucideIcon; title: string; description: string }
> = {
  'no-friends': {
    Icon: UserPlus,
    title: '아직 친구가 없어요',
    description: '친구를 추가하면 함께 랭킹을 확인할 수 있어요.',
  },
  'not-started': {
    Icon: BookOpen,
    title: '아직 학습을 시작하지 않았어요',
    description: '학습을 시작하면 친구들과 순위를 겨룰 수 있어요.',
  },
};

export function RankingEmptyState({ variant, onStartLearning }: RankingEmptyStateProps) {
  const { Icon, title, description } = CONTENT[variant];

  return (
    <div className="mx-5 flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-12 text-center shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="bg-coral-soft/40 flex size-16 items-center justify-center rounded-full">
        <Icon size={28} className="text-coral" />
      </div>

      <p className="text-ink text-base font-bold">{title}</p>
      <p className="text-brown-soft text-sm">{description}</p>

      {variant === 'not-started' ? (
        <Button variant="primary" size="md" onClick={onStartLearning} className="mt-2">
          학습 시작하기
        </Button>
      ) : (
        // 친구 추가 화면이 아직 없어 버튼은 비활성 상태로만 노출한다.
        // TODO: 친구 추가 화면 연결 후 활성화
        <Button variant="secondary" size="md" disabled className="mt-2">
          친구 추가하기
        </Button>
      )}
    </div>
  );
}
