import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase/client';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
      router.push(ROUTES.LOGIN);
      router.refresh();
    },
  });
}
