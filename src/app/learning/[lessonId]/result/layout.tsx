import { Footer } from '@/components/common/Footer';

export default function QuizResultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <main className="flex flex-1 flex-col gap-6 py-10">{children}</main>

      <Footer />
    </div>
  );
}
