import type { Metadata } from 'next';

import { getMyAvatar } from '@/app/avatar/actions';
import { HomeScreen } from '@/components/home/HomeScreen';
import { getHomeSummary } from '@/lib/home/queries';

export const metadata: Metadata = {
  title: '홈',
};

export default async function HomePage() {
  // 통계와 아바타는 서로 독립적인 조회라 병렬로 가져온다.
  const [summary, { avatar }] = await Promise.all([getHomeSummary(), getMyAvatar()]);

  return (
    <HomeScreen
      summary={summary}
      avatar={{
        characterType: avatar.characterType,
        colorTheme: avatar.colorTheme,
        nickname: avatar.nickname,
      }}
    />
  );
}
