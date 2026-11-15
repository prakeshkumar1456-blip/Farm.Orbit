import { Menu, Sprout, X } from 'lucide-react';
import { useState } from 'react';
import type { NavTab, Translations } from '../i18n/translations';
import type { LanguageCode } from '../types/farm';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  t: Translations;
  alertCount: number;
}

const NAV_ORDER: NavTab[] = ['home', 'dashboard', 'map', 'rotation', 'alerts', 'ai', 'sources'];

export function Navbar({
  activeTab,
  onSelectTab,
  language,
  onChangeLanguage,
  t,
  alertCount,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#DCE7DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803D] rounded-md"
        >
          <span className="w-9 h-9 rounded-lg bg-[#15803D] text-white flex items-center justify-center shrink-0">
            <Sprout className="w-5 h-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-[#102617]">
            {t.brandName}
          </span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Primary"
          className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#35523D]"
        >
          {NAV_ORDER.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleNav(tab)}
                className={`py-1.5 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#15803D] text-[#15803D] font-semibold'
                    : 'border-transparent hover:text-[#102617] hover:border-[#BFD4BF]'
                }`}
              >
                {t.nav[tab]}
                {tab === 'alerts' && alertCount > 0 ? ` (${alertCount})` : ''}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language Switcher + Mobile Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            role="group"
            aria-label={t.langLabel}
            className="flex items-center bg-[#EFF6EF] p-1 rounded-lg border border-[#D4E3D4]"
          >
            {(
              [
                { code: 'en', label: 'EN' },
                { code: 'hi', label: 'हिंदी' },
                { code: 'bn', label: 'বাংলা' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => onChangeLanguage(opt.code)}
                className={`px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  language === opt.code
                    ? 'bg-[#15803D] text-white'
                    : 'text-[#28422E] hover:bg-white/70'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-lg border border-[#D4E3D4] text-[#102617] hover:bg-[#EFF6EF] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-[#DCE7DC] bg-white px-4 py-3 grid grid-cols-2 gap-2"
        >
          {NAV_ORDER.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleNav(tab)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors whitespace-nowrap truncate ${
                  isActive
                    ? 'bg-[#15803D] text-white font-semibold'
                    : 'bg-[#F4F9F4] text-[#223C29] hover:bg-[#E7F2E7]'
                }`}
              >
                {t.nav[tab]}
                {tab === 'alerts' && alertCount > 0 ? ` (${alertCount})` : ''}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
