import { SerwistProvider } from '@serwist/turbopack/react';
import type { Metadata, Viewport } from 'next';

import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '멘헤링',
  description: '나만의 캐릭터와 함께하는 학습',
};

export const viewport: Viewport = {
  themeColor: '#f7ede0',
  width: 'device-width',
  initialScale: 1,
  // 저시력 사용자 확대 허용 (WCAG 1.4.4)
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="bg-sand text-plum flex min-h-full flex-col">
        {/* 개발 모드에선 sw 등록 요청이 turbopack의 온디맨드 컴파일과 경합해 500을 유발한다.
            (next-pwa 계열이 늘 dev에서 sw를 꺼두던 것과 같은 이유) 프로덕션에서만 등록한다. */}
        <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV !== 'production'}>
          <Providers>{children}</Providers>
        </SerwistProvider>
      </body>
    </html>
  );
}
