'use client';

import { useRouter } from 'next/navigation';

import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <Header title="친구 랭킹" leftType="back" onLeftPress={() => router.back()} />

      <main className="flex-1 space-y-6 py-4">{children}</main>

      <Footer />
    </div>
  );
}
