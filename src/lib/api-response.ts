import { z } from 'zod';

import { ApiResponseSchema, SuccessResponse } from '@/schemas/api-response.schema';

// Route Handler에서 NextResponse.json(body, { status })에 바로 꽂아 쓰기 위한 형태
export function toSuccessResult<T extends z.ZodTypeAny>(
  dataSchema: T,
  data: z.infer<T>,
  message = 'OK',
  statusCode = 200,
): { body: SuccessResponse<T>; status: number } {
  const body = ApiResponseSchema(dataSchema).parse({ statusCode, message, data });

  return { body, status: statusCode };
}
