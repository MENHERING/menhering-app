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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
