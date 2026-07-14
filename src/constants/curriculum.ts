// 커리큘럼 표시용 부제(장식 텍스트). DB(questions/user_progress)에는 난이도 라벨(level)만 있고
// 이런 타이틀은 저장하지 않아서, 화면 표시용으로만 프론트에 둔다.
export const CURRICULUM_TITLE: Record<string, string> = {
  입문: 'HTML/CSS 기초',
  초급: 'JavaScript 핵심',
  중급: 'React 실전',
  고급: '상태관리와 성능 최적화',
  전문가: '아키텍처와 엣지케이스',
};

// 레벨별 총 스테이지 수. questions 테이블에 등록된 콘텐츠 기준(정적 값).
// 문제 세트가 추가/축소되면 이 값도 같이 바꿔야 한다.
export const CURRICULUM_TOTAL_COUNT: Record<string, number> = {
  입문: 10,
  초급: 10,
  중급: 10,
  고급: 7,
  전문가: 7,
};
