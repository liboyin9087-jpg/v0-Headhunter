import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getLenis } from '@/hooks/useLenis';
import { featureCards } from '@/data/features';

const vertexShader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uSpeed;
uniform float uAngle;
uniform float uTunnelProgress;
uniform float uHueSpeed;

#define PI 3.14159265359
#define TAU 6.28318530718
#define MAX_STEPS 24.0

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float hash(vec2 p) {
  vec2 ip = floor(p);
  vec2 fp = fract(p);
  return fract(sin(dot(ip, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdSphere(vec3 p, float s) {
  return length(p) - s;
}

float scene(vec3 p) {
  float angle = atan(p.z, p.x);
  float radius = length(p.xz);
  float wrapped = mod(angle + PI, TAU) - PI;
  vec2 tunnel = vec2(radius - 3.5, p.y);
  float d1 = length(tunnel) - 0.6;
  float d2 = abs(wrapped) - 0.15;
  float d3 = length(tunnel) - 0.3;
  return max(d1, -max(d2, -d3));
}

vec3 getNormal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(
    vec3(
      scene(p + e.xyy) - scene(p - e.xyy),
      scene(p + e.yxy) - scene(p - e.yxy),
      scene(p + e.yyx) - scene(p - e.yyx)
    )
  );
}

vec3 shade(vec3 ro, vec3 rd, float t) {
  vec3 p = ro + rd * t;
  vec3 n = getNormal(p);
  vec3 ld = normalize(vec3(1.0, 2.0, 1.0));
  float diff = max(dot(n, ld), 0.0);
  float ambient = 0.3;
  float li = ambient + diff * 0.7;
  vec3 c = 0.5 + 0.5 * cos(t * 0.2 + p.y * 0.5 + vec3(0.0, 2.0, 4.0));
  return c * li;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

  vec3 ro = vec3(0.0, 0.0, -4.0 - uTunnelProgress);
  vec3 rd = normalize(vec3(uv, 1.0));
  rd.xy *= rot(uAngle);
  rd.yz *= rot(uAngle * 0.5);

  vec3 p = ro;
  float t = 0.0;

  for (float i = 0.0; i < MAX_STEPS; i++) {
    float d = scene(p);
    t += d;
    p = ro + rd * t;
    if (d < 0.001 || t > 50.0) break;
  }

  vec3 col;
  if (t < 50.0) {
    col = shade(ro, rd, t);
    float fog = 1.0 - exp(-t * 0.1);
    col = mix(col, vec3(0.05, 0.02, 0.08), fog);
  } else {
    col = vec3(0.05, 0.02, 0.08);
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

function VortexMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const lastVelocity = useRef(0);

  // Check for prefers-reduced-motion
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uSpeed: { value: 0 },
      uAngle: { value: 0 },
      uTunnelProgress: { value: 0 },
      uHueSpeed: { value: 0.5 },
    }),
    []
  );

  useEffect(() => {
    uniforms.uResolution.value.set(size.width, size.height);
  }, [size, uniforms]);

  useFrame((state) => {
    if (!materialRef.current || prefersReducedMotion()) return;

    const lenis = getLenis();
    const lenisVelocity = lenis ? lenis.velocity : 0;

    lastVelocity.current = THREE.MathUtils.lerp(
      lastVelocity.current,
      Math.abs(lenisVelocity) * 10,
      0.05
    );

    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uSpeed.value = lastVelocity.current;
    materialRef.current.uniforms.uAngle.value =
      Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
    materialRef.current.uniforms.uTunnelProgress.value +=
      0.02 + lastVelocity.current * 0.1;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

interface CardState {
  [key: string]: boolean;
}

export default function VortexWormhole() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [animatedCards, setAnimatedCards] = useState<CardState>({});
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger staggered animation
            featureCards.forEach((card, index) => {
              const delay = prefersReducedMotion ? 0 : index * 200;
              setTimeout(() => {
                setAnimatedCards((prev) => ({
                  ...prev,
                  [card.id]: true,
                }));
              }, delay);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (cardsRef.current) {
      observer.observe(cardsRef.current);
    }

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      style={{ height: '300vh', position: 'relative' }}
      aria-labelledby="vortex-heading"
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {!prefersReducedMotion && (
          <Canvas
            orthographic
            camera={{
              zoom: 1,
              position: [0, 0, 1],
              left: -1,
              right: 1,
              top: 1,
              bottom: -1,
              near: 0,
              far: 1,
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
            gl={{ antialias: false, alpha: false }}
          >
            <VortexMesh />
          </Canvas>
        )}

        {/* Fallback background for reduced motion */}
        {prefersReducedMotion && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
            }}
            aria-hidden="true"
          />
        )}

        <div
          ref={cardsRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 10, pointerEvents: 'none' }}
        >
          <h2 id="vortex-heading" className="sr-only">
            核心功能展示
          </h2>
          <div
            className="container mx-auto px-6 flex flex-col md:flex-row gap-8 items-center justify-center"
            style={{ pointerEvents: 'auto' }}
            role="region"
            aria-label="功能卡片"
          >
            {featureCards.map((card) => {
              const isAnimated = animatedCards[card.id];
              return (
                <div
                  key={card.id}
                  className="relative overflow-hidden rounded-3xl p-8 max-w-sm w-full transition-all duration-800 ease-out"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    opacity: isAnimated || prefersReducedMotion ? 1 : 0,
                    transform:
                      isAnimated || prefersReducedMotion
                        ? 'translateY(0)'
                        : 'translateY(60px)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: card.backgroundImage
                        ? `url(${card.backgroundImage})`
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                    aria-hidden="true"
                  />
                  <div className="relative z-10">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-white"
                      style={{
                        background: 'rgba(99,61,192,0.3)',
                      }}
                      aria-hidden="true"
                    >
                      {card.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {card.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
