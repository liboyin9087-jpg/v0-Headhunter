export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  id: string;
  name: string;
  href: string;
  icon: string; // SVG or emoji
}

export const footerColumns: FooterColumn[] = [
  {
    title: '產品',
    links: [
      { label: '履歷生成器', href: '/resume-builder' },
      { label: '職位匹配', href: '/job-match' },
      { label: '面試準備', href: '/interview-prep' },
      { label: '定價', href: '/pricing' },
    ],
  },
  {
    title: '資源',
    links: [
      { label: '部落格', href: '/blog' },
      { label: '指南', href: '/guides' },
      { label: '常見問題', href: '/#faq' },
      { label: '社群', href: '/community' },
    ],
  },
  {
    title: '支援',
    links: [
      { label: '聯絡我們', href: '/contact' },
      { label: '隱私政策', href: '/privacy' },
      { label: '服務條款', href: '/terms' },
      { label: '狀態頁面', href: '/status' },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  {
    id: 'social-twitter',
    name: 'Twitter',
    href: 'https://twitter.com',
    icon: '𝕏',
  },
  {
    id: 'social-linkedin',
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: 'in',
  },
  {
    id: 'social-github',
    name: 'GitHub',
    href: 'https://github.com',
    icon: '⚙️',
  },
];

export const footerBrand = {
  name: 'Cake',
  tagline: '讓求職變得簡單',
  copyright: `© ${new Date().getFullYear()} Cake. 保留所有權利。`,
};

export const languages = [
  { code: 'zh-TW', label: '繁體中文', isActive: true },
  { code: 'en-US', label: 'English', isActive: false },
];
