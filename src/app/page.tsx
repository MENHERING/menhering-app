import { SplashScreen } from '@/components/intro/SplashScreen';

// "/" 진입점 — 현재는 스플래시 퍼블리싱.
// TODO: Supabase 세션 확인 후 분기 (세션 없음 → /login, level 없음 → /level-test, 있음 → /home)
export default function Page() {
  return <SplashScreen />;
}

// import AvatarCustomizer from '@/components/common/RedPandaAvatar';
// export default function Page() {
//   return (
//     <div className="flex min-h-dvh items-center justify-center p-6">
//       <AvatarCustomizer />
//     </div>
//   );
// }
