import { z } from 'zod';

export function ApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    statusCode: z.number(),
    message: z.string(),
    data: dataSchema,
  });
}

export const ErrorResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  data: z.unknown().nullable(),
});

export type SuccessResponse<T extends z.ZodTypeAny> = z.infer<
  ReturnType<typeof ApiResponseSchema<T>>
>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
