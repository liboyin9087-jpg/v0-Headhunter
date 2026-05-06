import React from 'react';
import Nav from '@/sections/Nav';
import Footer from '@/sections/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#fdfdfd] selection:bg-black selection:text-white">
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
