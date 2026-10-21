/**
 * EligibilityForm component
 * Collects user profile data to determine scheme eligibility.
 * Fields can be auto-filled from Aadhaar OCR scan.
 */
import React, { useState } from 'react';
import {
  ScanLine,
  ChevronRight,
  CheckCircle,
  User,
  Calendar,
  MapPin,
  Briefcase,
  IndianRupee,
  GraduationCap,
  Wheat,
  Sparkles,
} from 'lucide-react';
import AadhaarScanner from './AadhaarScanner';
import type { Language, UserProfile, Scheme } from '../types';
import { AP_SCHEMES_MINI } from '../data/schemesMini';
import { calculateAge } from '../utils/aadhaarOcr';

interface EligibilityFormProps {
  language: Language;
  easyMode: boolean;
  onSchemesFound: (schemes: Scheme[], profile: UserProfile) => void;
}

type FormStep = 'intro' | 'scan' | 'profile' | 'results';

const DISTRICTS_AP = [
  'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya',
  'Bapatla', 'Chittoor', 'East Godavari', 'Eluru', 'Guntur',
  'Kakinada', 'Konaseema', 'Krishna', 'Kurnool', 'Nandyal',
  'NTR', 'Palnadu', 'Parvathipuram Manyam', 'Prakasam', 'Srikakulam',
  'Sri Sathya Sai', 'Tirupati', 'Visakhapatnam', 'Vizianagaram',
  'West Godavari', 'YSR Kadapa',
];

const T = {
  te: {
    introTitle: 'పథకం అర్హత తనిఖీ',
    introSubtitle: 'మీ వివరాలు నమోదు చేయండి — మీకు అర్హమైన పథకాలు వెంటనే తెలుసుకోండి',
    scanBtn: '🪪 ఆధార్ స్కాన్ చేయండి (స్వయంచాలక నమోదు)',
    manualBtn: 'నేరుగా వివరాలు నమోదు చేయండి',
    profileTitle: 'మీ వివరాలు నమోదు చేయండి',
    aadhaarFilledBadge: '✅ ఆధార్ నుండి నమోదైంది — దయచేసి తనిఖీ చేయండి',
    name: 'పేరు',
    namePlaceholder: 'మీ పూర్తి పేరు',
    age: 'వయస్సు (సంవత్సరాలు)',
    agePlaceholder: 'ఉదా: 45',
    gender: 'లింగం',
    male: 'పురుషుడు',
    female: 'స్త్రీ',
    other: 'ఇతర',
    district: 'జిల్లా',
    selectDistrict: 'జిల్లా ఎంచుకోండి',
    occupation: 'వృత్తి',
    occupations: ['రైతు', 'కార్మికుడు', 'వ్యాపారి', 'ప్రభుత్వ ఉద్యోగి', 'గృహిణి', 'విద్యార్థి', 'ఇతర'],
    annualIncome: 'కుటుంబ వార్షిక ఆదాయం (₹)',
    incomePlaceholder: 'ఉదా: 150000',
    caste: 'కులం / వర్గం',
    castes: ['SC', 'ST', 'OBC', 'General', 'EBC', 'తెలియదు'],
    isStudent: 'కుటుంబంలో 5-18 వయసు పాఠశాల పిల్లలు ఉన్నారా?',
    hasFarmLand: 'మీకు వ్యవసాయ భూమి ఉందా?',
    yes: 'అవును',
    no: 'కాదు',
    checkBtn: '🔍 పథకాలు తనిఖీ చేయండి',
    scanAgain: '🪪 ఆధార్ మళ్ళీ స్కాన్ చేయండి',
    resultsTitle: 'మీకు అర్హమైన పథకాలు',
    noResults: 'మీ వివరాల ఆధారంగా ప్రస్తుతం అర్హత పొందిన పథకాలు కనుగొనబడలేదు. మీ స్థానిక సచివాలయాన్ని సంప్రదించండి.',
    viewScheme: 'పూర్తి వివరాలు చూడండి',
    address: 'చిరునామా',
    addressPlaceholder: 'మీ చిరునామా',
  },
  en: {
    introTitle: 'Scheme Eligibility Check',
    introSubtitle: 'Enter your details and instantly discover schemes you qualify for',
    scanBtn: '🪪 Scan Aadhaar Card (Auto-fill)',
    manualBtn: 'Enter Details Manually',
    profileTitle: 'Enter Your Details',
    aadhaarFilledBadge: '✅ Auto-filled from Aadhaar — Please verify',
    name: 'Full Name',
    namePlaceholder: 'Your full name',
    age: 'Age (Years)',
    agePlaceholder: 'e.g. 45',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    district: 'District',
    selectDistrict: 'Select District',
    occupation: 'Occupation',
    occupations: ['Farmer', 'Labourer', 'Business', 'Govt. Employee', 'Homemaker', 'Student', 'Other'],
    annualIncome: 'Family Annual Income (₹)',
    incomePlaceholder: 'e.g. 150000',
    caste: 'Caste / Category',
    castes: ['SC', 'ST', 'OBC', 'General', 'EBC', "Don't know"],
    isStudent: 'Do you have school-going children (age 5-18)?',
    hasFarmLand: 'Do you own agricultural land?',
    yes: 'Yes',
    no: 'No',
    checkBtn: '🔍 Check Eligible Schemes',
    scanAgain: '🪪 Scan Aadhaar Again',
    resultsTitle: 'Schemes You Qualify For',
    noResults: 'No schemes found based on your current details. Please visit your local Secretariat for guidance.',
    viewScheme: 'View Full Details',
    address: 'Address',
    addressPlaceholder: 'Your address',
  },
} as const;

// Simple local eligibility engine using the scheme categories
function checkEligibility(profile: UserProfile): Scheme[] {
  const age = parseInt(profile.age) || 0;
  const income = parseInt(profile.annualIncome.replace(/[^0-9]/g, '')) || Infinity;
  const eligible: Scheme[] = [];

  for (const scheme of AP_SCHEMES_MINI) {
    // Pension: age 60+, income < 1.5L
    if (scheme.id === 'pension-kanuka' && age >= 60 && income < 150000) {
      eligible.push(scheme);
    }
    // Widow pension: female, age 18+, income < 1.5L
    else if (scheme.id === 'pension-kanuka' && profile.gender === 'Female' && age >= 18 && income < 150000 && !eligible.find(s => s.id === 'pension-kanuka')) {
      eligible.push(scheme);
    }
    // Amma Vodi: mother of school-going children
    else if (scheme.id === 'amma-vodi' && profile.gender === 'Female' && profile.isStudent && income < 150000) {
      eligible.push(scheme);
    }
    // Rythu Bharosa: farmer
    else if (scheme.id === 'rythu-bharosa' && (profile.occupation === 'Farmer' || profile.occupation === 'రైతు') && profile.hasFarmLand) {
      eligible.push(scheme);
    }
    // Aarogyasri: income < 5L (broad eligibility)
    else if (scheme.id === 'aarogyasri' && income < 500000) {
      eligible.push(scheme);
    }
    // Vidya Deevena: student or has student children, income < 2.5L
    else if (scheme.id === 'vidya-deevena' && profile.isStudent && income < 250000) {
      eligible.push(scheme);
    }
    // Cheyutha: woman, age 45-60, SC/ST/BC/EBC
    else if (scheme.id === 'cheyutha' && profile.gender === 'Female' && age >= 45 && age <= 60 &&
             ['SC', 'ST', 'OBC', 'EBC'].includes(profile.caste)) {
      eligible.push(scheme);
    }
    // Housing: income < 3L
    else if (scheme.id === 'pedalandariki-illu' && income < 300000) {
      eligible.push(scheme);
    }
    // Sunna vaddi: for self-help groups / women's groups
    else if (scheme.id === 'sunna-vaddi' && profile.gender === 'Female' && income < 200000) {
      eligible.push(scheme);
    }
  }

  return eligible;
}

export default function EligibilityForm({ language, easyMode, onSchemesFound }: EligibilityFormProps) {
  const t = T[language];
  const [step, setStep] = useState<FormStep>('intro');
  const [aadhaarFilled, setAadhaarFilled] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: '', dob: '', age: '', gender: '', address: '',
    pincode: '', district: '', occupation: '', annualIncome: '',
    caste: '', isStudent: false, hasFarmLand: false, aadhaarScanned: false,
  });

  const handleAadhaarComplete = (partial: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...partial }));
    setAadhaarFilled(true);
    setStep('profile');
  };

  const handleCheck = () => {
    // Validate required fields before checking
    if (!profile.name.trim()) return;
    if (!profile.age || parseInt(profile.age) <= 0) return;
    if (!profile.gender) return;
    const eligible = checkEligibility(profile);
    onSchemesFound(eligible, profile);
    setStep('results');
  };

  const update = (field: keyof UserProfile, value: any) =>
    setProfile(prev => ({ ...prev, [field]: value }));

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="space-y-6" id="eligibility-intro-screen">
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-3xl p-8 text-white text-center shadow-xl">
          <div className="text-5xl mb-4">🏛️</div>
          <h2 className={`font-extrabold mb-2 ${easyMode ? 'text-3xl' : 'text-2xl'}`}>{t.introTitle}</h2>
          <p className={`text-emerald-100 ${easyMode ? 'text-lg' : 'text-sm'}`}>{t.introSubtitle}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setStep('scan')}
            className={`w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-md transition-all ${easyMode ? 'py-6 text-xl' : 'py-5 text-base'}`}
            id="eligibility-scan-aadhaar-btn"
          >
            <ScanLine size={easyMode ? 24 : 20} />
            {t.scanBtn}
          </button>

          <button
            onClick={() => setStep('profile')}
            className={`w-full border-2 border-slate-200 hover:border-emerald-400 text-slate-700 font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all ${easyMode ? 'py-5 text-lg' : 'py-4 text-base'}`}
            id="eligibility-manual-btn"
          >
            <User size={easyMode ? 22 : 18} />
            {t.manualBtn}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── SCAN ───────────────────────────────────────────────────────────────────
  if (step === 'scan') {
    return (
      <AadhaarScanner
        language={language}
        easyMode={easyMode}
        onComplete={handleAadhaarComplete}
        onSkip={() => setStep('profile')}
      />
    );
  }

  // ── PROFILE FORM ───────────────────────────────────────────────────────────
  if (step === 'profile') {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden" id="eligibility-profile-screen">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-6">
          <h2 className={`font-extrabold ${easyMode ? 'text-2xl' : 'text-xl'}`}>{t.profileTitle}</h2>
          {aadhaarFilled && (
            <div className="mt-2 inline-flex items-center gap-2 bg-emerald-600/50 text-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-400/40">
              <CheckCircle size={12} />
              {t.aadhaarFilledBadge}
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Scan Aadhaar button (if not yet scanned) */}
          {!aadhaarFilled && (
            <button
              onClick={() => setStep('scan')}
              className={`w-full border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all ${easyMode ? 'py-4 text-base' : 'py-3 text-sm'}`}
              id="profile-scan-aadhaar-btn"
            >
              <ScanLine size={18} />
              {t.scanBtn}
            </button>
          )}

          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5" htmlFor="profile-name">
              <User size={12} /> {t.name}
            </label>
            <input
              id="profile-name"
              type="text"
              value={profile.name}
              onChange={e => update('name', e.target.value)}
              placeholder={t.namePlaceholder}
              className={`w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 transition-colors ${easyMode ? 'text-lg' : 'text-base'} ${aadhaarFilled && profile.name ? 'border-emerald-200 bg-emerald-50/40' : ''}`}
            />
          </div>

          {/* Age */}
          <div>
            <label className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5" htmlFor="profile-age">
              <Calendar size={12} /> {t.age}
            </label>
            <input
              id="profile-age"
              type="number"
              min="1"
              max="120"
              value={profile.age}
              onChange={e => update('age', e.target.value)}
              placeholder={t.agePlaceholder}
              className={`w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 transition-colors ${easyMode ? 'text-lg' : 'text-base'} ${aadhaarFilled && profile.age ? 'border-emerald-200 bg-emerald-50/40' : ''}`}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">{t.gender}</label>
            <div className="flex gap-3">
              {(['Male', 'Female', 'Other'] as const).map(g => {
                const label = g === 'Male' ? t.male : g === 'Female' ? t.female : t.other;
                return (
                  <button
                    key={g}
                    onClick={() => update('gender', g)}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${easyMode ? 'text-base' : 'text-sm'} ${profile.gender === g ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                    id={`profile-gender-${g.toLowerCase()}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* District */}
          <div>
            <label className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5" htmlFor="profile-district">
              <MapPin size={12} /> {t.district}
            </label>
            <select
              id="profile-district"
              value={profile.district}
              onChange={e => update('district', e.target.value)}
              className={`w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 transition-colors ${easyMode ? 'text-lg' : 'text-base'}`}
            >
              <option value="">{t.selectDistrict}</option>
              {DISTRICTS_AP.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5">
              <Briefcase size={12} /> {t.occupation}
            </label>
            <div className="flex flex-wrap gap-2">
              {t.occupations.map(o => (
                <button
                  key={o}
                  onClick={() => update('occupation', o)}
                  className={`px-4 py-2 rounded-xl border-2 font-semibold transition-all ${easyMode ? 'text-base' : 'text-sm'} ${profile.occupation === o ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                  id={`profile-occ-${o.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Annual Income */}
          <div>
            <label className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5" htmlFor="profile-income">
              <IndianRupee size={12} /> {t.annualIncome}
            </label>
            <input
              id="profile-income"
              type="number"
              min="0"
              value={profile.annualIncome}
              onChange={e => update('annualIncome', e.target.value)}
              placeholder={t.incomePlaceholder}
              className={`w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 transition-colors ${easyMode ? 'text-lg' : 'text-base'}`}
            />
          </div>

          {/* Caste */}
          <div>
            <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">{t.caste}</label>
            <div className="flex flex-wrap gap-2">
              {t.castes.map(c => (
                <button
                  key={c}
                  onClick={() => update('caste', c)}
                  className={`px-4 py-2 rounded-xl border-2 font-semibold transition-all ${easyMode ? 'text-base' : 'text-sm'} ${profile.caste === c ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                  id={`profile-caste-${c.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* School children */}
          <div>
            <label className={`block font-semibold text-slate-700 mb-2 ${easyMode ? 'text-base' : 'text-sm'}`}>
              <GraduationCap size={14} className="inline mr-1" />
              {t.isStudent}
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => update('isStudent', true)}
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${easyMode ? 'text-base' : 'text-sm'} ${profile.isStudent ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                id="profile-student-yes"
              >
                {t.yes}
              </button>
              <button
                onClick={() => update('isStudent', false)}
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${easyMode ? 'text-base' : 'text-sm'} ${!profile.isStudent ? 'bg-slate-600 border-slate-600 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                id="profile-student-no"
              >
                {t.no}
              </button>
            </div>
          </div>

          {/* Farm land */}
          <div>
            <label className={`block font-semibold text-slate-700 mb-2 ${easyMode ? 'text-base' : 'text-sm'}`}>
              <Wheat size={14} className="inline mr-1" />
              {t.hasFarmLand}
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => update('hasFarmLand', true)}
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${easyMode ? 'text-base' : 'text-sm'} ${profile.hasFarmLand ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                id="profile-farmland-yes"
              >
                {t.yes}
              </button>
              <button
                onClick={() => update('hasFarmLand', false)}
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${easyMode ? 'text-base' : 'text-sm'} ${!profile.hasFarmLand ? 'bg-slate-600 border-slate-600 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                id="profile-farmland-no"
              >
                {t.no}
              </button>
            </div>
          </div>

          {/* Address (from Aadhaar) */}
          {aadhaarFilled && profile.address && (
            <div>
              <label className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5" htmlFor="profile-address">
                <MapPin size={12} /> {t.address}
              </label>
              <textarea
                id="profile-address"
                value={profile.address}
                onChange={e => update('address', e.target.value)}
                placeholder={t.addressPlaceholder}
                rows={2}
                className={`w-full bg-emerald-50/40 border-2 border-emerald-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 transition-colors resize-none ${easyMode ? 'text-base' : 'text-sm'}`}
              />
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleCheck}
            className={`w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all mt-2 ${easyMode ? 'py-6 text-xl' : 'py-5 text-base'}`}
            id="eligibility-check-btn"
          >
            <Sparkles size={easyMode ? 24 : 20} />
            {t.checkBtn}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (step === 'results') {
    // Re-use the already-computed results passed from onSchemesFound
    const eligible = checkEligibility(profile);
    return (
      <div className="space-y-5" id="eligibility-results-screen">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white rounded-3xl p-6 shadow-xl">
          <h2 className={`font-extrabold mb-1 ${easyMode ? 'text-2xl' : 'text-xl'}`}>{t.resultsTitle}</h2>
          <p className={`text-emerald-100 ${easyMode ? 'text-base' : 'text-sm'}`}>
            {profile.name && (language === 'te' ? `${profile.name} గారికి` : `For ${profile.name}`)}
          </p>
        </div>

        {eligible.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800 font-medium text-center">
            {t.noResults}
          </div>
        ) : (
          <div className="space-y-4">
            {eligible.map(scheme => (
              <div key={scheme.id} className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 p-5">
                  <span className="text-4xl">{scheme.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-extrabold text-slate-800 ${easyMode ? 'text-lg' : 'text-base'}`}>
                      {language === 'te' ? scheme.nameTe : scheme.nameEn}
                    </h3>
                    <p className={`text-emerald-700 font-semibold mt-0.5 ${easyMode ? 'text-base' : 'text-sm'}`}>
                      {language === 'te' ? scheme.amountTe : scheme.amountEn}
                    </p>
                    <p className={`text-slate-500 mt-1 line-clamp-2 ${easyMode ? 'text-sm' : 'text-xs'}`}>
                      {language === 'te' ? scheme.summaryTe : scheme.summaryEn}
                    </p>
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                    <CheckCircle size={12} />
                    {language === 'te' ? 'మీరు అర్హులు' : 'You qualify'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Re-scan option */}
        <button
          onClick={() => {
            setStep('profile');
            setAadhaarFilled(false);
          }}
          className="w-full border-2 border-slate-200 text-slate-600 font-semibold rounded-2xl py-3 flex items-center justify-center gap-2 hover:border-emerald-300 transition-all text-sm"
          id="eligibility-redo-btn"
        >
          <ScanLine size={16} />
          {t.scanAgain}
        </button>
      </div>
    );
  }

  return null;
}
