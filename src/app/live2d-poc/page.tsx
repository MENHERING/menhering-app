import { Live2dPoc } from '@/app/live2d-poc/Live2dPoc';

// 우리가 만든 Live2D 레서판다 미리보기 페이지. 색 리워크(B) 전까지 메인 탭과 분리해 여기서 확인한다.
export default function Live2dPocPage() {
  return (
    <main className="min-h-screen">
      <h1 className="text-ink px-4 pt-6 text-center text-lg font-bold">레서판다 미리보기</h1>
      <Live2dPoc />
    </main>
  );
}
