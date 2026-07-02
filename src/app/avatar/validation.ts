import { z } from 'zod';

import { NICKNAME_MAX_LENGTH } from '@/constants/avatar';

// 저장 입력 검증. 값은 DB varchar(한글)와 1:1.
export const saveAvatarSchema = z.object({
  characterType: z.enum(['레서판다', '토끼', '강아지', '고양이']),
  colorTheme: z.enum(['클래식', '라벤더', '민트', '피치', '스카이', '선샤인']),
  nickname: z
    .string()
    .trim()
    .min(1, '닉네임을 입력해주세요.')
    .max(NICKNAME_MAX_LENGTH, `닉네임은 ${NICKNAME_MAX_LENGTH}자 이하로 입력해주세요.`),
});

export type SaveAvatarInput = z.infer<typeof saveAvatarSchema>;
