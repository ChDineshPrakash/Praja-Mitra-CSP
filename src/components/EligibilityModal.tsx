import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import EligibilityForm from './EligibilityForm';
import type { Language, Scheme, UserProfile } from '../types';

interface EligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function EligibilityModal({ isOpen, onClose, language }: EligibilityModalProps) {
  const [results, setResults] = React.useState<Scheme[] | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4.5 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base leading-tight">
              {language === 'te' ? 'అర్హత తనిఖీ & ఆధార్ స్కాన్' : 'Eligibility Checker & Aadhaar Scan'}
            </h3>
            <p className="text-emerald-200 text-xs">
              {language === 'te' ? 'ఆటోమేటిక్ ధృవీకరణ మరియు పథక సిఫార్సులు' : 'Instant scheme match and auto-fill profile'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {results ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <h4 className="font-extrabold text-emerald-900 text-sm">
                  {language === 'te' ? 'మీకు అర్హత ఉన్న పథకాలు:' : 'You are eligible for:'}
                </h4>
                {profile?.name && (
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {language === 'te' ? `${profile.name} గారికి సిఫార్సు చేయబడిన పథకాలు` : `Recommended for ${profile.name}`}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                {results.map((s) => (
                  <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
                    <span className="text-3xl">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {language === 'te' ? s.nameTe : s.nameEn}
                      </h5>
                      <p className="text-emerald-700 font-semibold text-xs">{s.amountEn}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <CheckCircle2 size={12} /> Eligible
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setResults(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-colors"
              >
                {language === 'te' ? 'మళ్ళీ తనిఖీ చేయండి' : 'Check Again'}
              </button>
            </div>
          ) : (
            <EligibilityForm
              language={language}
              easyMode={false}
              onSchemesFound={(found, userProfile) => {
                setResults(found);
                setProfile(userProfile);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
