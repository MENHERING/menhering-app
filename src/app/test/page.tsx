import { notFound } from 'next/navigation';

import { Section } from '@/components/common/Section';

export default function TestPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

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
    </main>
  );
}
