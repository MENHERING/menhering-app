import type { Metadata } from 'next';

import { getMyAvatar, getMyAvatarItems } from './actions';
import { AvatarClient } from './AvatarClient';

export const metadata: Metadata = {
  title: '아바타',
};

export default async function AvatarPage() {
  // 아바타+코인(getMyAvatar)과 보유 목록(getMyAvatarItems)을 병렬 조회해 왕복 지연을 겹친다.
  const [{ avatar, coin }, owned] = await Promise.all([getMyAvatar(), getMyAvatarItems()]);

  return <AvatarClient initialAvatar={avatar} initialCoin={coin} initialOwned={owned} />;
}
