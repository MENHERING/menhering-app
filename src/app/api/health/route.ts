import { NextResponse } from 'next/server';

import { toSuccessResult } from '@/lib/api-response';
import { HealthSchema } from '@/schemas/health.schema';

export async function GET() {
  const { body, status } = toSuccessResult(HealthSchema, {
    status: 'ok',
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(body, { status });
}
