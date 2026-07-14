import { z } from 'zod';

import { CHARACTER_TYPES, COLOR_THEME_VALUES, NICKNAME_MAX_LENGTH } from '@/constants/avatar';

// 저장 입력 검증. enum 값은 상수(단일 출처)에서 파생해 스키마-상수 드리프트를 방지한다.
export const saveAvatarSchema = z.object({
  characterType: z.enum(CHARACTER_TYPES),
  colorTheme: z.enum(COLOR_THEME_VALUES),
  nickname: z
    .string()
    .trim()
    .min(1, '닉네임을 입력해주세요.')
    .max(NICKNAME_MAX_LENGTH, `닉네임은 ${NICKNAME_MAX_LENGTH}자 이하로 입력해주세요.`),
});

export type SaveAvatarInput = z.infer<typeof saveAvatarSchema>;

// 구매 입력 검증. kind에 따라 허용 value가 달라지므로 discriminated union으로 묶는다.
// 서버 RPC(_avatar_item_valid)도 같은 화이트리스트를 재검증한다(방어적 이중 검증).
export const buyAvatarItemSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('character'), value: z.enum(CHARACTER_TYPES) }),
  z.object({ kind: z.literal('theme'), value: z.enum(COLOR_THEME_VALUES) }),
]);

export type BuyAvatarItemInput = z.infer<typeof buyAvatarItemSchema>;

// 보유 목록 RPC(get_my_avatar_items) 응답 검증. DB 함수 변경(필드명 오타 등)으로 형태가
// 어긋나면 파싱 단계에서 즉시 잡아 폴백한다. item_value는 상수 화이트리스트로 좁히지 않는다
// — 신규 항목이 조회에서 통째로 탈락하지 않도록(장착 가능 여부는 다운스트림에서 판단).
export const inventoryRowsSchema = z.array(
  z.object({
    item_kind: z.string(),
    item_value: z.string(),
  }),
);
