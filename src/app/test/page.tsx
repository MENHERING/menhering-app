'use client';

import { useState } from 'react';

import { notFound } from 'next/navigation';

import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';
import { Section } from '@/components/common/Section';

export default function TestPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  const [clickCount, setClickCount] = useState(0);

  return (
    <main className="flex min-h-screen flex-col gap-5 bg-gray-50 px-4 py-16">
      {/* case 01 */}
      <Section shadow="custom" isBorder>
        <p className="p-4 text-sm text-gray-500">
          <code className="rounded bg-indigo-50 px-1 font-mono text-indigo-600">
            &lt;Section&gt;
          </code>{' '}
          요즘 감정상태를 ~~
        </p>
      </Section>
      {/* case 02 */}
      <Section shadow="md" isBorder className="border-amber-400">
        <p className="p-4 text-sm text-gray-500">
          <code className="rounded bg-indigo-50 px-1 font-mono text-indigo-600">
            &lt;Section&gt;
          </code>{' '}
          현재 스테이지
        </p>
      </Section>
      {/* case 03 */}
      <Section shadow="sm">
        <p className="p-4 text-sm text-gray-500">
          <code className="rounded bg-indigo-50 px-1 font-mono text-indigo-600">
            &lt;Section&gt;
          </code>{' '}
          멘헤링이
        </p>
      </Section>
      {/* case 04 */}
      <Section>
        <p className="p-4 text-sm text-gray-500">
          <code className="rounded bg-indigo-50 px-1 font-mono text-indigo-600">
            &lt;Section&gt;
          </code>{' '}
          멘헤링이
        </p>
      </Section>
      {/* case 05 */}
      <Section isBorder className="border-2 border-[#E8563A] bg-[#FFF3EC]">
        <p className="p-4 text-sm text-gray-500">
          <code className="rounded bg-indigo-50 px-1 font-mono text-indigo-600">
            &lt;Section&gt;
          </code>{' '}
          레드판다(나)
        </p>
      </Section>

      {/* case 06: Type A - 뒤로가기 + 타이틀 */}
      <Header title="Type A" leftType="back" />

      {/* case 07: Type B - 타이틀만 */}
      <Header title="Type B" leftType="none" />

      {/* case 08: Type C - 타이틀 + 닫기(오른쪽) */}
      <Header title="Type C" leftType="none" rightType="close" />

      {/* case 09: onLeftPress / onRightPress 클릭 동작 확인 */}
      <Header
        title={`클릭 ${clickCount}회`}
        leftType="back"
        onLeftPress={() => setClickCount((count) => count + 1)}
        rightType="close"
        onRightPress={() => setClickCount((count) => count + 1)}
      />

      {/* Footer (하단 탭바) — active 하이라이트는 실제 라우트에서 동작 (현재 경로 /test) */}
      <div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-2xl border border-gray-200">
        <Footer />
      </div>
    </main>
  );
}
