import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Smartphone, User, MapPin, KeyRound, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { AuthUser, Language } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

const AP_DISTRICTS = [
  'Alluri Sitharama Raju',
  'Anakapalli',
  'Ananthapuramu',
  'Annamayya',
  'Bapatla',
  'Chittoor',
  'Dr. B.R. Ambedkar Konaseema',
  'East Godavari',
  'Eluru',
  'Guntur',
  'Kakinada',
  'Krishna',
  'Kurnool',
  'Nandyal',
  'NTR (Vijayawada)',
  'Palnadu',
  'Parvathipuram Manyam',
  'Prakasam',
  'Sri Potti Sriramulu Nellore',
  'Sri Sathya Sai',
  'Srikakulam',
  'Tirupati',
  'Visakhapatnam',
  'Vizianagaram',
  'West Godavari',
  'YSR Kadapa',
];

export default function AuthModal({ isOpen, onClose, language, onLoginSuccess }: AuthModalProps) {
  const isTe = language === 'te';
  const [activeTab, setActiveTab] = useState<'otp' | 'password' | 'register'>('otp');

  // Form states
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('Guntur');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Clear notices on tab switch
  const switchTab = (tab: 'otp' | 'password' | 'register') => {
    setActiveTab(tab);
    setError(null);
    setSuccessMsg(null);
    setOtpSent(false);
    setDevOtpHint(null);
  };

  // 1. Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setError(isTe ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబరును నమోదు చేయండి.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleanMobile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setOtpSent(true);
      setSuccessMsg(data.message || (isTe ? 'ఓటీపీ పంపబడింది.' : 'OTP sent successfully.'));
      if (data.devOtp) {
        setDevOtpHint(data.devOtp);
        setOtp(data.devOtp); // Auto-fill for convenience
      }
    } catch (err: any) {
      setError(err.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10 || otp.trim().length !== 6) {
      setError(isTe ? 'దయచేసి 6 అంకెల ఓటీపీని నమోదు చేయండి.' : 'Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleanMobile, otp: otp.trim(), district }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');

      localStorage.setItem('praja_token', data.token);
      localStorage.setItem('praja_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // 3. Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || !password) {
      setError(isTe ? 'మొబైల్/ఈమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.' : 'Please provide mobile/email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: mobile.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('praja_token', data.token);
      localStorage.setItem('praja_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // 4. Register New Citizen
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');
    if (!name.trim()) {
      setError(isTe ? 'దయచేసి మీ పూర్తి పేరును నమోదు చేయండి.' : 'Please enter your full name.');
      return;
    }
    if (cleanMobile.length !== 10) {
      setError(isTe ? 'దయచేసి 10 అంకెల మొబైల్ నంబరు నమోదు చేయండి.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setError(isTe ? 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.' : 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobile: cleanMobile,
          password,
          district,
          aadhaarLast4: aadhaarLast4.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('praja_token', data.token);
      localStorage.setItem('praja_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // 5. One-click Demo Account Login
  const handleQuickDemoLogin = (demoMobile: string) => {
    setMobile(demoMobile);
    setPassword('Praja@123');
    setLoading(true);
    setError(null);

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: demoMobile, password: 'Praja@123' }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token && data.user) {
          localStorage.setItem('praja_token', data.token);
          localStorage.setItem('praja_user', JSON.stringify(data.user));
          onLoginSuccess(data.user, data.token);
          onClose();
        } else {
          setError(data.error || 'Demo login failed');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20 shadow-xs">
              <ShieldCheck size={24} className="text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg leading-tight tracking-tight text-white">
                  {isTe ? 'ప్రజా మిత్ర • పౌరుల లాగిన్' : 'Praja Mitra • Citizen Portal'}
                </h3>
              </div>
              <p className="text-emerald-200/90 text-xs mt-0.5">
                {isTe ? 'ఆంధ్రప్రదేశ్ సంక్షేమ పథకాల భద్రమైన లాగిన్' : 'Simple & Secure AP Citizen Authentication'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 bg-slate-100 p-1.5 border-b border-slate-200 text-xs font-bold text-slate-600">
          <button
            onClick={() => switchTab('otp')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'otp' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            {isTe ? 'ఓటీపీ లాగిన్' : 'Mobile / OTP'}
          </button>
          <button
            onClick={() => switchTab('password')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'password' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            {isTe ? 'పాస్‌వర్డ్ లాగిన్' : 'Password'}
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'register' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            {isTe ? 'కొత్త నమోదు' : 'Register'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[75vh]">
          
          {/* Error Notice */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs sm:text-sm flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Notice */}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p>{successMsg}</p>
                {devOtpHint && (
                  <p className="mt-1 text-[11px] font-mono text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded inline-block">
                    {isTe ? 'పరీక్ష ఓటీపీ:' : 'Demo OTP:'} <strong>{devOtpHint}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: OTP Login (Standard AP Citizen Style) */}
          {activeTab === 'otp' && (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isTe ? 'మొబైల్ నంబరు లేదా ఆధార్‌తో లింక్ అయిన నంబరు' : 'Mobile Number (Linked with Aadhaar)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    disabled={otpSent}
                    className="w-full pl-13 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {isTe ? '6 అంకెల ఓటీపీ (OTP)' : 'Enter 6-digit OTP'}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="text-xs text-emerald-700 font-bold hover:underline"
                    >
                      {isTe ? 'మళ్ళీ పంపండి' : 'Resend OTP'}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg font-mono tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isTe ? 'మాస్టర్ టెస్ట్ ఓటీపీ: 123456' : 'Master test OTP: 123456'}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                <span>
                  {otpSent
                    ? isTe ? 'ధృవీకరించి లాగిన్ చేయండి' : 'Verify & Login'
                    : isTe ? 'ఓటీపీని పంపండి' : 'Send Secure OTP'}
                </span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* TAB 2: Password Login */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isTe ? 'మొబైల్ నంబరు లేదా ఈమెయిల్' : 'Mobile Number or Email'}
                </label>
                <div className="relative">
                  <Smartphone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isTe ? 'పాస్‌వర్డ్' : 'Password'}
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                <span>{isTe ? 'లాగిన్ చేయండి' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* TAB 3: New Citizen Registration */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isTe ? 'పూర్తి పేరు (ఆధార్ ప్రకారం)' : 'Full Name (as per Aadhaar)'}
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isTe ? 'మీ పూర్తి పేరు' : 'e.g. N. Rama Rao'}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isTe ? '10 అంకెల మొబైల్ నంబరు' : '10-Digit Mobile Number'}
                </label>
                <div className="relative">
                  <Smartphone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {isTe ? 'జిల్లా' : 'District'}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  >
                    {AP_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {isTe ? 'ఆధార్ చివరి 4' : 'Aadhaar Last 4'}
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={aadhaarLast4}
                    onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, ''))}
                    placeholder="5432"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-center text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isTe ? 'పాస్‌వర్డ్ సృష్టించండి (కనీసం 6 అక్షరాలు)' : 'Create Password (min. 6 characters)'}
                </label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs mt-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                <span>{isTe ? 'ఖాతా నమోదు చేయండి' : 'Create Citizen Account'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Quick Demo Citizens */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {isTe ? 'తక్షణ పరీక్ష లాగిన్ (1-క్లిక్)' : '1-Click Demo Accounts'}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                {isTe ? 'డెమో ఖాతాలు' : 'Instant Test'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('9876543210')}
                className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors bg-slate-50"
              >
                <p className="text-xs font-bold text-slate-800">
                  {isTe ? 'నరసింహారావు' : 'N. Narasimha Rao'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {isTe ? 'రైతు • గుంటూరు' : 'Farmer • Guntur'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('9123456780')}
                className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors bg-slate-50"
              >
                <p className="text-xs font-bold text-slate-800">
                  {isTe ? 'లక్ష్మి దేవి' : 'K. Lakshmi Devi'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {isTe ? 'తల్లి • కృష్ణా' : 'Mother • Krishna'}
                </p>
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock size={12} className="text-emerald-700" />
            <span>{isTe ? '256-బిట్ సురక్షిత ఎన్‌క్రిప్షన్' : '256-bit Secure Encryption'}</span>
          </div>
          <span>{isTe ? 'గ్రామ సచివాలయ డేటాబేస్' : 'Sachivalayam Verified'}</span>
        </div>

      </div>
    </div>
  );
}
