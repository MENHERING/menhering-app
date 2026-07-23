import webpush from 'web-push';

// setVapidDetails는 프로세스 전역 상태라 한 번만 설정한다. 모듈 로드 시 즉시 부르면 env 미설정 환경에서
// import만으로 throw나므로, 실제 발송 직전에 지연 초기화한다.
let configured = false;

function getWebPush() {
  if (!configured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );
    configured = true;
  }

  return webpush;
}

interface PushTarget {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// 서비스워커 push 핸들러가 JSON.parse해서 알림으로 그린다(title/body/url).
export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

// 한 구독에 알림을 보낸다. 만료(404/410)면 'expired'를 돌려줘 호출부가 그 구독을 정리하게 한다.
// 그 외 오류는 진짜 장애이므로 그대로 던진다.
export async function sendPush(
  target: PushTarget,
  payload: PushPayload,
): Promise<'sent' | 'expired'> {
  try {
    await getWebPush().sendNotification(
      { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
      JSON.stringify(payload),
    );

    return 'sent';
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;

    if (statusCode === 404 || statusCode === 410) return 'expired';

    throw error;
  }
}
