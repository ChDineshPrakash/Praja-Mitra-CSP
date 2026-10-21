import React, { useState } from 'react';
import { X, CheckCircle2, FileText, ExternalLink, ShieldCheck, Share2, ArrowRight } from 'lucide-react';
import type { Scheme, Language } from '../types';

interface SchemeDetailsModalProps {
  scheme: Scheme | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onCheckEligibility: () => void;
}

export default function SchemeDetailsModal({
  scheme,
  isOpen,
  onClose,
  language,
  onCheckEligibility,
}: SchemeDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'benefits' | 'documents' | 'apply'>('overview');

  const isTe = language === 'te';

  if (!isOpen || !scheme) return null;

  const tabs = isTe ? [
    { id: 'overview', label: 'వివరాలు' },
    { id: 'eligibility', label: 'అర్హతలు' },
    { id: 'benefits', label: 'ప్రయోజనాలు' },
    { id: 'documents', label: 'ధృవీకరణ పత్రాలు' },
    { id: 'apply', label: 'దరఖాస్తు విధానం' },
  ] : [
    { id: 'overview', label: 'Overview' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'documents', label: 'Documents' },
    { id: 'apply', label: 'How to Apply' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Scheme Header Image & Title */}
        <div className="relative h-44 sm:h-52 bg-slate-900 overflow-hidden shrink-0">
          <img
            src={scheme.image || '/images/hero_family.jpg'}
            alt={isTe ? scheme.nameTe : scheme.nameEn}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-xs"
          >
            <X size={18} />
          </button>

          {/* Scheme Badges & Title */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-300" />
                {isTe ? 'అధికారిక ఆంధ్రప్రదేశ్ ప్రభుత్వ పథకం' : 'Verified Official AP Scheme'}
              </span>
            </div>

            <h2 className="font-extrabold text-lg sm:text-xl leading-tight">
              {isTe ? scheme.nameTe : scheme.nameEn}
            </h2>
            <p className="text-emerald-300 text-xs sm:text-sm font-semibold mt-0.5">
              {isTe ? scheme.amountTe : scheme.amountEn}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-4 bg-slate-50 gap-2 overflow-x-auto text-xs font-bold scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-2 border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                  {isTe ? 'పథకం ముఖ్య ఉద్దేశ్యం' : 'About the Scheme'}
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {isTe ? scheme.summaryTe : scheme.summaryEn}
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <h4 className="font-extrabold text-emerald-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-700" />
                  {isTe ? 'ప్రధాన ప్రయోజనాలు మరియు లక్ష్యం' : 'Key Highlights & Purpose'}
                </h4>
                <ul className="space-y-1.5 text-emerald-950 text-xs">
                  {(isTe ? scheme.benefitsTe : scheme.benefitsEn).slice(0, 3).map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'eligibility' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                {isTe ? 'అర్హత నిబంధనలు' : 'Eligibility Criteria'}
              </h4>
              <ul className="space-y-2 text-slate-700">
                {(isTe ? scheme.eligibilityTe : scheme.eligibilityEn).map((e, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                {isTe ? 'ఆర్థిక మరియు సంక్షేమ ప్రయోజనాలు' : 'Financial & Welfare Benefits'}
              </h4>
              <ul className="space-y-2 text-slate-700">
                {(isTe ? scheme.benefitsTe : scheme.benefitsEn).map((b, i) => (
                  <li key={i} className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-emerald-950">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                {isTe ? 'అవసరమైన ధృవీకరణ పత్రాలు' : 'Required Documents Checklist'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(isTe ? scheme.documentsTe : scheme.documentsEn).map((d, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <FileText size={16} className="text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-800 text-xs">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'apply' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">
                {isTe ? 'దరఖాస్తు విధానం' : 'How to Apply'}
              </h4>
              <ol className="space-y-2.5 text-slate-700 text-xs list-decimal pl-4">
                {isTe ? (
                  <>
                    <li>మీ సమీప <strong>గ్రామ లేదా వార్డు సచివాలయాన్ని</strong> అవసరమైన ధృవీకరణ పత్రాలతో సందర్శించండి.</li>
                    <li>సంబంధిత <strong>సంక్షేమ సహాయకుడు (Welfare Assistant) లేదా డిజిటల్ అసిస్టెంట్‌ను</strong> సంప్రదించండి.</li>
                    <li>బయోమెట్రిక్ ఈ-కేవైసీ మరియు ఆధార్ అనుసంధాన ప్రక్రియను పూర్తి చేయండి.</li>
                    <li>దరఖాస్తు రసీదు సంఖ్యను స్వీకరించి ఆన్‌లైన్‌లో పురోగతిని ట్రాక్ చేయండి.</li>
                  </>
                ) : (
                  <>
                    <li>Visit your nearest <strong>Grama or Ward Sachivalayam</strong> with original documents and photocopies.</li>
                    <li>Meet the designated <strong>Welfare Assistant or Digital Assistant</strong>.</li>
                    <li>Complete biometric e-KYC authentication and Aadhaar linkage.</li>
                    <li>Collect your application receipt number and track status online or via portal.</li>
                  </>
                )}
              </ol>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {scheme.officialSource && (
            <a
              href={scheme.officialSource}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <ExternalLink size={13} />
              <span>{isTe ? 'అధికారిక ప్రభుత్వ పోర్టల్' : 'Visit Official Portal'}</span>
            </a>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => { onClose(); onCheckEligibility(); }}
              className="flex-1 sm:flex-none bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>{isTe ? 'నా అర్హతను ఇప్పుడే తనిఖీ చేయండి' : 'Check My Eligibility Now'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
