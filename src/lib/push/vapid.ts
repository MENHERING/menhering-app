// VAPID 공개키는 base64url 문자열인데, pushManager.subscribe의 applicationServerKey는
// Uint8Array(BufferSource)를 요구한다. base64url → 표준 base64(패딩 복원) → 바이트 배열로 변환한다.
// 반환 타입을 Uint8Array<ArrayBuffer>로 좁혀 pushManager.subscribe의 applicationServerKey(BufferSource)에
// 단언 없이 대입되게 한다(TS 5.7+ 타입드 어레이 제네릭이 기본 ArrayBufferLike라 그냥 Uint8Array면 불일치).
export function urlBase64ToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);

  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }

  return output;
}
