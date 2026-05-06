import { useState } from 'react';
import { faqItems } from '@/data/faq';

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section
      id="faq"
      className="py-24 bg-[#fdfdfd] border-t border-black/6"
      aria-labelledby="faq-heading"
    >
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-14">
          <h2
            id="faq-heading"
            className="font-serif-display font-bold text-black"
            style={{
              fontSize: 'clamp(28px, 3.5vw, 48px)',
              lineHeight: '1.1',
              letterSpacing: '-1px',
            }}
          >
            常見問題
          </h2>
        </div>

        <div className="space-y-0" role="region" aria-label="常見問題列表">
          {faqItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="border-b border-black/10 last:border-b-0"
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full flex items-center justify-between py-6 px-0 hover:bg-black/2 transition-colors text-left"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.id}`}
                  id={`faq-question-${item.id}`}
                >
                  <h3 className="text-lg font-medium text-black pr-8 flex-1">
                    {item.question}
                  </h3>
                  <span
                    className="shrink-0 text-2xl font-light text-black/40 transition-transform duration-300"
                    aria-hidden="true"
                    style={{
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                  >
                    +
                  </span>
                </button>

                <div
                  id={`faq-answer-${item.id}`}
                  className="overflow-hidden transition-all duration-500"
                  style={{
                    maxHeight: isOpen ? '200px' : '0px',
                    opacity: isOpen ? 1 : 0,
                  }}
                  role="region"
                  aria-labelledby={`faq-question-${item.id}`}
                >
                  <p className="pb-6 leading-relaxed text-black/55 text-sm">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
