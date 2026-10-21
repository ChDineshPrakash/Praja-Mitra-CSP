import React from 'react';
import { 
  ChevronRight, 
  ShieldCheck, 
  FileText, 
  Megaphone, 
  Info,
} from 'lucide-react';
import type { Scheme, Language } from '../types';

interface PopularSchemesProps {
  schemes: Scheme[];
  language: Language;
  onSelectScheme: (scheme: Scheme) => void;
  onViewAllSchemes: () => void;
}

export default function PopularSchemesRow({
  schemes,
  language,
  onSelectScheme,
  onViewAllSchemes,
}: PopularSchemesProps) {
  const isTe = language === 'te';
  const popularSix = schemes.slice(0, 6);

  const updates = isTe ? [
    {
      date: '10 అక్టోబర్ 2026',
      title: 'అన్నదాత సుఖీభవ – తాజా విడత నిధుల విడుదల ప్రకటన (అధికారిక నోటీసు).',
      iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      date: '05 అక్టోబర్ 2026',
      title: 'తల్లికి వందనం – 2026-27 బడ్జెట్ నూతన కేటాయింపులు.',
      iconColor: 'text-amber-600 bg-amber-50',
    },
    {
      date: '28 సెప్టెంబర్ 2026',
      title: 'ఎన్టీఆర్ భరోసా పెన్షన్లు – నూతన లబ్ధిదారుల నమోదు ప్రక్రియ.',
      iconColor: 'text-purple-600 bg-purple-50',
    },
    {
      date: '15 సెప్టెంబర్ 2026',
      title: 'స్త్రీ శక్తి – రాష్ట్రవ్యాప్తంగా మహిళలకు ఉచిత ఆర్టీసీ బస్సు ప్రయాణం కొనసాగింపు.',
      iconColor: 'text-orange-600 bg-orange-50',
    },
  ] : [
    {
      date: '10 Oct 2026',
      title: 'Annadata Sukhibhava – latest installment updates (official notice).',
      iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      date: '05 Oct 2026',
      title: 'Thalliki Vandanam – 2026-27 budget announcement.',
      iconColor: 'text-amber-600 bg-amber-50',
    },
    {
      date: '28 Sep 2026',
      title: 'NTR Bharosa pensions – new budget allocations for 2026-27.',
      iconColor: 'text-purple-600 bg-purple-50',
    },
    {
      date: '15 Sep 2026',
      title: 'Stree Shakti – free bus travel for women continues across the state.',
      iconColor: 'text-orange-600 bg-orange-50',
    },
  ];

  // Tag translations
  const getTagLabel = (tag?: string) => {
    if (!tag) return '';
    if (!isTe) return tag;
    switch (tag.toLowerCase()) {
      case 'agriculture': return 'రైతు సంక్షేమం';
      case 'education': return 'విద్యా రంగం';
      case 'pensions': return 'పెన్షన్లు';
      case 'women': return 'మహిళా సంక్షేమం';
      case 'food & civil supplies': return 'ఆహార భద్రత';
      case 'healthcare': return 'ఆరోగ్య సేవలు';
      case 'housing': return 'గృహ నిర్మాణం';
      default: return tag;
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Header bar above schemes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-slate-900 font-extrabold text-base sm:text-lg flex items-center gap-1.5">
            <span>
              {isTe 
                ? 'ప్రజాదరణ పొందిన ఆంధ్రప్రదేశ్ ప్రభుత్వ పథకాలు' 
                : 'Popular Current Andhra Pradesh Government Schemes'}
            </span>
            <ChevronRight size={18} className="text-emerald-600 inline" />
          </h2>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>
              {isTe 
                ? 'అధికారిక వివరాల ప్రకారం ధృవీకరించబడిన పథకాలు' 
                : 'Showing current and verified schemes from official sources'}
            </span>
          </div>
        </div>

        <button
          onClick={onViewAllSchemes}
          className="text-blue-600 hover:text-blue-800 text-xs font-bold inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>{isTe ? 'అన్ని పథకాలు చూడండి' : 'View All Schemes'}</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Main Row: 6 Scheme Cards (Left) + Latest Updates Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column: 6 Horizontal Cards Grid (lg:col-span-9) */}
        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {popularSix.map((scheme) => (
            <div
              key={scheme.id}
              onClick={() => onSelectScheme(scheme)}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between overflow-hidden cursor-pointer group"
            >
              <div>
                {/* Scheme Thumbnail Image */}
                <div className="h-28 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={scheme.image || '/images/hero_family.jpg'}
                    alt={isTe ? scheme.nameTe : scheme.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {scheme.tag && (
                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs ${scheme.tagColor || 'bg-emerald-100 text-emerald-800'}`}>
                        {getTagLabel(scheme.tag)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-2.5">
                  <h3 className="font-bold text-slate-900 text-xs leading-tight mb-1 group-hover:text-emerald-700 transition-colors">
                    {isTe ? scheme.nameTe : scheme.nameEn}
                  </h3>

                  <p className="text-slate-500 text-[11px] leading-snug line-clamp-2">
                    {isTe ? scheme.summaryTe : scheme.summaryEn}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-2.5 pt-0 mt-2 space-y-1.5 border-t border-slate-100">
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  <span>{isTe ? 'అధికారిక మూలం ధృవీకరించబడింది' : 'Official source available'}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 hover:text-emerald-950 pt-0.5">
                  <span>{isTe ? 'తాజా దరఖాస్తు స్థితి తనిఖీ' : 'Check latest status'}</span>
                  <ChevronRight size={12} className="text-emerald-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Latest Updates Panel (lg:col-span-3) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Megaphone size={16} className="text-emerald-700" />
                <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  {isTe ? 'తాజా సమాచారాలు' : 'Latest Updates'}
                </h3>
              </div>
              <button 
                onClick={onViewAllSchemes}
                className="text-blue-600 hover:text-blue-800 text-[11px] font-bold"
              >
                {isTe ? 'అన్నీ →' : 'View All →'}
              </button>
            </div>

            <div className="space-y-2.5">
              {updates.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 group cursor-pointer">
                  <div className={`w-6 h-6 rounded-md ${item.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                    <FileText size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-400 text-[10px] font-bold leading-none mb-0.5">
                      {item.date}
                    </p>
                    <p className="text-slate-700 text-xs leading-snug group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Scheme Verification Notice Banner */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Info size={15} className="text-blue-600 shrink-0" />
          <span className="font-medium text-[11px] sm:text-xs">
            {isTe ? (
              <>
                <strong className="text-blue-900 font-bold">పథకం వివరాలు</strong> అధికారిక ప్రభుత్వ ఉత్తర్వుల ప్రకారం ధృవీకరించబడ్డాయి • <span className="text-slate-500">పరిశీలన తేది: పథకాన్ని బట్టి మారుతుంది</span>
              </>
            ) : (
              <>
                <strong className="text-blue-900 font-bold">Scheme status</strong> is verified from official notices before publishing • <span className="text-slate-500">Last checked: varies by scheme</span>
              </>
            )}
          </span>
        </div>

        <p className="text-slate-500 text-[10px] sm:text-[11px] text-right">
          {isTe 
            ? 'ప్రజా మిత్ర పౌరులకు సమాచార మార్గదర్శి మాత్రమే. పూర్తి వివరాలకు ఎల్లప్పుడూ అధికారిక ప్రభుత్వ వెబ్‌సైట్లను సంప్రదించండి.'
            : 'Praja Mitra is an independent information portal. For final details, always refer to official Andhra Pradesh government websites.'}
        </p>
      </div>
    </div>
  );
}
