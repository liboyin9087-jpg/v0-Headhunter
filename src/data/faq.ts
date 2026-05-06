export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    id: 'free-plan',
    question: 'Cake 是完全免費的嗎？',
    answer:
      '是的，我們提供完善的基礎方案供個人永久免費使用。若需要更強大的 AI 建議或多模板管理，可選擇訂閱 Pro 方案。',
  },
  {
    id: 'pdf-export',
    question: '我可以將履歷匯出成 PDF 嗎？',
    answer:
      '當然可以。我們支援高品質的 PDF、Word 匯出，並保證格式在各種裝置上皆能完美呈現。',
  },
  {
    id: 'data-security',
    question: '我的個資安全嗎？',
    answer:
      '我們採用最高等級的 AES-256 加密技術保護你的所有資料，且絕不未經授權與第三方分享你的隱私內容。',
  },
];
