import React, { useState } from 'react';
import { X, MapPin, Phone, Clock, Navigation, Search, CheckCircle } from 'lucide-react';
import type { Language } from '../types';

interface SachivalayamModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const DISTRICTS_AP = [
  'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla',
  'Chittoor', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur',
  'Kakinada', 'Krishna', 'Kurnool', 'Nandyal', 'NTR', 'Palnadu', 'Parvathipuram Manyam',
  'Prakasam', 'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 'Srikakulam',
  'Tirupati', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'
];

export default function SachivalayamModal({ isOpen, onClose, language }: SachivalayamModalProps) {
  const [selectedDistrict, setSelectedDistrict] = useState('Visakhapatnam');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

  const isTe = language === 'te';

  if (!isOpen) return null;

  const sampleSachivalayams = isTe ? [
    {
      id: 'sach-1',
      name: 'గ్రామ సచివాలయం – దువ్వాడ',
      code: 'GS-VSP-0412',
      mandal: 'గాజువాక',
      district: selectedDistrict,
      distance: '2.4 కి.మీ',
      address: 'ప్రధాన రహదారి, దువ్వాడ గ్రామం, జడ్పీ హైస్కూల్ సమీపంలో',
      timing: 'ఉదయం 9:00 – సాయంత్రం 5:00 (సోమ – శని)',
      phone: '0891-2541234',
      officer: 'కె. రమణ, పంచాయతీ కార్యదర్శి',
    },
    {
      id: 'sach-2',
      name: 'వార్డు సచివాలయం – గాజువాక సెంటర్',
      code: 'WS-VSP-0418',
      mandal: 'గాజువాక',
      district: selectedDistrict,
      distance: '3.8 కి.మీ',
      address: 'పాత బస్టాండ్ సమీపంలో, గాజువాక',
      timing: 'ఉదయం 9:00 – సాయంత్రం 5:00 (సోమ – శని)',
      phone: '0891-2545678',
      officer: 'ఎస్. లక్ష్మి, సంక్షేమ సహాయకురాలు',
    },
    {
      id: 'sach-3',
      name: 'గ్రామ సచివాలయం – కూర్మన్నపాలెం',
      code: 'GS-VSP-0422',
      mandal: 'గాజువాక',
      district: selectedDistrict,
      distance: '5.1 కి.మీ',
      address: 'స్టీల్ ప్లాంట్ రోడ్, కూర్మన్నపాలెం జంక్షన్',
      timing: 'ఉదయం 9:00 – సాయంత్రం 5:00 (సోమ – శని)',
      phone: '0891-2549988',
      officer: 'పి. శ్రీనివాస్, డిజిటల్ అసిస్టెంట్',
    },
  ] : [
    {
      id: 'sach-1',
      name: 'Grama Sachivalayam – Duvvada',
      code: 'GS-VSP-0412',
      mandal: 'Gajuwaka',
      district: selectedDistrict,
      distance: '2.4 km',
      address: 'Main Road, Duvvada Village, Near ZP High School',
      timing: '9:00 AM – 5:00 PM (Mon – Sat)',
      phone: '0891-2541234',
      officer: 'K. Ramana, Panchayat Secretary',
    },
    {
      id: 'sach-2',
      name: 'Ward Sachivalayam – Gajuwaka Center',
      code: 'WS-VSP-0418',
      mandal: 'Gajuwaka',
      district: selectedDistrict,
      distance: '3.8 km',
      address: 'Near Old Bus Stand, Gajuwaka',
      timing: '9:00 AM – 5:00 PM (Mon – Sat)',
      phone: '0891-2545678',
      officer: 'S. Lakshmi, Welfare Assistant',
    },
    {
      id: 'sach-3',
      name: 'Grama Sachivalayam – Kurmannapalem',
      code: 'GS-VSP-0422',
      mandal: 'Gajuwaka',
      district: selectedDistrict,
      distance: '5.1 km',
      address: 'Steel Plant Road, Kurmannapalem Junction',
      timing: '9:00 AM – 5:00 PM (Mon – Sat)',
      phone: '0891-2549988',
      officer: 'P. Srinivas, Digital Assistant',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MapPin size={22} className="text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {isTe ? 'సమీప సచివాలయాలు' : 'Nearby Sachivalayams'}
              </h3>
              <p className="text-emerald-200 text-xs">
                {isTe 
                  ? 'మీ గ్రామ/వార్డు సచివాలయం మరియు సంక్షేమ సహాయకుల వివరాలు'
                  : 'Find your village/ward secretariat, welfare assistant, and services'}
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

        {/* Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                {isTe ? 'జిల్లా ఎంచుకోండి' : 'District'}
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                {DISTRICTS_AP.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                {isTe ? 'మండలం లేదా గ్రామం శోధించండి' : 'Search Mandal / Village'}
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={isTe ? 'ఉదా: దువ్వాడ, గాజువాక...' : 'e.g. Duvvada, Gajuwaka...'}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Toggle Map / List */}
          <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-200/50 max-w-xs mx-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 py-1 rounded-md transition-all ${
                activeTab === 'map' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              {isTe ? 'మ్యాప్ రూపం' : '📍 Map View'}
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-1 rounded-md transition-all ${
                activeTab === 'list' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              {isTe ? 'జాబితా రూపం' : '📋 List View'}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'map' && (
            <div className="space-y-3">
              <div className="h-48 rounded-2xl bg-emerald-50 border border-emerald-200 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:12px_12px]" />
                
                <svg className="absolute inset-0 w-full h-full stroke-emerald-300/60 stroke-2 fill-none">
                  <path d="M 0 50 Q 150 120 300 80 T 600 120" />
                  <path d="M 100 0 Q 180 150 250 250" />
                  <path d="M 400 0 Q 380 150 450 250" />
                </svg>

                <div className="absolute top-1/4 left-1/3 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shadow-md border-2 border-white">
                    🏛️
                  </div>
                  <span className="bg-white/95 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs border mt-0.5">
                    {isTe ? 'దువ్వాడ సచివాలయం (2.4 కి.మీ)' : 'Duvvada GS (2.4 km)'}
                  </span>
                </div>

                <div className="absolute bottom-1/4 right-1/3 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shadow-md border-2 border-white">
                    🏛️
                  </div>
                  <span className="bg-white/95 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs border mt-0.5">
                    {isTe ? 'గాజువాక సచివాలయం (3.8 కి.మీ)' : 'Gajuwaka WS (3.8 km)'}
                  </span>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-600 animate-ping absolute" />
                  <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md relative" />
                  <span className="bg-blue-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-2xs mt-1">
                    {isTe ? 'మీరు ఇక్కడ ఉన్నారు' : 'You are here'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* List of Secretariats */}
          <div className="space-y-3">
            {sampleSachivalayams.map((sach) => (
              <div
                key={sach.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-300 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{sach.name}</h4>
                    <p className="text-slate-500 text-xs mt-0.5">{sach.address}</p>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold mt-1 inline-block">
                      {sach.code}
                    </span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                    {sach.distance}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400" />
                    <span>{sach.timing}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" />
                    <a href={`tel:${sach.phone}`} className="text-emerald-700 font-semibold hover:underline">
                      {sach.phone}
                    </a>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(sach.name + ' ' + sach.district)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Navigation size={13} />
                    <span>{isTe ? 'మార్గం చూడండి (మ్యాప్)' : 'Get Directions'}</span>
                  </a>
                  <a
                    href={`tel:${sach.phone}`}
                    className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone size={13} />
                    <span>{isTe ? 'కాల్ చేయండి' : 'Call Helpline'}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
