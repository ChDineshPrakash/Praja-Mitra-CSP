import React from 'react';
import { 
  Search, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  Compass, 
  Sprout, 
  GraduationCap, 
  HeartHandshake, 
  Users, 
  Wheat, 
  HeartPulse, 
  Home as HomeIcon, 
  LayoutGrid 
} from 'lucide-react';
import type { Language } from '../types';

interface HeroSectionProps {
  language: Language;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  onSelectCategory: (cat: string | null) => void;
  selectedCategory: string | null;
  onQuickAction: (action: string) => void;
}

export default function HeroSection({
  language,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSelectCategory,
  selectedCategory,
  onQuickAction,
}: HeroSectionProps) {
  const isTe = language === 'te';

  const categoryTiles = [
    { 
      id: 'farmer', 
      label: isTe ? 'రైతు సంక్షేమం' : 'Agriculture', 
      icon: Sprout, 
      bg: 'bg-[#F0FDF4]', 
      border: 'border-[#DCFCE7]', 
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-100/80',
    },
    { 
      id: 'student', 
      label: isTe ? 'విద్యా సహాయం' : 'Education', 
      icon: GraduationCap, 
      bg: 'bg-[#EFF6FF]', 
      border: 'border-[#DBEAFE]', 
      text: 'text-blue-700',
      iconBg: 'bg-blue-100/80',
    },
    { 
      id: 'pension', 
      label: isTe ? 'పెన్షన్లు' : 'Pensions', 
      icon: HeartHandshake, 
      bg: 'bg-[#FFFBEB]', 
      border: 'border-[#FEF3C7]', 
      text: 'text-amber-700',
      iconBg: 'bg-amber-100/80',
    },
    { 
      id: 'women', 
      label: isTe ? 'మహిళా & శిశు సంక్షేమం' : 'Women & Child', 
      icon: Users, 
      bg: 'bg-[#FDF2F8]', 
      border: 'border-[#FCE7F3]', 
      text: 'text-pink-700',
      iconBg: 'bg-pink-100/80',
    },
    { 
      id: 'food', 
      label: isTe ? 'ఆహార భద్రత' : 'Food & Supplies', 
      icon: Wheat, 
      bg: 'bg-[#FEFCE8]', 
      border: 'border-[#FEF08A]', 
      text: 'text-yellow-800',
      iconBg: 'bg-yellow-100/80',
    },
    { 
      id: 'health', 
      label: isTe ? 'ఆరోగ్య సేవలు' : 'Healthcare', 
      icon: HeartPulse, 
      bg: 'bg-[#F0FDFA]', 
      border: 'border-[#CCFBF1]', 
      text: 'text-teal-700',
      iconBg: 'bg-teal-100/80',
    },
    { 
      id: 'housing', 
      label: isTe ? 'గృహ నిర్మాణం' : 'Housing', 
      icon: HomeIcon, 
      bg: 'bg-[#FFF7ED]', 
      border: 'border-[#FFEDD5]', 
      text: 'text-orange-700',
      iconBg: 'bg-orange-100/80',
    },
    { 
      id: 'others', 
      label: isTe ? 'ఇతర పథకాలు' : 'Other Schemes', 
      icon: LayoutGrid, 
      bg: 'bg-[#EEF2FF]', 
      border: 'border-[#E0E7FF]', 
      text: 'text-indigo-700',
      iconBg: 'bg-indigo-100/80',
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Top Row: Hero Banner (Left) + CM Card & Quick Services (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Hero Card - Full background image with overlay effect, family on right, text on left */}
        <div className="lg:col-span-8 relative rounded-2xl border border-emerald-300/80 shadow-xs overflow-hidden flex flex-col justify-center min-h-[270px] sm:min-h-[300px] group bg-[#EAF8EE]">
          {/* Background Image filling the ENTIRE outer box, family positioned on the right */}
          <img
            src="/images/hero_family_right.jpg"
            alt={isTe ? 'ఆంధ్రప్రదేశ్ గ్రామీణ కుటుంబం & గ్రామ సచివాలయం' : 'Andhra Pradesh Rural Family & Grama Sachivalayam'}
            className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none transition-transform duration-700 group-hover:scale-102"
          />

          {/* Smooth gradient overlay covering only the left text area, fading to transparent before the family */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/98 via-emerald-50/80 to-transparent pointer-events-none" />
          <div className="absolute inset-0 ring-1 ring-inset ring-emerald-500/20 rounded-2xl pointer-events-none" />

          {/* Badge in top right corner */}
          <div className="absolute top-3.5 right-3.5 z-20 bg-emerald-800/90 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border border-emerald-400/40">
            <span>{isTe ? 'ప్రజల సంక్షేమమే మా లక్ష్యం' : 'Citizen Welfare is Our Mission'}</span>
          </div>

          {/* Foreground Content on Top (Constrained to left 50% so faces are completely free) */}
          <div className="relative z-10 p-5 sm:p-7 max-w-[54%] sm:max-w-[50%] space-y-3">
            <div>
              {isTe ? (
                <h1 className="text-emerald-950 font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-tight leading-tight">
                  మీ కుటుంబానికి సరిపోయే ప్రభుత్వ పథకాలు కనుగొనండి
                </h1>
              ) : (
                <h1 className="text-slate-900 font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-tight leading-tight">
                  Find government support that fits your family
                </h1>
              )}
            </div>

            <p className="text-slate-700 text-xs sm:text-[13px] leading-relaxed font-medium">
              {isTe 
                ? 'ఆంధ్రప్రదేశ్ ప్రభుత్వం అందించే అధికారిక సంక్షేమ పథకాలను అన్వేషించండి, మీ అర్హతను తనిఖీ చేయండి మరియు సమీప సచివాలయాన్ని కనుగొనండి.'
                : 'Explore verified Andhra Pradesh government schemes, check eligibility, get application guides, and find nearby Sachivalayams.'}
            </p>

            {/* Search Bar Input on Top */}
            <form 
              onSubmit={(e) => { e.preventDefault(); onSearchSubmit(); }}
              className="flex items-center bg-white rounded-full border border-slate-300 shadow-sm p-1 pl-3.5 max-w-sm sm:max-w-md focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
            >
              <Search size={16} className="text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  isTe 
                    ? 'పథకం పేరుతో వెతకండి...'
                    : 'Search schemes (e.g., PM-Kisan)...'
                }
                className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs active:scale-95"
              >
                <Search size={13} />
                <span>{isTe ? 'వెతకండి' : 'Search'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Feature Column: CM Panel & Quick Services */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3">
          {/* Top CM Card - Full background image with overlay effect and text on left, face on right */}
          <div className="relative rounded-2xl border border-amber-300/80 shadow-xs overflow-hidden min-h-[145px] sm:min-h-[160px] flex items-center group bg-[#FFF9DB]">
            {/* Background Image filling the ENTIRE outer box, face on the far right */}
            <img
              src="/images/cm_banner_far_right.jpg"
              alt={isTe ? 'ముఖ్యమంత్రి నారా చంద్రబాబు నాయుడు' : "Chief Minister N. Chandrababu Naidu"}
              className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none transition-transform duration-500 group-hover:scale-102"
            />
            {/* Subtle Gradient Overlay on text side only, keeping face 100% clear */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/90 via-amber-50/60 to-transparent pointer-events-none" />
            <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/40 rounded-2xl pointer-events-none" />

            {/* Text on top on the left side, never overlapping the face */}
            <div className="relative z-10 p-3.5 sm:p-4 max-w-[56%] sm:max-w-[58%]">
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-[13px] leading-tight mb-1 tracking-tight">
                {isTe ? 'ప్రజల భాగస్వామ్యంతో అభివృద్ధి చెందిన ఆంధ్రప్రదేశ్' : "Developed Andhra Pradesh with People's Participation"}
              </h3>
              <p className="text-slate-800 italic text-[10px] sm:text-[11px] leading-snug mb-1.5 font-medium">
                {isTe 
                  ? '"బలమైన ఆంధ్రప్రదేశ్ నిర్మాణం కోసం సమ్మిళిత అభివృద్ధి మరియు పౌరుల సంక్షేమం మా ధ్యేయం."'
                  : '"Inclusive development and citizen welfare for a stronger Andhra Pradesh."'}
              </p>
              <div className="border-t border-amber-300/80 pt-1 mt-0.5 inline-block">
                <p className="font-extrabold text-slate-900 text-[11px] leading-none">
                  {isTe ? '— నారా చంద్రబాబు నాయుడు' : '— N. Chandrababu Naidu'}
                </p>
                <p className="text-emerald-800 font-bold text-[9px] leading-none mt-0.5">
                  {isTe ? 'ముఖ్యమంత్రి, ఆంధ్రప్రదేశ్' : 'Chief Minister, Andhra Pradesh'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Services Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight">
                {isTe ? 'త్వరిత సేవలు' : 'Quick Services'}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2">
              {[
                {
                  id: 'eligibility',
                  title: isTe ? 'అర్హత తనిఖీ' : 'Check Eligibility',
                  icon: ShieldCheck,
                  bg: 'bg-[#F0FDF4]',
                  border: 'border-[#DCFCE7]',
                  text: 'text-emerald-700',
                  iconColor: 'text-emerald-600',
                },
                {
                  id: 'sachivalayams',
                  title: isTe ? 'సమీప సచివాలయాలు' : 'Find Sachivalayams',
                  icon: MapPin,
                  bg: 'bg-[#F0F9FF]',
                  border: 'border-[#E0F2FE]',
                  text: 'text-blue-700',
                  iconColor: 'text-blue-600',
                },
                {
                  id: 'guides',
                  title: isTe ? 'దరఖాస్తు గైడ్' : 'Application Guides',
                  icon: FileText,
                  bg: 'bg-[#FAF5FF]',
                  border: 'border-[#F3E8FF]',
                  text: 'text-purple-700',
                  iconColor: 'text-purple-600',
                },
                {
                  id: 'track',
                  title: isTe ? 'దరఖాస్తు స్థితి' : 'Track Application',
                  icon: Compass,
                  bg: 'bg-[#FFF7ED]',
                  border: 'border-[#FFEDD5]',
                  text: 'text-orange-700',
                  iconColor: 'text-orange-600',
                },
              ].map((svc) => {
                const Icon = svc.icon;
                return (
                  <button
                    key={svc.id}
                    onClick={() => onQuickAction(svc.id)}
                    className={`${svc.bg} ${svc.border} border rounded-xl p-2.5 text-center flex flex-col items-center justify-center gap-1.5 hover:shadow-sm hover:scale-[1.02] transition-all cursor-pointer`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/90 shadow-2xs flex items-center justify-center">
                      <Icon size={16} className={svc.iconColor} />
                    </div>
                    <p className={`font-bold ${svc.text} text-[11px] leading-tight line-clamp-2`}>
                      {svc.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Category Tiles Row (8 Categories) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {categoryTiles.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`${cat.bg} ${cat.border} border rounded-xl p-2.5 flex items-center sm:flex-col justify-start sm:justify-center text-left sm:text-center gap-2 sm:gap-1.5 transition-all hover:shadow-xs cursor-pointer ${
                isSelected ? 'ring-2 ring-emerald-600 shadow-sm' : ''
              }`}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${cat.iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={15} className={cat.text} />
              </div>
              <p className={`font-bold ${cat.text} text-xs leading-tight line-clamp-1`}>
                {cat.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
