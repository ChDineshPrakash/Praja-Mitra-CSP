import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, AlertCircle, FileText, Download } from 'lucide-react';
import type { Language } from '../types';

interface TrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function ApplicationTrackerModal({ isOpen, onClose, language }: TrackerModalProps) {
  const [appId, setAppId] = useState('AP2026105892');
  const [searched, setSearched] = useState(true);

  const isTe = language === 'te';

  if (!isOpen) return null;

  const mockApplications = isTe ? [
    {
      id: 'AP2026105892',
      schemeName: 'పీఎం-కిసాన్ – అన్నదాత సుఖీభవ',
      submittedDate: '15 జనవరి 2026',
      status: 'పరిశీలనలో ఉంది',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-300',
      step: 2,
      officer: 'తహశీల్దార్ కార్యాలయం, దువ్వాడ',
      remarks: 'భూమి రెవెన్యూ రికార్డుల ధృవీకరణ జరుగుతోంది.',
    },
    {
      id: 'AP2026084120',
      schemeName: 'తల్లికి వందనం',
      submittedDate: '20 ఆగస్టు 2026',
      status: 'ఆమోదించబడింది & చెల్లించబడింది',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      step: 4,
      officer: 'జిల్లా విద్యాశాఖాధికారి (DEO)',
      remarks: 'తల్లి బ్యాంకు ఖాతాలో నేరుగా నిధులు జమ చేయబడ్డాయి.',
    },
    {
      id: 'AP2026090123',
      schemeName: 'పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్‌లు (జ్ఞానభూమి)',
      submittedDate: '01 సెప్టెంబర్ 2026',
      status: 'కళాశాల ధృవీకరణ ప్రక్రియలో ఉంది',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
      step: 3,
      officer: 'సాంఘిక సంక్షేమ శాఖ',
      remarks: 'బయోమెట్రిక్ ప్రమాణీకరణ విజయవంతంగా పూర్తయింది.',
    },
  ] : [
    {
      id: 'AP2026105892',
      schemeName: 'PM-Kisan – Annadata Sukhibhava',
      submittedDate: '15 Jan 2026',
      status: 'Under Review',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-300',
      step: 2,
      officer: 'Tahsildar Office, Duvvada',
      remarks: 'Land revenue documents under physical verification.',
    },
    {
      id: 'AP2026084120',
      schemeName: 'Thalliki Vandanam',
      submittedDate: '20 Aug 2026',
      status: 'Approved & Active',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      step: 4,
      officer: 'District Educational Officer',
      remarks: 'Benefit deposited directly to mother bank account.',
    },
    {
      id: 'AP2026090123',
      schemeName: 'Post-Matric Scholarships (JnanaBhumi)',
      submittedDate: '01 Sep 2026',
      status: 'In Progress',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
      step: 3,
      officer: 'Social Welfare Department',
      remarks: 'Biometric authentication verified.',
    },
  ];

  const current = mockApplications.find((a) => a.id.toLowerCase() === appId.trim().toLowerCase()) || mockApplications[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4.5 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base leading-tight">
              {isTe ? 'దరఖాస్తు స్థితి ట్రాక్' : 'Track Application Status'}
            </h3>
            <p className="text-emerald-200 text-xs">
              {isTe 
                ? 'మీ పథకం దరఖాస్తు తాజా పురోగతిని సులభంగా తెలుసుకోండి'
                : 'Check real-time official progress of your AP welfare schemes'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            {isTe ? 'దరఖాస్తు సంఖ్య నమోదు చేయండి' : 'Enter Application Number'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="e.g. AP2026105892"
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => setSearched(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-2xs"
            >
              {isTe ? 'ట్రాక్ చేయండి' : 'Track'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {current && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {isTe ? 'దరఖాస్తు గుర్తింపు సంఖ్య' : 'Application ID'}
                    </span>
                    <h4 className="font-mono font-extrabold text-sm text-slate-900">{current.id}</h4>
                    <p className="font-bold text-emerald-800 text-xs mt-0.5">{current.schemeName}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${current.statusColor}`}>
                    {current.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 border-t border-slate-200/70 pt-2 space-y-1">
                  <p><strong>{isTe ? 'సమర్పించిన తేదీ:' : 'Submitted Date:'}</strong> {current.submittedDate}</p>
                  <p><strong>{isTe ? 'పరిశీలనాధికారి:' : 'Processing Authority:'}</strong> {current.officer}</p>
                  <p><strong>{isTe ? 'తాజా గమనిక:' : 'Current Remarks:'}</strong> {current.remarks}</p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 text-xs">
                  {isTe ? 'దరఖాస్తు దశలు' : 'Application Stages'}
                </h5>
                <div className="space-y-2">
                  {(isTe ? [
                    { step: 1, title: 'సచివాలయంలో దరఖాస్తు నమోదు చేయబడింది', done: current.step >= 1 },
                    { step: 2, title: 'పత్రాలు మరియు ఈ-కేవైసీ ధృవీకరణ', done: current.step >= 2 },
                    { step: 3, title: 'శాఖాధికారి ఆమోదం మరియు అర్హుల జాబితా చేరిక', done: current.step >= 3 },
                    { step: 4, title: 'డైరెక్ట్ బెనిఫిట్ ట్రాన్స్‌ఫర్ (DBT) ద్వారా నిధుల జమ', done: current.step >= 4 },
                  ] : [
                    { step: 1, title: 'Application Submitted at Secretariat', done: current.step >= 1 },
                    { step: 2, title: 'Document & e-KYC Verification', done: current.step >= 2 },
                    { step: 3, title: 'Department Officer Approval', done: current.step >= 3 },
                    { step: 4, title: 'Direct Benefit Transfer (DBT) Credited', done: current.step >= 4 },
                  ]).map((s) => (
                    <div
                      key={s.step}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold ${
                        s.done
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <CheckCircle2 size={16} className={s.done ? 'text-emerald-600' : 'text-slate-300'} />
                      <span>{s.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
