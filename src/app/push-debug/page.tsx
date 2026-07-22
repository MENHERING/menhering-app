import type { Metadata } from 'next';

import { PushDebugClient } from '@/app/push-debug/PushDebugClient';

export const metadata: Metadata = {
  title: '푸시 디버그',
};

// Phase 1(푸시 구독 인프라) 검증용 임시 페이지. iOS는 설치 PWA + HTTPS(배포본)에서만 푸시가 되므로
// 실기기 확인을 위해 배포 환경에서도 접근 가능하게 둔다. 설정 토글 연동(Phase 2) 후 제거 예정.
export default function PushDebugPage() {
  return <PushDebugClient />;
}
