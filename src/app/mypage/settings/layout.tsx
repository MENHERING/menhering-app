'use client';

import { useRouter } from 'next/navigation';

import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <Header title="설정" leftType="back" onLeftPress={() => router.back()} />
      {children}
      <Footer />
    </div>
  );
}
