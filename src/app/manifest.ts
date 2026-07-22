import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '멘헤링',
    short_name: '멘헤링',
    description: '나만의 캐릭터와 함께하는 학습',
    display: 'standalone',
    start_url: '/',
    background_color: '#f7ede0',
    theme_color: '#f7ede0',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
