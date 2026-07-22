// 아바타 도메인 타입. DB(avatars/users) varchar 값과 1:1로 매칭되도록 한글 값을 그대로 사용한다.

export type CharacterType = '레서판다' | '토끼' | '강아지' | '고양이';

// 기본 = 틴트 없음(원화색 그대로). 레드~그레이는 구매 대상 색 테마.
export type ColorTheme =
  '기본' | '레드' | '라벤더' | '민트' | '피치' | '스카이' | '선샤인' | '그레이';

// 캐릭터 SVG에 주입되는 색 슬롯 (몸통 / 보조(배·얼굴) / 강조(눈·귀·윤곽))
export interface ThemeRoles {
  body: string;
  secondary: string;
  accent: string;
}

// 앱 도메인 모델. characterType/colorTheme은 avatars, nickname은 users.nickname에서 옴(조회 시 조인).
export interface Avatar {
  id: string;
  userId: string;
  characterType: CharacterType;
  colorTheme: ColorTheme;
  nickname: string;
  createdAt: string;
  updatedAt: string;
}
