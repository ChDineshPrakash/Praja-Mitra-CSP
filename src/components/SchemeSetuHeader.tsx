import React, { useState } from 'react';
import { Search, User, Menu, X, ChevronRight } from 'lucide-react';
import type { Language } from '../types';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (view: string) => void;
  activeView: string;
  onOpenSearch: () => void;
  onOpenLogin: () => void;
}

export default function SchemeSetuHeader({
  language,
  onLanguageChange,
  onNavigate,
  activeView,
  onOpenSearch,
  onOpenLogin,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = language === 'te' ? [
    { id: 'home', label: 'హోమ్' },
    { id: 'schemes', label: 'అన్ని పథకాలు' },
    { id: 'eligibility', label: 'అర్హత తనిఖీ' },
    { id: 'sachivalayams', label: 'సచివాలయాలు' },
    { id: 'guides', label: 'దరఖాస్తు మార్గదర్శకాలు' },
    { id: 'departments', label: 'శాఖలు' },
    { id: 'about', label: 'గురించి' },
  ] : [
    { id: 'home', label: 'Home' },
    { id: 'schemes', label: 'All Schemes' },
    { id: 'eligibility', label: 'Eligibility Checker' },
    { id: 'sachivalayams', label: 'Sachivalayams' },
    { id: 'guides', label: 'Application Guides' },
    { id: 'departments', label: 'Departments' },
    { id: 'about', label: 'About' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Branding */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group shrink-0"
        >
          {/* AP State Seal Emblem */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-emerald-600/30 p-0.5 flex items-center justify-center shrink-0 bg-emerald-50">
            <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-9 sm:h-9">
              <circle cx="50" cy="50" r="46" fill="#047857" stroke="#F59E0B" strokeWidth="3" />
              <circle cx="50" cy="50" r="38" fill="#ECFDF5" />
              {/* Purna Kumbham motif */}
              <path d="M35 65 Q50 72 65 65 L60 48 Q50 44 40 48 Z" fill="#D97706" />
              <path d="M42 48 Q50 36 58 48 Z" fill="#059669" />
              <circle cx="50" cy="38" r="4" fill="#DC2626" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
            </svg>
          </div>

          <div>
            {language === 'te' ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">ప్రజా</span>
                  <span className="font-extrabold text-emerald-600 text-base sm:text-lg tracking-tight">మిత్ర</span>
                </div>
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-emerald-700 font-bold text-[11px] sm:text-xs tracking-tight">ఆంధ్రప్రదేశ్ ప్రభుత్వ పథకాలు</span>
                </div>
                <p className="text-slate-400 text-[9px] tracking-tight hidden md:block">
                  ప్రభుత్వ పథకాలు • ప్రతి పౌరుడికి సులభతరం
                </p>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">Praja</span>
                  <span className="font-extrabold text-emerald-600 text-base sm:text-lg tracking-tight">Mitra</span>
                  <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">AP</span>
                </div>
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-emerald-700 font-bold text-[11px] sm:text-xs tracking-tight">AP Citizen Welfare Portal</span>
                </div>
                <p className="text-slate-400 text-[9px] tracking-tight hidden md:block">
                  Government Schemes • Simplified for Every Citizen
                </p>
              </>
            )}
          </div>

          {/* Andhra Pradesh Map Silhouette Outline */}
          <div className="hidden xl:block ml-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 120 100" className="w-10 h-8 fill-emerald-600">
              <path d="M78 8 C72 14 65 19 60 25 C55 31 50 38 45 45 C40 52 35 60 28 68 C22 75 15 82 10 90 C18 92 28 88 35 84 C42 80 48 75 55 70 C62 65 70 60 76 54 C82 48 88 40 92 32 C96 24 94 15 85 10 Z" />
            </svg>
          </div>
        </div>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Search + Language Toggle + Login Button + Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Search Icon button */}
          <button
            onClick={onOpenSearch}
            className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
            title={language === 'te' ? 'పథకాలను వెతకండి' : 'Search schemes'}
          >
            <Search size={15} />
          </button>

          {/* Language Switcher Pill */}
          <div className="flex items-center border border-slate-200 rounded-full p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => onLanguageChange('te')}
              className={`px-2 sm:px-2.5 py-1 rounded-full font-bold transition-all text-[11px] sm:text-xs ${
                language === 'te'
                  ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              తెలుగు
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 sm:px-2.5 py-1 rounded-full font-bold transition-all text-[11px] sm:text-xs ${
                language === 'en'
                  ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              EN
            </button>
          </div>

          {/* Login / Register Button */}
          <button
            onClick={onOpenLogin}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-2.5 sm:px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
          >
            <User size={13} />
            <span className="hidden sm:inline">{language === 'te' ? 'లాగిన్ / నమోదు' : 'Login / Register'}</span>
            <span className="sm:hidden">{language === 'te' ? 'లాగిన్' : 'Login'}</span>
          </button>

          {/* Mobile Hamburger Toggle (hidden on desktop) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Visible when hamburger is opened) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-lg px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight size={14} className="text-slate-400" />
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
