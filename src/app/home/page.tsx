import type { Metadata } from 'next';

import { HomeScreen } from '@/components/home/HomeScreen';
import { getHomeSummary } from '@/lib/home/queries';

export const metadata: Metadata = {
  title: '홈',
};

export default async function HomePage() {
  const summary = await getHomeSummary();

  return <HomeScreen summary={summary} />;
}
