export interface HeroContent {
  heading: string;
  subheading: string;
  description: string;
  primaryCta: {
    label: string;
    href: string;
    ariaLabel: string;
  };
  secondaryCta: {
    label: string;
    href: string;
    ariaLabel: string;
  };
  badge: {
    text: string;
    ariaLabel: string;
  };
  image: {
    src: string;
    alt: string;
  };
}

export const heroContent: HeroContent = {
  heading: '找到你的理想職位',
  subheading: '智能求職助手',
  description: '使用 AI 驅動的履歷優化和職位匹配，讓你的求職之旅更加順利。',
  primaryCta: {
    label: '立即開始',
    href: '/signup',
    ariaLabel: '立即開始使用 Cake',
  },
  secondaryCta: {
    label: '瞭解更多',
    href: '/#about',
    ariaLabel: '瞭解更多關於 Cake',
  },
  badge: {
    text: '5M+',
    ariaLabel: '超過 500 萬用戶',
  },
  image: {
    src: '/images/hero-main.jpg',
    alt: 'Hero banner image',
  },
};
