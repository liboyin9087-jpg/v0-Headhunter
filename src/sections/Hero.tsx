import { useEffect, useRef, useState, useCallback } from 'react';
import { heroContent } from '@/data/hero';

export default function Hero() {
  const imageRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Store the mouse position
    mousePosRef.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    };

    // Use requestAnimationFrame to batch updates
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      setMousePos(mousePosRef.current);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove]);

  return (
    <section
      className="relative min-h-screen flex items-center pt-20 bg-[#fdfdfd]"
      aria-labelledby="hero-heading"
    >
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text Column */}
          <div className="lg:col-span-7 relative z-10">
            <h1
              id="hero-heading"
              className="font-serif-display font-bold leading-none text-black"
              style={{
                fontSize: 'clamp(40px, 6vw, 96px)',
                lineHeight: '0.95',
                letterSpacing: '-2px',
              }}
            >
              用數據驅動你的
              <br />
              <span className="text-[var(--accent-gradient-start)]">Cake</span>
              <br />
              職業生涯
            </h1>

            <p
              className="mt-8 max-w-lg leading-relaxed text-black/55"
              style={{
                fontSize: '18px',
                letterSpacing: '0.3px',
              }}
            >
              全球 500 萬求職者信賴的履歷工具。我們不只幫你寫履歷，更幫你找到理想的工作契機。
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <a
                href={heroContent.primaryCta.href}
                className="gradient-btn text-white font-semibold px-8 py-4 rounded-2xl text-base inline-flex items-center gap-2 hover:shadow-lg transition-shadow"
                aria-label={heroContent.primaryCta.ariaLabel}
              >
                {heroContent.primaryCta.label}
                <svg
                  width="18"
                  height="18"
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
              <a
                href={heroContent.secondaryCta.href}
                className="font-medium px-8 py-4 rounded-2xl text-base inline-flex items-center gap-2 text-black border border-black/15 hover:bg-black/5 transition-colors"
                aria-label={heroContent.secondaryCta.ariaLabel}
              >
                {heroContent.secondaryCta.label}
              </a>
            </div>
          </div>

          {/* Image Column */}
          <div className="lg:col-span-5 relative">
            <div
              ref={imageRef}
              className="relative overflow-hidden rounded-3xl shadow-2xl"
              style={{
                transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              <img
                src={heroContent.image.src}
                alt={heroContent.image.alt}
                className="w-full h-auto object-cover"
                style={{ aspectRatio: '4/3' }}
                loading="lazy"
              />
              {/* Subtle gradient overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(99,61,192,0.08) 0%, transparent 50%)',
                }}
                aria-hidden="true"
              />
            </div>

            {/* Floating badge */}
            <div
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-5 py-3 hidden lg:flex items-center gap-3 shadow-lg"
              role="status"
              aria-label={heroContent.badge.ariaLabel}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)]"
              >
                {heroContent.badge.text}
              </div>
              <div>
                <p className="text-xs font-medium text-black/50">活躍用戶</p>
                <p className="text-sm font-semibold text-black">全球信賴</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
