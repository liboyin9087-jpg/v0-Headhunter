import { useEffect, useRef, useState, useCallback } from 'react';
import { marqueeLines } from '@/data/typography';

interface RowState {
  rotation: number;
  speedMultiplier: number;
}

const totalLines = 3;
const angleStep = 180 / (totalLines + 1); // 45

export default function SpatialTypography() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rowStates, setRowStates] = useState<RowState[]>(
    marqueeLines.map(() => ({ rotation: 0, speedMultiplier: 1 }))
  );
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef<RowState[]>(rowStates);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const centerX = window.innerWidth / 2;
    const distanceX = e.clientX - centerX;
    const maxDist = window.innerWidth / 2;
    const percent = Math.max(-1, Math.min(1, distanceX / maxDist));

    // Calculate new states
    const newStates = marqueeLines.map((line) => {
      const speedMultiplier = 1 + Math.abs(percent) * 5;
      const rotation = percent * -30;
      return { rotation, speedMultiplier };
    });

    stateRef.current = newStates;

    // Use requestAnimationFrame to batch updates
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      setRowStates(newStates);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    stateRef.current = rowStates;
  }, [rowStates]);

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
      ref={containerRef}
      className="relative overflow-hidden bg-black"
      style={{ height: '100vh', perspective: '1000px' }}
      aria-labelledby="spatial-heading"
    >
      <div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {marqueeLines.map((line, i) => {
          const state = rowStates[i] || { rotation: 0, speedMultiplier: 1 };
          const animationDuration = Math.abs(60 / (2 * state.speedMultiplier));

          return (
            <div
              key={line.id}
              className="cylinder-row absolute left-1/2 w-full text-center"
              style={{
                top: '50%',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.1s ease-out',
                transform: `translateX(-50%) translateY(-50%) rotateX(${(i + 1) * angleStep}deg) rotateY(${state.rotation}deg) translateZ(300px)`,
              }}
              role="presentation"
              aria-hidden="true"
            >
              <div
                className={`marquee-content whitespace-nowrap font-serif-display font-bold uppercase text-white ${
                  line.direction === 'forward'
                    ? 'animate-marquee-forward'
                    : 'animate-marquee-reverse'
                }`}
                style={{
                  fontSize: '6vw',
                  display: 'inline-block',
                  animationDuration: `${animationDuration}s`,
                }}
              >
                {Array.from({ length: 4 }).map((_, j) => (
                  <span key={j} className="inline-block py-4 px-8">
                    {line.text} —
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Heading for accessibility */}
      <h2 id="spatial-heading" className="sr-only">
        空間排版展示
      </h2>

      {/* Gradient overlays for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, #0a0a0a 80%)',
        }}
        aria-hidden="true"
      />
    </section>
  );
}
