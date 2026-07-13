import type { Metadata } from 'next';

import { getMyAvatar } from './actions';
import { AvatarClient } from './AvatarClient';

export const metadata: Metadata = {
  title: '아바타',
};

export default async function AvatarPage() {
  const { avatar, coin } = await getMyAvatar();

  return <AvatarClient initialAvatar={avatar} initialCoin={coin} />;
}
