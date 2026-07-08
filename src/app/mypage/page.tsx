import { Footer } from '@/components/common/Footer';
import { MyPageScreen } from '@/components/mypage/MyPageScreen';

export default function MyPagePage() {
  return (
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <MyPageScreen />
      <Footer />
    </div>
  );
}
