import { Footer } from '@/components/common/Footer';

export default function QuizResultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <main className="flex flex-1 flex-col justify-center gap-8 py-12">{children}</main>

      <Footer />
    </div>
  );
}
