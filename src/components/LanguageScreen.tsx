import React from 'react';
import { Languages, HelpCircle } from 'lucide-react';

interface LanguageScreenProps {
  onSelectLanguage: (lang: 'en' | 'te') => void;
}

export default function LanguageScreen({ onSelectLanguage }: LanguageScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-between p-6 sm:p-12 relative overflow-hidden" id="lang-screen-container">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl -z-10 opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl -z-10 opacity-60"></div>

      {/* Header decorative tag */}
      <div className="w-full max-w-md text-center mt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold uppercase tracking-wider mb-2">
          🗣️ Government of Andhra Pradesh Initiative
        </div>
      </div>

      {/* Main card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center my-auto relative" id="lang-menu-box">
        {/* Emblem or friendly avatar placeholder */}
        <div className="w-20 h-20 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner animate-bounce">
          🤝
        </div>

        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2 sm:text-4xl" id="lang-title">
          Praja Mitra
        </h1>
        <p className="text-slate-500 font-medium mb-8 focus:outline-none" id="lang-subtitle">
          ప్రజా మిత్ర &bull; AI Government Assistant
        </p>

        <div className="space-y-4 mb-6" id="lang-buttons-container">
          {/* Telugu representation first as per the guideline "Telugu First Experience" */}
          <button
            onClick={() => onSelectLanguage('te')}
            className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all duration-300 text-left group shadow-sm active:scale-95"
            id="lang-btn-telugu"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl" role="img" aria-label="India flag">🇮🇳</span>
              <div>
                <span className="block text-xl font-bold text-slate-800">తెలుగు</span>
                <span className="block text-xs text-slate-500">సులభమైన తెలుగు భాషలో సహాయం</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* English option */}
          <button
            onClick={() => onSelectLanguage('en')}
            className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-slate-200 hover:border-orange-600 hover:bg-orange-50/50 transition-all duration-300 text-left group shadow-sm active:scale-95"
            id="lang-btn-english"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl" role="img" aria-label="India flag">🇮🇳</span>
              <div>
                <span className="block text-xl font-bold text-slate-800">English</span>
                <span className="block text-xs text-slate-500">Access schemes assistance in English</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-orange-600 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2">
          * You can always change your language later from the top of the screen.
          <br />
          * మీరు ఎప్పుడైనా పైన ఉన్న బటన్ ద్వారా భాషను మార్చుకోవచ్చు.
        </p>
      </div>

      {/* Footer support line */}
      <div className="text-center text-xs text-slate-400 pb-2 flex items-center justify-center gap-1.5">
        <HelpCircle size={14} />
         Toll-Free Schemes Helpline: 1902
      </div>
    </div>
  );
}
