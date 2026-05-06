export interface FeatureCard {
  id: string;
  icon: string; // SVG or emoji
  title: string;
  description: string;
  backgroundImage?: string;
}

export const featureCards: FeatureCard[] = [
  {
    id: 'feature-ai-resume',
    icon: '✨',
    title: 'AI 履歷優化',
    description: '使用先進的 AI 技術自動優化你的履歷，提高錄取率。',
    backgroundImage: '/images/card-bg-1.jpg',
  },
  {
    id: 'feature-job-match',
    icon: '🎯',
    title: '智能職位匹配',
    description: '根據你的技能和經驗，推薦最適合的職位。',
    backgroundImage: '/images/card-bg-2.jpg',
  },
  {
    id: 'feature-interview-prep',
    icon: '💼',
    title: '面試準備',
    description: '獲得個性化的面試準備建議和模擬面試。',
  },
];
