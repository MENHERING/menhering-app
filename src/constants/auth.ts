// 로그인 실패 안내. OAuth 콜백(app/auth/**)이 실패 시 `/login?error=<code>`로 되돌려보내는데,
// 로그인 화면이 이 코드를 문구로 바꿔 배너에 띄운다. 새 실패 사유가 생기면 여기에 코드를 추가한다.
export const LOGIN_ERROR_MESSAGES = {
  auth: '로그인에 실패했어요. 잠시 후 다시 시도해 주세요.',
} as const;

export type LoginErrorCode = keyof typeof LOGIN_ERROR_MESSAGES;

// 쿼리로 넘어온 임의 문자열을 안전하게 안내 문구로 바꾼다. 모르는 코드는 null(배너 미표시).
export function getLoginErrorMessage(code: string | undefined | null): string | null {
  if (!code) return null;

  return code in LOGIN_ERROR_MESSAGES ? LOGIN_ERROR_MESSAGES[code as LoginErrorCode] : null;
}
