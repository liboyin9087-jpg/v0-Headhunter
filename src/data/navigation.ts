export interface NavLink {
  label: string;
  href: string;
  ariaLabel?: string;
}

export const navLinks: NavLink[] = [
  { label: '首頁', href: '/', ariaLabel: '返回首頁' },
  { label: '文章', href: '/#articles', ariaLabel: '查看文章' },
  { label: '求職', href: '/job-search', ariaLabel: '開始求職' },
  { label: '履歷', href: '/resume', ariaLabel: '管理履歷' },
  { label: '企業徵才', href: '/hiring', ariaLabel: '企業徵才平台' },
];

export const ctaLinks = {
  login: { label: '登入', href: '/login', ariaLabel: '登入帳戶' },
  signup: { label: '免費註冊', href: '/signup', ariaLabel: '免費註冊帳戶' },
};

export const brandName = 'Cake';
