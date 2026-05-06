import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { navLinks, ctaLinks, brandName } from '@/data/navigation';

interface NavProps {
  onMobileMenuToggle?: (isOpen: boolean) => void;
}

export default function Nav({ onMobileMenuToggle }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileToggle = (isOpen: boolean) => {
    setMobileOpen(isOpen);
    onMobileMenuToggle?.(isOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-black/5'
          : 'bg-transparent'
      }`}
      style={{ height: '72px' }}
    >
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="font-serif-display text-2xl font-bold tracking-tight text-black hover:opacity-75 transition-opacity"
          aria-label={`${brandName} - 返回首頁`}
        >
          {brandName}
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="主導航">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-sm font-medium text-black/60 hover:text-black transition-colors"
              aria-label={link.ariaLabel}
            >
              {link.label}
              <span
                className="absolute bottom-0 left-0 h-px bg-black transition-all duration-300 ease-out scale-x-0 group-hover:scale-x-100 origin-left"
                aria-hidden="true"
              />
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <a
            href={ctaLinks.login.href}
            className="hidden md:inline-block text-sm text-black/50 hover:text-black transition-colors"
            aria-label={ctaLinks.login.ariaLabel}
          >
            {ctaLinks.login.label}
          </a>
          <a
            href={ctaLinks.signup.href}
            className="hidden md:inline-flex gradient-btn text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg transition-shadow"
            aria-label={ctaLinks.signup.ariaLabel}
          >
            {ctaLinks.signup.label}
          </a>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 hover:bg-black/5 rounded-lg transition-colors"
            onClick={() => handleMobileToggle(!mobileOpen)}
            aria-label={mobileOpen ? '關閉選單' : '開啟選單'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            <span
              className="block w-6 h-0.5 bg-black transition-all duration-300"
              style={{
                transform: mobileOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
              }}
            />
            <span
              className="block w-6 h-0.5 bg-black transition-all duration-300"
              style={{ opacity: mobileOpen ? 0 : 1 }}
            />
            <span
              className="block w-6 h-0.5 bg-black transition-all duration-300"
              style={{
                transform: mobileOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        id="mobile-nav"
        className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-black/5 overflow-hidden transition-all duration-500 ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        role="navigation"
        aria-label="移動導航"
      >
        <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-lg font-medium text-black/80 hover:text-black transition-colors py-2"
              onClick={() => handleMobileToggle(false)}
              aria-label={link.ariaLabel}
            >
              {link.label}
            </a>
          ))}
          <a
            href={ctaLinks.signup.href}
            className="gradient-btn text-white text-sm font-semibold px-5 py-3 rounded-xl text-center mt-2 hover:shadow-lg transition-shadow"
            onClick={() => handleMobileToggle(false)}
            aria-label={ctaLinks.signup.ariaLabel}
          >
            {ctaLinks.signup.label}
          </a>
        </div>
      </div>
    </header>
  );
}
