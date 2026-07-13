import { create } from 'zustand';

// 페이지 이탈 가드용 전역 플래그. 편집 중인 화면(예: 아바타 탭)이 자신의 dirty 상태를
// 여기에 반영하면, 공용 Footer 등 네비게이션 측이 도메인을 모른 채 이탈 경고를 띄울 수 있다.
interface UnsavedChangesState {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
}

export const useUnsavedChangesStore = create<UnsavedChangesState>((set) => ({
  hasUnsavedChanges: false,
  setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
}));
