// LearningPage가 만드는 스테이지 id(`${level}-${stage}`, 예: "중급-3")를 되돌린다.
// level 자체엔 하이픈이 없으니 마지막 하이픈을 기준으로 나눈다.
export function parseLessonId(rawLessonId: string) {
  // useParams()의 동적 세그먼트는 퍼센트 인코딩된 채로 넘어온다(예: "%EC%A4%91...-3").
  // 디코딩 없이 쓰면 이후 encodeURIComponent가 이중 인코딩을 만든다.
  const lessonId = decodeURIComponent(rawLessonId);
  const separatorIndex = lessonId.lastIndexOf('-');
  const level = lessonId.slice(0, separatorIndex);
  const stage = Number(lessonId.slice(separatorIndex + 1));

  return { level, stage };
}
