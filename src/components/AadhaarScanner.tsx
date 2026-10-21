/**
 * Document OCR Scanner — Name, DOB, Gender
 *
 * Simple, focused scanner for scheme eligibility auto-fill.
 * Uses image preprocessing + multi-pass Tesseract + Gemini Vision fallback.
 *
 * PRIVACY: 100% client-side. No image stored, logged, or sent to any server.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera,
  Upload,
  ScanLine,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  RotateCcw,
  Shield,
  Info,
  X,
  Loader2,
} from 'lucide-react';
import { runOCR, terminateOCRWorker, type OCRResult } from '../utils/aadhaarOcr';
import { calculateAge } from '../utils/aadhaarOcr';
import type { Language, UserProfile } from '../types';

interface Props {
  language: Language;
  easyMode: boolean;
  onComplete: (profile: Partial<UserProfile>) => void;
  onSkip: () => void;
}

type Step = 'consent' | 'capture' | 'processing' | 'review' | 'done';

const T = {
  te: {
    title: 'ఆధార్ స్కాన్',
    subtitle: 'పేరు, పుట్టిన తేదీ, లింగం — స్వయంచాలకంగా నింపండి',
    consentTitle: 'మీ అనుమతి అవసరం',
    consentBody: 'మీ డాక్యుమెంట్ చిత్రం నుండి పేరు, పుట్టిన తేదీ, లింగం మీ పరికరంలోనే OCR ద్వారా స్వయంచాలకంగా నింపబడతాయి. చిత్రం ఎక్కడికీ పంపబడదు.',
    consentPoints: [
      '📱 మీ పరికరంలో మాత్రమే — ఏ సర్వర్‌కూ పంపబడదు',
      '✏️ నింపిన వివరాలు మీరు మార్చుకోవచ్చు',
      '❌ ఇది గుర్తింపు ధృవీకరణ కాదు — సౌలభ్యం కోసం మాత్రమే',
    ],
    allowBtn: '✅ అనుమతి ఇచ్చి స్కాన్ చేయండి',
    skipBtn: 'దాటవేయి, నేనే నమోదు చేస్తాను',
    uploadBtn: 'చిత్రం ఎంచుకోండి (గ్యాలరీ)',
    cameraBtn: 'కెమెరాతో తీయండి',
    processingTitle: 'OCR ప్రాసెసింగ్...',
    processingSubtitle: 'మీ పరికరంలో వివరాలు చదువుతున్నాం',
    reviewTitle: 'స్కాన్ చేయబడిన వివరాలు — దయచేసి తనిఖీ చేయండి',
    reviewNote: '⚠️ OCR పూర్తిగా నిర్ధారించబడలేదు. మీరు వివరాలు సరిచూసి, తప్పు ఉంటే సరిచేయండి.',
    fieldName: 'పేరు',
    fieldDob: 'పుట్టిన తేదీ',
    fieldGender: 'లింగం',
    confirmBtn: '✅ నిర్ధారించి కొనసాగండి',
    rescanBtn: 'మళ్ళీ స్కాన్ చేయండి',
    lowConfidence: '⚠️ నిర్ధారించుకోండి',
    errorTitle: 'OCR విఫలమైంది',
    errorBody: 'వివరాలు చదవలేకపోయాం. మళ్ళీ ప్రయత్నించండి లేదా నేరుగా నమోదు చేయండి.',
    male: 'పురుషుడు',
    female: 'స్త్రీ',
    other: 'ఇతర',
    notDetected: 'గుర్తించబడలేదు',
    privacyBadge: '🔒 స్థానికంగా ప్రాసెస్',
  },
  en: {
    title: 'ID Scanner',
    subtitle: 'Name, DOB & Gender — auto-filled instantly',
    consentTitle: 'Your Consent is Required',
    consentBody: 'Your document image will be processed entirely on your device using OCR to auto-fill name, date of birth, and gender. The image is never sent to any server.',
    consentPoints: [
      '📱 Processed locally — image never leaves your device',
      '✏️ You can edit any auto-filled field before proceeding',
      '❌ Not identity verification — convenience auto-fill only',
    ],
    allowBtn: '✅ Allow & Start Scanning',
    skipBtn: 'Skip — I\'ll enter details manually',
    uploadBtn: 'Choose Image (Gallery)',
    cameraBtn: 'Take Photo with Camera',
    processingTitle: 'Processing with OCR...',
    processingSubtitle: 'Reading your document on your device',
    reviewTitle: 'Scanned Details — Please Verify',
    reviewNote: '⚠️ OCR may not be 100% accurate. Please review and correct any errors before proceeding.',
    fieldName: 'Name',
    fieldDob: 'Date of Birth',
    fieldGender: 'Gender',
    confirmBtn: '✅ Confirm & Continue',
    rescanBtn: 'Scan Again',
    lowConfidence: '⚠️ Please verify',
    errorTitle: 'OCR Failed',
    errorBody: 'Could not read details. Please try again with a clearer image or enter details manually.',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    notDetected: 'Not detected',
    privacyBadge: '🔒 Processed Locally',
  },
} as const;

export default function AadhaarScanner({ language, easyMode, onComplete, onSkip }: Props) {
  const t = T[language];

  const [step, setStep] = useState<Step>('consent');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const [result, setResult] = useState<OCRResult | null>(null);
  const [editName, setEditName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const urlsRef = useRef<Set<string>>(new Set());

  const track = (url: string) => { urlsRef.current.add(url); return url; };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      urlsRef.current.forEach(u => URL.revokeObjectURL(u));
      urlsRef.current.clear();
      terminateOCRWorker();
    };
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  }, []);

  const processImage = useCallback(async (source: File | string) => {
    setStep('processing');
    setError(null);
    setProgress(0);

    try {
      const r = await runOCR(source, (pct, s) => {
        setProgress(pct);
        setStatus(s);
      });

      stopCamera();
      setResult(r);
      setEditName(r.name);
      setEditDob(r.dob);
      setEditGender(r.gender);
      setStep('review');
    } catch (err) {
      stopCamera();
      console.error('[OCR] Failed:', err);
      setError(t.errorBody);
      setStep('capture');
    }
  }, [stopCamera, t.errorBody]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(track(URL.createObjectURL(file)));
    processImage(file);
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setShowCamera(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setError('Camera access denied. Please use the upload option or check permissions.');
    }
  }, []);

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setPreviewUrl(dataUrl);
    processImage(dataUrl);
  };

  const confirm = () => {
    const age = calculateAge(editDob);
    onComplete({
      name: editName.trim(),
      dob: editDob.trim(),
      age,
      gender: editGender,
      aadhaarScanned: true,
    });
    setStep('done');
  };

  const rescan = () => {
    setStep('capture');
    setResult(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      urlsRef.current.delete(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const hasData = editName || editDob || editGender;

  // ── CONSENT ────────────────────────────────────────────────────────────────
  if (step === 'consent') {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <ScanLine size={28} className="text-white" />
          </div>
          <div>
            <h2 className={`font-extrabold ${easyMode ? 'text-2xl' : 'text-xl'}`}>{t.title}</h2>
            <p className={`text-emerald-100 mt-0.5 ${easyMode ? 'text-base' : 'text-sm'}`}>{t.subtitle}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 font-semibold w-fit">
            <Shield size={14} /> {t.privacyBadge}
          </div>

          <div>
            <h3 className={`font-extrabold text-slate-800 mb-2 ${easyMode ? 'text-xl' : 'text-lg'}`}>{t.consentTitle}</h3>
            <p className={`text-slate-600 leading-relaxed ${easyMode ? 'text-base' : 'text-sm'}`}>{t.consentBody}</p>
          </div>

          <ul className="space-y-3">
            {t.consentPoints.map((pt, i) => (
              <li key={i} className={`flex items-start gap-2 text-slate-700 ${easyMode ? 'text-base' : 'text-sm'}`}>
                <span>{pt}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => setStep('capture')}
              className={`w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 ${easyMode ? 'py-5 text-lg' : 'py-4 text-base'}`}
            >
              <ScanLine size={easyMode ? 22 : 18} /> {t.allowBtn}
            </button>
            <button
              onClick={onSkip}
              className={`w-full border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 ${easyMode ? 'py-4 text-base' : 'py-3 text-sm'}`}
            >
              {t.skipBtn} <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex gap-2 bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-500">
            <Info size={14} className="shrink-0 mt-0.5 text-slate-400" />
            <span>
              {language === 'te'
                ? 'ఈ స్కానర్ UIDAI లేదా ఏ ప్రభుత్వ సంస్థ అనుమతి పొందిన సేవ కాదు. ఇది ఫారమ్ నింపే సౌలభ్యం కోసం మాత్రమే.'
                : 'This scanner is not a UIDAI or government-authorized service. It is for form auto-fill convenience only.'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── CAPTURE ────────────────────────────────────────────────────────────────
  if (step === 'capture') {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScanLine size={22} />
            <h2 className={`font-extrabold ${easyMode ? 'text-xl' : 'text-lg'}`}>{t.title}</h2>
          </div>
          <button onClick={onSkip} className="text-emerald-200 hover:text-white p-1" aria-label="Close"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-medium">
              <AlertCircle size={18} className="shrink-0 mt-0.5" /> <span>{error}</span>
            </div>
          )}

          {showCamera ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-4 border-emerald-400 rounded-xl w-4/5 h-3/5 opacity-70 pointer-events-none" />
                </div>
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="text-white text-xs bg-black/50 px-3 py-1 rounded-full">
                    {language === 'te' ? 'డాక్యుమెంట్ బాక్స్‌లో ఉంచండి' : 'Align document within the box'}
                  </span>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-3">
                <button onClick={capture} className={`flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow ${easyMode ? 'py-5 text-lg' : 'py-4 text-base'}`}>
                  <Camera size={easyMode ? 22 : 18} /> {language === 'te' ? 'ఫోటో తీయండి' : 'Capture Photo'}
                </button>
                <button onClick={stopCamera} className="px-5 py-4 border-2 border-slate-200 text-slate-600 font-semibold rounded-2xl hover:bg-slate-50 transition-all">
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-50 to-slate-50 rounded-2xl p-6 border-2 border-dashed border-emerald-200 text-center space-y-2">
                <div className="text-5xl">🪪</div>
                <p className={`font-semibold text-slate-700 ${easyMode ? 'text-base' : 'text-sm'}`}>
                  {language === 'te'
                    ? 'పేరు, పుట్టిన తేదీ, లింగం ఉన౨ వైపు స్కాన్ చేయండి'
                    : 'Scan the side with name, DOB & gender'}
                </p>
              </div>

              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
              <button
                onClick={() => { if (fileRef.current) { fileRef.current.removeAttribute('capture'); fileRef.current.click(); } }}
                className={`w-full border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all ${easyMode ? 'py-5 text-lg' : 'py-4 text-base'}`}
              >
                <Upload size={easyMode ? 22 : 18} /> {t.uploadBtn}
              </button>

              <button
                onClick={startCamera}
                className={`w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-md ${easyMode ? 'py-5 text-lg' : 'py-4 text-base'}`}
              >
                <Camera size={easyMode ? 22 : 18} /> {t.cameraBtn}
              </button>

              <button onClick={onSkip} className={`w-full text-slate-500 hover:text-slate-700 font-medium underline-offset-2 hover:underline transition-colors ${easyMode ? 'text-base' : 'text-sm'}`}>
                {t.skipBtn}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── PROCESSING ─────────────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-5">
          <h2 className={`font-extrabold flex items-center gap-2 ${easyMode ? 'text-xl' : 'text-lg'}`}>
            <Loader2 size={20} className="animate-spin" /> {t.processingTitle}
          </h2>
        </div>
        <div className="p-8 space-y-6 text-center">
          {previewUrl && (
            <div className="relative mx-auto w-48 h-32 rounded-xl overflow-hidden shadow-md border border-slate-200">
              <img src={previewUrl} alt="Scanning" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-emerald-600/20 flex items-center justify-center">
                <ScanLine size={32} className="text-emerald-600 animate-pulse" />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className={`text-slate-600 font-medium ${easyMode ? 'text-base' : 'text-sm'}`}>{status || t.processingSubtitle}</p>
            <p className="text-xs text-slate-400">{progress}%</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 font-semibold">
            <Shield size={14} /> {t.privacyBadge}
          </div>
        </div>
      </div>
    );
  }

  // ── REVIEW ─────────────────────────────────────────────────────────────────
  if (step === 'review' && result) {
    const conf = result.confidence;

    const Badge = ({ score }: { score: number }) => {
      if (score >= 0.8) return <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200"><CheckCircle size={11} /> High</span>;
      if (score >= 0.5) return <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-200"><AlertCircle size={11} /> {t.lowConfidence}</span>;
      return <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-semibold border border-red-200"><AlertCircle size={11} /> {t.notDetected}</span>;
    };

    return (
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} />
            <h2 className={`font-extrabold ${easyMode ? 'text-xl' : 'text-lg'}`}>{t.reviewTitle}</h2>
          </div>
          <button onClick={rescan} className="text-emerald-200 hover:text-white flex items-center gap-1 text-xs font-bold transition-colors">
            <RotateCcw size={14} /> {t.rescanBtn}
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm font-medium">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /> <span>{t.reviewNote}</span>
          </div>

          {/* Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t.fieldName}</label>
              <Badge score={conf.name} />
            </div>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder={t.notDetected}
              className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 transition-colors ${conf.name < 0.5 ? 'border-amber-300' : 'border-slate-200'} ${easyMode ? 'text-lg' : 'text-base'}`}
            />
          </div>

          {/* DOB */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t.fieldDob}</label>
              <Badge score={conf.dob} />
            </div>
            <input
              type="text"
              value={editDob}
              onChange={e => setEditDob(e.target.value)}
              placeholder="DD/MM/YYYY"
              className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 transition-colors ${conf.dob < 0.5 ? 'border-amber-300' : 'border-slate-200'} ${easyMode ? 'text-lg' : 'text-base'}`}
            />
          </div>

          {/* Gender */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t.fieldGender}</label>
              <Badge score={conf.gender} />
            </div>
            <div className="flex gap-3">
              {(['Male', 'Female', 'Other'] as const).map(g => {
                const label = g === 'Male' ? t.male : g === 'Female' ? t.female : t.other;
                return (
                  <button
                    key={g}
                    onClick={() => setEditGender(g)}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${easyMode ? 'text-base' : 'text-sm'} ${editGender === g ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={confirm}
              disabled={!hasData}
              className={`w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-95 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md ${easyMode ? 'py-5 text-lg' : 'py-4 text-base'}`}
            >
              <CheckCircle size={easyMode ? 22 : 18} /> {t.confirmBtn}
            </button>
            <button
              onClick={rescan}
              className={`w-full border-2 border-slate-200 text-slate-600 hover:border-slate-300 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all ${easyMode ? 'py-4 text-base' : 'py-3 text-sm'}`}
            >
              <RotateCcw size={16} /> {t.rescanBtn}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
            <Shield size={12} />
            <span>{language === 'te' ? 'మీ వివరాలు మీ పరికరంలో మాత్రమే ప్రాసెస్ చేయబడ్డాయి' : 'Your data was processed locally on your device only'}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
