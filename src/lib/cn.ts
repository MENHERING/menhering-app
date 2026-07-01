// className 조건부 결합 유틸 (falsy 제거 후 공백 join)
export function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}
