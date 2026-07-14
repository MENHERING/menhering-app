import { z } from 'zod';

import { ApiError } from '@/lib/api-error';
import { ApiResponseSchema, ErrorResponseSchema } from '@/schemas/api-response.schema';

interface CoreFetchOptions extends RequestInit {
  redirectOn401?: boolean;
}

async function coreFetch<T>(
  url: string,
  schema: z.ZodType<T>,
  { redirectOn401 = true, ...init }: CoreFetchOptions,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });

  if (res.status === 401 && redirectOn401 && typeof window !== 'undefined') {
    window.location.href = '/login';

    return new Promise(() => {});
  }

  if (!res.ok) {
    const { statusCode, message, data } = ErrorResponseSchema.parse(await res.json());

    throw new ApiError(statusCode, message, data);
  }

  const { data } = ApiResponseSchema(schema).parse(await res.json());

  return data;
}

// 로그인 불필요: 회원가입, 로그인, 헬스체크 등
export function publicFetch<T>(url: string, schema: z.ZodType<T>, init?: RequestInit) {
  return coreFetch(url, schema, { ...init, redirectOn401: false });
}

// 로그인 필요: 학습, 아바타, 마이페이지, 오답노트, 친구 등
export function privateFetch<T>(url: string, schema: z.ZodType<T>, init?: RequestInit) {
  return coreFetch(url, schema, { ...init, cache: 'no-store', redirectOn401: true });
}
