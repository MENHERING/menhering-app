import { notFound } from 'next/navigation';

import { Button } from '@/components/common/Button';

import { ToggleDemo } from './ToggleDemo';

// 공통 Button/Toggle 확인용 데모 (개발 환경 전용 — 프로덕션 404)
export default function ButtonTestPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 bg-gray-50 px-4 py-16">
      <Group title="variant (lg)">
        <Button variant="primary">초급으로 시작</Button>
        <Button variant="secondary">직접 다시 고르기</Button>
        <Button variant="outline">복사</Button>
        <Button variant="ghost">더보기</Button>
      </Group>

      <Group title="size">
        <Button size="sm">수락</Button>
        <Button size="md">중간</Button>
        <Button size="lg">저장하기</Button>
      </Group>

      <Group title="isFullWidth + rightIcon">
        <Button isFullWidth rightIcon={<span>→</span>}>
          미복습 문제 한 번에 풀기
        </Button>
      </Group>

      <Group title="state">
        <Button disabled>disabled</Button>
        <Button isLoading>loading</Button>
        <Button variant="outline" size="sm">
          거절
        </Button>
      </Group>

      <Group title="Toggle">
        <ToggleDemo />
      </Group>
    </main>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-bold text-gray-500 uppercase">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}
