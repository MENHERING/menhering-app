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
