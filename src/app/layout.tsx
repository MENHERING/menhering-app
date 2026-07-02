import type { Metadata, Viewport } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: '멘헤링',
  description: '나만의 캐릭터와 함께하는 학습',
};

export const viewport: Viewport = {
  themeColor: '#f7ede0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="bg-sand text-plum flex min-h-full flex-col">{children}</body>
    </html>
  );
}
