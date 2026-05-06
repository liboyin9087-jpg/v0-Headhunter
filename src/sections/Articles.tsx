import { useEffect, useRef, useState } from 'react';
import { articles, articlesCtaHref } from '@/data/articles';

type AnimatedElement = 'cover' | 'header' | `article-${number}` | 'cta';

export default function Articles() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animatedElements, setAnimatedElements] = useState<Set<AnimatedElement>>(
    new Set()
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger staggered animation
            const newAnimated = new Set<AnimatedElement>();

            // Animate cover
            setTimeout(() => {
              newAnimated.add('cover');
              setAnimatedElements((prev) => new Set([...prev, 'cover']));
            }, 0);

            // Animate header
            setTimeout(() => {
              newAnimated.add('header');
              setAnimatedElements((prev) => new Set([...prev, 'header']));
            }, 150);

            // Animate articles
            articles.forEach((_, index) => {
              setTimeout(() => {
                const key = `article-${index}` as const;
                newAnimated.add(key);
                setAnimatedElements((prev) => new Set([...prev, key]));
              }, 300 + index * 150);
            });

            // Animate CTA
            setTimeout(() => {
              newAnimated.add('cta');
              setAnimatedElements((prev) => new Set([...prev, 'cta']));
            }, 300 + articles.length * 150);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const isAnimated = (key: AnimatedElement) => animatedElements.has(key);

  return (
    <section
      id="articles"
      ref={sectionRef}
      className="py-32 bg-[#fdfdfd]"
      aria-labelledby="articles-heading"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Magazine Cover */}
          <div
            className="lg:col-span-5 transition-all duration-800 ease-out"
            style={{
              opacity: isAnimated('cover') ? 1 : 0,
              transform: isAnimated('cover') ? 'translateY(0)' : 'translateY(40px)',
            }}
          >
            <div
              className="relative overflow-hidden rounded-3xl shadow-2xl"
              role="img"
              aria-label="Cake Magazine Cover"
            >
              <img
                src="/images/magazine-cover.jpg"
                alt="Cake Magazine Cover"
                className="w-full h-auto object-cover"
                style={{ aspectRatio: '3/4' }}
                loading="lazy"
              />
            </div>
          </div>

          {/* Articles List */}
          <div className="lg:col-span-7">
            {/* Header */}
            <div
              className="mb-8 transition-all duration-800 ease-out"
              style={{
                opacity: isAnimated('header') ? 1 : 0,
                transform: isAnimated('header') ? 'translateY(0)' : 'translateY(40px)',
              }}
            >
              <p className="text-xs font-medium uppercase tracking-widest mb-3 text-[var(--accent-gradient-start)]">
                Cake Magazine
              </p>
              <h2
                id="articles-heading"
                className="font-serif-display font-bold text-black"
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 48px)',
                  lineHeight: '1.1',
                  letterSpacing: '-1px',
                }}
              >
                職涯靈感與洞察
              </h2>
            </div>

            {/* Articles Grid */}
            <div className="flex flex-col gap-0" role="list" aria-label="文章列表">
              {articles.map((article, index) => (
                <a
                  key={article.id}
                  href={article.href}
                  role="listitem"
                  className="group py-6 block border-b border-black/8 hover:bg-black/2 transition-all duration-300 px-0"
                  style={{
                    opacity: isAnimated(`article-${index}` as const) ? 1 : 0,
                    transform: isAnimated(`article-${index}` as const)
                      ? 'translateY(0)'
                      : 'translateY(40px)',
                    transitionDuration: '800ms',
                    transitionTimingFunction: 'ease-out',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[rgba(99,61,192,0.08)] text-[var(--accent-gradient-start)]">
                          {article.category}
                        </span>
                        <span className="text-xs text-black/40">{article.date}</span>
                      </div>
                      <h3 className="font-medium text-lg leading-snug text-black group-hover:underline underline-offset-4 decoration-1">
                        {article.title}
                      </h3>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="shrink-0 mt-1 text-black/30 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div
              className="mt-8 transition-all duration-800 ease-out"
              style={{
                opacity: isAnimated('cta') ? 1 : 0,
                transform: isAnimated('cta') ? 'translateY(0)' : 'translateY(40px)',
              }}
            >
              <a
                href={articlesCtaHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-black hover:opacity-90 transition-opacity duration-300"
              >
                閱讀更多文章
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
