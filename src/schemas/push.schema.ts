import { z } from 'zod';

// 브라우저 PushSubscription.toJSON()에서 서버가 쓰는 필드만 검증한다.
// (endpoint = 발송 대상 URL, keys.p256dh/auth = 페이로드 암호화 재료)
export const PushSubscriptionInputSchema = z.object({
  // 푸시 서비스 endpoint는 항상 HTTPS다. http는 위조·평문 발송 시도로 보고 거부한다.
  endpoint: z.string().url().startsWith('https://'),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export type PushSubscriptionInput = z.infer<typeof PushSubscriptionInputSchema>;

// 구독 해제 요청 — endpoint로 본인 구독 행을 지운다.
export const PushUnsubscribeInputSchema = z.object({
  endpoint: z.string().url().startsWith('https://'),
});

export type PushUnsubscribeInput = z.infer<typeof PushUnsubscribeInputSchema>;

// 구독/해제 결과. 현재 구독 상태만 내려준다.
export const PushSubscribeResultSchema = z.object({
  subscribed: z.boolean(),
});

export type PushSubscribeResult = z.infer<typeof PushSubscribeResultSchema>;

// 디버그 테스트 발송 결과 — 성공/정리(만료 구독 삭제) 건수.
export const PushTestResultSchema = z.object({
  sent: z.number().int(),
  pruned: z.number().int(),
});

export type PushTestResult = z.infer<typeof PushTestResultSchema>;

// 학습 리마인더 스케줄 발송 결과 — 성공/정리(만료 구독 삭제) 건수.
export const PushReminderResultSchema = z.object({
  sent: z.number().int(),
  pruned: z.number().int(),
});

export type PushReminderResult = z.infer<typeof PushReminderResultSchema>;
