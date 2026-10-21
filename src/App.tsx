/**
 * Praja Mitra - ప్రజా మిత్ర
 * AI Government Schemes Assistant for Andhra Pradesh
 *
 * Real responsive web application:
 * - 100% User Selected Language (Telugu OR English, strictly not both simultaneously)
 * - Header with Praja Mitra branding, AP seal, nav links, EN/TE toggle, mobile drawer
 * - Hero with single language headline, search input, AP family photo with Grama Sachivalayam
 * - Andhra Pradesh Chief Minister information banner
 * - Quick Services (4 colored service cards)
 * - 8 Scheme Category tiles
 * - Popular Current AP Schemes row (6 scheme cards) + Latest Updates panel
 * - Full-width Scheme Verification notice banner
 * - Interactive modals for Voice AI, Eligibility Checker, Sachivalayam Locator, and Application Tracker
 */
import React, { useState, useEffect } from 'react';
import PrajaMitraHeader from './components/PrajaMitraHeader';
import HeroSection from './components/HeroSection';
import PopularSchemesRow from './components/PopularSchemesRow';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import SachivalayamModal from './components/SachivalayamModal';
import SchemeDetailsModal from './components/SchemeDetailsModal';
import ApplicationTrackerModal from './components/ApplicationTrackerModal';
import EligibilityModal from './components/EligibilityModal';
import AuthModal from './components/AuthModal';
import { AP_SCHEMES_MINI } from './data/schemesMini';
import type { Scheme, Language, AuthUser } from './types';
import { Mic } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('te');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  // Auth state
  const [authOpen, setAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Restore authenticated citizen session on app load
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('praja_user');
      const savedToken = localStorage.getItem('praja_token');
      if (savedUser && savedToken) {
        const userObj = JSON.parse(savedUser);
        setCurrentUser(userObj);

        // Verify token with backend
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error('Session expired');
          })
          .then((data) => {
            if (data.user) {
              setCurrentUser(data.user);
              localStorage.setItem('praja_user', JSON.stringify(data.user));
            }
          })
          .catch(() => {
            // Token expired or invalid
            localStorage.removeItem('praja_token');
            localStorage.removeItem('praja_user');
            setCurrentUser(null);
          });
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleLoginSuccess = (user: AuthUser, token: string) => {
    setCurrentUser(user);
    setAuthOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('praja_token');
    localStorage.removeItem('praja_user');
    setCurrentUser(null);
  };

  // Modals state
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [sachivalayamOpen, setSachivalayamOpen] = useState(false);
  const [eligibilityOpen, setEligibilityOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [schemeDetailsOpen, setSchemeDetailsOpen] = useState(false);

  // Active view in header
  const [activeView, setActiveView] = useState('home');

  const isTe = language === 'te';

  // Filter schemes
  const filteredSchemes = AP_SCHEMES_MINI.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.nameEn.toLowerCase().includes(q) ||
      s.nameTe.includes(q) ||
      s.summaryEn.toLowerCase().includes(q) ||
      s.category.includes(q);
    const matchesCategory = !selectedCategory || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenSchemeDetails = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setSchemeDetailsOpen(true);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'eligibility':
        setEligibilityOpen(true);
        break;
      case 'sachivalayams':
        setSachivalayamOpen(true);
        break;
      case 'guides':
      case 'track':
        setTrackerOpen(true);
        break;
      default:
        break;
    }
  };

  const handleNavigate = (view: string) => {
    setActiveView(view);
    if (view === 'eligibility') setEligibilityOpen(true);
    else if (view === 'sachivalayams') setSachivalayamOpen(true);
    else if (view === 'guides') setTrackerOpen(true);
    else if (view === 'schemes') {
      const el = document.getElementById('popular-schemes-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* 1. TOP HEADER (Responsive with mobile drawer) */}
      <PrajaMitraHeader
        language={language}
        onLanguageChange={setLanguage}
        onNavigate={handleNavigate}
        activeView={activeView}
        currentUser={currentUser}
        onOpenSearch={() => {
          const el = document.querySelector('input[type="text"]');
          (el as HTMLElement)?.focus();
        }}
        onOpenLogin={() => setAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5">
        {/* 2. HERO + CM PANEL + QUICK SERVICES + CATEGORY TILES */}
        <HeroSection
          language={language}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => {}}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onQuickAction={handleQuickAction}
        />

        {/* 3. POPULAR SCHEMES ROW (6 CARDS) + LATEST UPDATES + VERIFICATION BANNER */}
        <div id="popular-schemes-section">
          <PopularSchemesRow
            schemes={filteredSchemes.length > 0 ? filteredSchemes : AP_SCHEMES_MINI}
            language={language}
            onSelectScheme={handleOpenSchemeDetails}
            onViewAllSchemes={() => setSelectedCategory(null)}
          />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 text-center text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            {isTe 
              ? '© 2026 ప్రజా మిత్ర (Praja Mitra). ఆంధ్రప్రదేశ్ పౌర సంక్షేమ సమాచార పోర్టల్.' 
              : '© 2026 Praja Mitra. Andhra Pradesh Citizen Welfare Portal.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-600">
            <button onClick={() => setSachivalayamOpen(true)} className="hover:text-emerald-700">
              {isTe ? 'గ్రామ సచివాలయం' : 'Grama Sachivalayam'}
            </button>
            <button onClick={() => setVoiceOpen(true)} className="hover:text-emerald-700">
              {isTe ? 'వాయిస్ మిత్ర' : 'Voice Assistant'}
            </button>
            <button onClick={() => setTrackerOpen(true)} className="hover:text-emerald-700">
              {isTe ? 'దరఖాస్తు ట్రాకింగ్' : 'Application Tracking'}
            </button>
            <a href="tel:1902" className="hover:text-emerald-700 font-bold text-emerald-800">
              {isTe ? 'సీఎం హెల్ప్‌లైన్: 1902' : 'CM Helpline: 1902'}
            </a>
          </div>
        </div>
      </footer>

      {/* FLOATING VOICE ASSISTANT LAUNCHER BUTTON */}
      <button
        onClick={() => setVoiceOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white p-3.5 rounded-full shadow-xl flex items-center gap-2 transition-all hover:scale-105 group border-2 border-white/50 cursor-pointer"
        title={isTe ? 'వాయిస్ మిత్ర సహాయకుడిని తెరవండి' : 'Open Voice Assistant'}
      >
        <Mic size={20} className="animate-pulse" />
        <span className="hidden sm:inline text-xs font-bold pr-1">
          {isTe ? 'వాయిస్ మిత్ర' : 'Voice Mitra'}
        </span>
      </button>

      {/* INTERACTIVE MODALS */}
      <VoiceAssistantModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        language={language}
      />

      <SachivalayamModal
        isOpen={sachivalayamOpen}
        onClose={() => setSachivalayamOpen(false)}
        language={language}
      />

      <EligibilityModal
        isOpen={eligibilityOpen}
        onClose={() => setEligibilityOpen(false)}
        language={language}
      />

      <ApplicationTrackerModal
        isOpen={trackerOpen}
        onClose={() => setTrackerOpen(false)}
        language={language}
      />

      <SchemeDetailsModal
        scheme={selectedScheme}
        isOpen={schemeDetailsOpen}
        onClose={() => setSchemeDetailsOpen(false)}
        language={language}
        onCheckEligibility={() => setEligibilityOpen(true)}
      />

      {/* CITIZEN AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        language={language}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
