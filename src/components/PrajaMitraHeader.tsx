import React, { useState } from 'react';
import { Search, User, Menu, X, ChevronRight, LogOut, CheckCircle2 } from 'lucide-react';
import type { Language, AuthUser } from '../types';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (view: string) => void;
  activeView: string;
  onOpenSearch: () => void;
  onOpenLogin: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export default function PrajaMitraHeader({
  language,
  onLanguageChange,
  onNavigate,
  activeView,
  onOpenSearch,
  onOpenLogin,
  currentUser,
  onLogout,
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
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-emerald-600/30 p-0.5 flex items-center justify-center shrink-0 bg-white shadow-xs overflow-hidden">
            <img
              src="/images/ap_govt_logo.png"
              alt="Government of Andhra Pradesh"
              className="w-full h-full object-contain rounded-full"
            />
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
                  Welfare Schemes • Grama Sachivalayam Gateway
                </p>
              </>
            )}
          </div>
        </div>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-semibold text-slate-700">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`transition-colors py-1 border-b-2 ${
                activeView === link.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent hover:text-emerald-700'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Actions: Language Switcher, Search, Login, Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Single-Select Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200">
            <button
              onClick={() => onLanguageChange('te')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                language === 'te'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="తెలుగు భాషను ఎంచుకోండి"
            >
              తెలుగు
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Select English"
            >
              English
            </button>
          </div>

          {/* Search Trigger Button (Desktop & Tablet) */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            title={language === 'te' ? 'వెతకండి' : 'Search'}
          >
            <Search size={14} />
            <span className="hidden md:inline">{language === 'te' ? 'పథకాలు వెతకండి' : 'Search schemes'}</span>
          </button>

          {/* Citizen Login or Profile Pill */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold shadow-xs select-none"
                title={`${currentUser.name} (${currentUser.mobile}) - ${currentUser.district}`}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                  <User size={12} />
                </div>
                <span className="truncate max-w-[100px] sm:max-w-[160px]">{currentUser.name}</span>
                <span className="hidden lg:inline-block text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded-md">
                  {currentUser.district}
                </span>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors shadow-xs"
                  title={language === 'te' ? 'లాగౌట్' : 'Sign out'}
                >
                  <LogOut size={13} />
                  <span className="hidden sm:inline">{language === 'te' ? 'లాగౌట్' : 'Logout'}</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs active:scale-95"
            >
              <User size={14} />
              <span className="hidden sm:inline">{language === 'te' ? 'పౌరుల లాగిన్' : 'Citizen Login'}</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between ${
                activeView === link.id
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{link.label}</span>
              <ChevronRight size={16} className="text-slate-400" />
            </button>
          ))}

          {/* Mobile Citizen Account status */}
          <div className="pt-3 mt-2 border-t border-slate-100">
            {currentUser ? (
              <div className="p-2.5 bg-emerald-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-950">{currentUser.name}</p>
                  <p className="text-[11px] text-emerald-700">{currentUser.district} • +91 {currentUser.mobile}</p>
                </div>
                {onLogout && (
                  <button
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                    className="text-xs text-red-600 font-bold hover:underline px-2 py-1"
                  >
                    {language === 'te' ? 'లాగౌట్' : 'Logout'}
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
                className="w-full bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <User size={14} />
                <span>{language === 'te' ? 'పౌరుల లాగిన్ / నమోదు' : 'Citizen Login / Register'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
