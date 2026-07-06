import { Live2dPoc } from '@/app/live2d-poc/Live2dPoc';

// Live2D 검증용 격리 페이지 (spike). 실제 아바타 탭과 무관.
export default function Live2dPocPage() {
  return (
    <main className="min-h-screen">
      <h1 className="text-ink px-4 pt-6 text-center text-lg font-bold">Live2D POC</h1>
      <Live2dPoc />
    </main>
  );
}
