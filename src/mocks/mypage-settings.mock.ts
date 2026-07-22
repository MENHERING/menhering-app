import type { SettingsSection } from '@/types/mypage/settings';

export const MOCK_SETTINGS_SECTIONS: SettingsSection[] = [
  {
    title: '알림',
    toggles: [
      {
        id: 'learning-reminder',
        icon: 'bell',
        iconClassName: 'bg-red-soft',
        title: '학습 리마인더',
        description: '매일 정해진 시간에 알림',
        defaultChecked: true,
      },
      {
        id: 'mascot-mood',
        icon: 'paw',
        iconClassName: 'bg-purple-soft',
        title: '마스코트 감정 알림',
        description: '레서판다 기분이 변할 때 알려줘요',
        defaultChecked: true,
      },
      {
        id: 'friend-ranking',
        icon: 'trophy',
        iconClassName: 'bg-yellow-soft',
        title: '친구 · 랭킹 알림',
        description: '친구 요청과 순위 변동',
        defaultChecked: false,
      },
    ],
  },
  {
    title: '사운드 & 진동',
    toggles: [
      {
        id: 'sfx',
        icon: 'volume',
        iconClassName: 'bg-settings-icon-sound text-white',
        title: '효과음',
        defaultChecked: true,
      },
      {
        id: 'bgm',
        icon: 'music',
        iconClassName: 'bg-settings-icon-music',
        title: '배경 음악',
        defaultChecked: false,
      },
      {
        id: 'vibration',
        icon: 'vibrate',
        iconClassName: 'bg-yellow-soft',
        title: '진동',
        defaultChecked: true,
      },
    ],
  },
  {
    title: '화면',
    toggles: [
      {
        id: 'dark-mode',
        icon: 'moon',
        iconClassName: 'bg-settings-icon-dark text-white',
        title: '다크 모드',
        defaultChecked: false,
      },
    ],
    showFontSize: true,
  },
  {
    title: '정보',
    infoItems: [
      {
        id: 'help',
        icon: 'help',
        iconClassName: 'bg-coral-accent text-white',
        title: '도움말 · 문의',
      },
      {
        id: 'terms',
        icon: 'file',
        iconClassName: 'bg-settings-icon-music',
        title: '약관 · 개인정보 처리방침',
      },
      {
        id: 'version',
        icon: 'info',
        iconClassName: 'bg-blue-soft',
        title: '버전 정보',
        trailing: 'v1.0.0 · 최신',
      },
    ],
  },
];
