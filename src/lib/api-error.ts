import { ErrorResponseSchema, type ErrorResponse } from '@/schemas/api-response.schema';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data: ErrorResponse['data'] = null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Route Handler catch 블록에서 NextResponse.json(body, { status })에 바로 꽂아 쓰기 위한 형태
export function toErrorResult(error: unknown): { body: ErrorResponse; status: number } {
  const apiError = error instanceof ApiError ? error : new ApiError(500, 'Internal Server Error');

  const body = ErrorResponseSchema.parse({
    statusCode: apiError.statusCode,
    message: apiError.message,
    data: apiError.data,
  });

  return { body, status: apiError.statusCode };
}
