export interface Article {
  id: string;
  title: string;
  date: string;
  category: string;
  href: string;
}

export const articles: Article[] = [
  {
    id: 'article-1',
    title: '如何打造令人印象深刻的履歷',
    date: '2024 年 12 月 15 日',
    category: '求職技巧',
    href: '/articles/impressive-resume',
  },
  {
    id: 'article-2',
    title: '面試前必知的 5 個準備技巧',
    date: '2024 年 12 月 10 日',
    category: '面試準備',
    href: '/articles/interview-tips',
  },
  {
    id: 'article-3',
    title: '職涯轉換：從零開始的完整指南',
    date: '2024 年 12 月 5 日',
    category: '職涯發展',
    href: '/articles/career-transition',
  },
];

export const articlesCtaHref = '/articles';
