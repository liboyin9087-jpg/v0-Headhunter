import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router';
import { useLenis } from '@/hooks/useLenis';
import MainLayout from '@/layouts/MainLayout';

// Sections that are part of the landing page
import Hero from '@/sections/Hero';
import Partners from '@/sections/Partners';
import SpatialTypography from '@/sections/SpatialTypography';
import Articles from '@/sections/Articles';
import FAQ from '@/sections/FAQ';

// Heavy 3D component with lazy loading
const VortexWormhole = lazy(() => import('@/sections/VortexWormhole'));

function LoadingFallback() {
  return (
    <div
      className="flex items-center justify-center w-full"
      style={{ height: '100vh', backgroundColor: '#0a0a0a' }}
    >
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'transparent' }}
      />
    </div>
  );
}

function LandingPage() {
  return (
    <>
      <Hero />
      <Partners />
      <Suspense fallback={<LoadingFallback />}>
        <VortexWormhole />
      </Suspense>
      <SpatialTypography />
      <Articles />
      <FAQ />
    </>
  );
}

function App() {
  useLenis();

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Future routes can be added here */}
      </Routes>
    </MainLayout>
  );
}

export default App;
