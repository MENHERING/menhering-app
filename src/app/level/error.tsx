'use client';

import { OnboardingError } from '@/components/intro/OnboardingError';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <OnboardingError error={error} reset={reset} />;
}
