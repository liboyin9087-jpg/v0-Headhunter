import { useEffect, useRef, useState } from 'react';
import { partners } from '@/data/partners';

export default function Partners() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animatedIds, setAnimatedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger staggered animation
            const newAnimatedIds = new Set<string>();
            partners.forEach((partner, index) => {
              setTimeout(() => {
                newAnimatedIds.add(partner.id);
                setAnimatedIds((prev) => new Set([...prev, partner.id]));
              }, index * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-12 border-y border-black/8 bg-[#fdfdfd]"
      aria-labelledby="partners-heading"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <p
            id="partners-heading"
            className="text-xs font-medium uppercase tracking-widest shrink-0 text-black/40"
          >
            全球頂尖企業合作夥伴
          </p>

          <div
            className="flex flex-wrap justify-center md:justify-start items-center gap-8 md:gap-12 flex-1"
            role="list"
            aria-label="合作夥伴列表"
          >
            {partners.map((partner) => {
              const isAnimated = animatedIds.has(partner.id);
              return (
                <div
                  key={partner.id}
                  role="listitem"
                  className="text-xl font-bold text-black transition-all duration-600 ease-out"
                  style={{
                    opacity: isAnimated ? 0.6 : 0,
                    filter: 'grayscale(1)',
                    transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
                  }}
                >
                  {partner.name}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
