import { useState } from 'react';
import { footerColumns, socialLinks, footerBrand, languages } from '@/data/footer';

export default function Footer() {
  const [activeLanguage, setActiveLanguage] = useState(languages[0].code);

  return (
    <footer className="bg-black text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        {/* Top Row - Logo and Brand */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            {/* Cake Logo SVG */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.1" />
              <path
                d="M14 30C14 24.4772 18.4772 20 24 20C29.5228 20 34 24.4772 34 30"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="24" cy="16" r="3" stroke="white" strokeWidth="2" />
              <path
                d="M19 30C19 27.2386 21.2386 25 24 25"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-serif-display text-2xl font-bold">
              {footerBrand.name}
            </span>
          </div>
          <p className="text-sm text-white/40">{footerBrand.copyright}</p>
        </div>

        {/* Grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-white/8"
          role="contentinfo"
        >
          {footerColumns.map((col) => (
            <nav key={col.title} aria-labelledby={`footer-${col.title}`}>
              <h4
                id={`footer-${col.title}`}
                className="text-white font-semibold text-sm mb-5"
              >
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Language Selector */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5">語言</h4>
            <fieldset>
              <legend className="sr-only">選擇語言</legend>
              <div className="flex gap-4">
                {languages.map((lang) => (
                  <label key={lang.code} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="language"
                      value={lang.code}
                      checked={activeLanguage === lang.code}
                      onChange={() => setActiveLanguage(lang.code)}
                      className="sr-only"
                    />
                    <span
                      className={`text-sm cursor-pointer transition-colors ${
                        activeLanguage === lang.code
                          ? 'text-white'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {lang.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">{footerBrand.tagline}</p>
          <nav aria-label="社群媒體連結">
            <ul className="flex gap-6">
              {socialLinks.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-white transition-colors duration-300"
                    aria-label={social.name}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
