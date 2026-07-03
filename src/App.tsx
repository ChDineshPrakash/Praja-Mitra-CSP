import React, { useState, useEffect, useRef } from 'react';
import { 
  Languages, 
  Search, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  FileText, 
  MapPin, 
  Phone, 
  ArrowLeft, 
  Sparkles, 
  HelpCircle, 
  Info, 
  Home, 
  Layers, 
  ChevronRight, 
  Grid, 
  CheckSquare, 
  Square,
  AlertCircle
} from 'lucide-react';
import { AP_SCHEMES, Scheme, FAQ_ITEMS, DAILY_UPDATES, EMERGENCY_HELPLINES } from './data/schemes.ts';
import LanguageScreen from './components/LanguageScreen.tsx';

// Interface for Chat History
interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

// Helper function to find the absolute highest-quality Telugu female voice from SpeechSynthesisVoice list.
// Filters and scores voices based on natural/neural/online markers, female indicators, and vendor quality.
const getBestTeluguVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  const teluguVoices = voices.filter(v => {
    const isTe = v.lang.toLowerCase().startsWith('te') || v.lang.toLowerCase().includes('-te-') || v.name.toLowerCase().includes('telugu');
    // Ensure we exclude voices that are primarily English or have an English accent
    const containsEnAccent = v.name.toLowerCase().includes('english') || v.name.toLowerCase().includes('accent');
    return isTe && !containsEnAccent;
  });

  if (teluguVoices.length === 0) return null;

  // Let's rate each voice
  const ratedVoices = teluguVoices.map(voice => {
    let score = 0;
    const lowerName = voice.name.toLowerCase();
    const lowerLang = voice.lang.toLowerCase();

    // 1. Extreme priority for V3 natural/neural (e.g. Google or Microsoft V3 / Natural V3 Indian Telugu engines)
    if (lowerName.includes('v3') || lowerName.includes('-v3') || lowerName.includes(' v3')) {
      score += 10000;
    }

    // 2. High priority for general natural, neural, or online engines
    if (lowerName.includes('natural') || lowerName.includes('neural') || lowerName.includes('online')) {
      score += 3000;
    }
    
    // Prefer female names/markers to fulfill the 'telugu girl' requirement
    if (
      lowerName.includes('female') || 
      lowerName.includes('girl') || 
      lowerName.includes('shruti') || 
      lowerName.includes('heera') || 
      lowerName.includes('swara') ||
      lowerName.includes('kavya') ||
      lowerName.includes('priya') ||
      lowerName.includes('uma') ||
      lowerName.includes('vanya') ||
      lowerName.includes('vruta') ||
      lowerName.includes('pallavi') ||
      lowerName.includes('vani') ||
      lowerName.includes('lakshmi') ||
      lowerName.includes('sita')
    ) {
      score += 1500;
    }

    // Google / Microsoft usually have premium pre-baked neural or natural voices
    if (lowerName.includes('google')) {
      score += 500;
    }
    if (lowerName.includes('microsoft')) {
      score += 400;
    }

    // Heavy penalty for older standard offline/classic desktop/local synthesizers
    if (lowerName.includes('standard') || lowerName.includes('offline') || lowerName.includes('desktop') || lowerName.includes('local') || lowerName.includes('espeak')) {
      score -= 2000;
    }

    // Absolute penalty for non-native languages/foreign accents
    if (lowerLang.includes('en') && !lowerLang.includes('te')) {
      score -= 8000;
    }

    return { voice, score };
  });

  // Sort by score descending
  ratedVoices.sort((a, b) => b.score - a.score);

  return ratedVoices[0].voice;
};

// Sorting helper to put the best premium voices at the top of the interface selection
const sortVoicesByQuality = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] => {
  return [...voices].sort((a, b) => {
    const isTeA = a.lang.toLowerCase().startsWith('te') || a.name.toLowerCase().includes('telugu');
    const isTeB = b.lang.toLowerCase().startsWith('te') || b.name.toLowerCase().includes('telugu');

    // Telugu first we want to prioritize
    if (isTeA && !isTeB) return -1;
    if (!isTeA && isTeB) return 1;

    const lowerA = a.name.toLowerCase();
    const lowerB = b.name.toLowerCase();

    // Prioritize natural v3 first
    const isAV3 = lowerA.includes('v3') || lowerA.includes('-v3');
    const isBV3 = lowerB.includes('v3') || lowerB.includes('-v3');

    if (isAV3 && !isBV3) return -1;
    if (!isAV3 && isBV3) return 1;

    // Within Telugu or English, prioritize natural/neural/online engines over standard
    const isAPremium = lowerA.includes('natural') || lowerA.includes('neural') || lowerA.includes('online');
    const isBPremium = lowerB.includes('natural') || lowerB.includes('neural') || lowerB.includes('online');

    if (isAPremium && !isBPremium) return -1;
    if (!isAPremium && isBPremium) return 1;

    // Next prioritize female
    const isAFemale = lowerA.includes('female') || lowerA.includes('girl') || lowerA.includes('shruti') || lowerA.includes('heera') || lowerA.includes('swara') || lowerA.includes('kavya') || lowerA.includes('priya') || lowerA.includes('uma') || lowerA.includes('vanya') || lowerA.includes('vruta');
    const isBFemale = lowerB.includes('female') || lowerB.includes('girl') || lowerB.includes('shruti') || lowerB.includes('heera') || lowerB.includes('swara') || lowerB.includes('kavya') || lowerB.includes('priya') || lowerB.includes('uma') || lowerB.includes('vanya') || lowerB.includes('vruta');

    if (isAFemale && !isBFemale) return -1;
    if (!isAFemale && isBFemale) return 1;

    // Rest alphabetical
    return a.name.localeCompare(b.name);
  });
};

export default function App() {
  // --- STATE ---
  const [language, setLanguage] = useState<'en' | 'te' | null>(() => {
    const saved = localStorage.getItem('ap_sahayak_lang');
    return (saved === 'en' || saved === 'te') ? saved : null;
  });

  const [easyMode, setEasyMode] = useState<boolean>(() => {
    return localStorage.getItem('ap_sahayak_easymode') === 'true';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  // Active Menu / Screen navigation: 'home' | 'checklist' | 'map' | 'helpline'
  const [activeTab, setActiveTab] = useState<'home' | 'checklist' | 'map' | 'helpline'>('home');

  // TTS State
  const [isSpeaking, _setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);
  const setIsSpeaking = (val: boolean) => {
    isSpeakingRef.current = val;
    _setIsSpeaking(val);
  };
  const [currentlySpeakingText, setCurrentlySpeakingText] = useState('');
  
  // Custom Voice Synthesis Tuning States for Realistic Telugu Girl / Female Voice
  const [pitch, setPitch] = useState<number>(() => {
    const saved = localStorage.getItem('ap_sahayak_voice_pitch');
    return saved ? parseFloat(saved) : 1.25; // Default 1.25 for a young realistic female pitch
  });
  const [rate, setRate] = useState<number>(() => {
    const saved = localStorage.getItem('ap_sahayak_voice_rate');
    return saved ? parseFloat(saved) : 0.9;  // Stable clear presentation speed
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => {
    return localStorage.getItem('ap_sahayak_voice_name') || '';
  });
  const [showVoiceSettingsToggle, setShowVoiceSettingsToggle] = useState(false);
  
  // Voice Mode / Continuous Listening State
  const [isListening, setIsListening] = useState(false);
  const [voiceGuidanceActive, _setVoiceGuidanceActive] = useState(false);
  const voiceGuidanceActiveRef = useRef(false);
  const setVoiceGuidanceActive = (val: boolean) => {
    voiceGuidanceActiveRef.current = val;
    _setVoiceGuidanceActive(val);
  };
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Documents Checklist Builder Answers State
  const [checklistAnswers, setChecklistAnswers] = useState({
    occupation: '', // 'farmer', 'student', 'other'
    age: '',        // 'old', 'mid', 'young'
    income: '',     // 'low', 'high'
    disabled: '',   // 'yes', 'no'
    gender: '',     // 'female', 'male'
  });
  const [checklistResults, setChecklistResults] = useState<string[]>([]);

  // Nearby Office State
  const [selectedDistrict, setSelectedDistrict] = useState('Guntur');
  const [selectedOfficeType, setSelectedOfficeType] = useState<'sachivalayam' | 'meeseva'>('sachivalayam');

  // Refs
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- PERSISTENCE & SERVICE WORKER ---
  useEffect(() => {
    if (language) {
      localStorage.setItem('ap_sahayak_lang', language);
    } else {
      localStorage.removeItem('ap_sahayak_lang');
    }
  }, [language]);

  useEffect(() => {
    localStorage.setItem('ap_sahayak_easymode', String(easyMode));
  }, [easyMode]);

  // Persist Voice Settings
  useEffect(() => {
    localStorage.setItem('ap_sahayak_voice_pitch', String(pitch));
  }, [pitch]);

  useEffect(() => {
    localStorage.setItem('ap_sahayak_voice_rate', String(rate));
  }, [rate]);

  useEffect(() => {
    if (selectedVoiceName) {
      localStorage.setItem('ap_sahayak_voice_name', selectedVoiceName);
    }
  }, [selectedVoiceName]);

  // Dynamically query available real SpeechSynthesis engines
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const queryWebSpeechVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      
      // Sort to prioritize highest quality natural/neural/female voices at the top
      const sorted = sortVoicesByQuality(voices);
      setAvailableVoices(sorted);
      
      // Find the absolute best Telugu natural/neural/female voice match
      const bestTeluguFemale = getBestTeluguVoice(voices);
      const savedVoice = localStorage.getItem('ap_sahayak_voice_name');
      
      if (bestTeluguFemale) {
        // Automatically set the best Telugu female voice if none is selected yet,
        // OR upgrade automatically if the existing saved voice is not premium but a high quality neural/natural is now available
        if (!savedVoice || savedVoice === '') {
          setSelectedVoiceName(bestTeluguFemale.name);
          localStorage.setItem('ap_sahayak_voice_name', bestTeluguFemale.name);
        } else {
          const lowerSaved = savedVoice.toLowerCase();
          const currentIsPremium = lowerSaved.includes('natural') || lowerSaved.includes('neural') || lowerSaved.includes('online');
          
          const lowerBest = bestTeluguFemale.name.toLowerCase();
          const bestIsPremium = lowerBest.includes('natural') || lowerBest.includes('neural') || lowerBest.includes('online');
          
          if (!currentIsPremium && bestIsPremium) {
            setSelectedVoiceName(bestTeluguFemale.name);
            localStorage.setItem('ap_sahayak_voice_name', bestTeluguFemale.name);
          }
        }
      }
    };

    queryWebSpeechVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = queryWebSpeechVoices;
    }
  }, []);

  // Register service worker for official PWA support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('[PWA] Service Worker registered successfully.'))
        .catch((err) => console.log('[PWA] Service Worker registration failed:', err));
    }
  }, []);

  // --- SPEECH RECOGNITION (WEB SPEECH API) ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false; // continuous is handled via manual restart for safety
      rec.interimResults = false;
      
      rec.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          sendUserVoiceMessage(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setRecognitionError(language === 'te' ? 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది' : 'Microphone access is not allowed');
          setVoiceGuidanceActive(false);
        } else if (event.error === 'no-speech') {
          if (voiceGuidanceActiveRef.current) {
            setTimeout(() => {
              if (voiceGuidanceActiveRef.current && !isSpeakingRef.current && !window.speechSynthesis.speaking) {
                try {
                  recognitionRef.current?.start();
                } catch(e) {
                  // ignore
                }
              }
            }, 1000);
          }
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
        setTimeout(() => {
          if (voiceGuidanceActiveRef.current && !isSpeakingRef.current && !window.speechSynthesis.speaking) {
            try {
              recognitionRef.current?.start();
            } catch(e) {
              // ignore
            }
          }
        }, 500);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]);

  // Generate automated checklist based on chosen answers
  useEffect(() => {
    const docs = ['Aadhaar Card (ఆధార్ కార్డు)'];
    
    if (checklistAnswers.income === 'low' || checklistAnswers.occupation === 'farmer' || checklistAnswers.occupation === 'student') {
      docs.push('Rice Card or White Ration Card (బియ్యం కార్డు / రేషన్ కార్డు)');
    }
    if (checklistAnswers.occupation === 'farmer') {
      docs.push('Pattadar Passbook land documents (పట్టాదారు పాస్ బుక్ భూమి పత్రాలు)');
      docs.push('Crop Loan Linkage Bank Account (వ్యవసాయ రుణ సేవింగ్స్ ఖాతా పుస్తకం)');
    }
    if (checklistAnswers.occupation === 'student') {
      docs.push('Study/Study-Study-Conduct Certificate or Admission Order (స్టడీ సర్టిఫికేట్ / ప్రవేశ పత్రం)');
      docs.push('College/School Identity Card (కళాశాల/స్కూల్ ఐడి కార్డు)');
    }
    if (checklistAnswers.age === 'old' || checklistAnswers.age === 'mid') {
      docs.push('Age Proof Certificate/Voter Card (వయస్సు ధృవీకరణ పత్రం లేదా ఓటర్ కార్డ్)');
    }
    if (checklistAnswers.disabled === 'yes') {
      docs.push('Disabled SADAREM Certificate above 40% (సదరమ్ వికలాంగ సర్టిఫికేట్)');
    }
    if (checklistAnswers.gender === 'female') {
      // General safety link / account
      docs.push("Mother's/Self Savings Bank Account linked to Aadhaar (ఆధార్ తో అనుసంధానించబడిన పొదుపు ఖాతా)");
    }
    if (checklistAnswers.occupation !== '' || checklistAnswers.age !== '' || checklistAnswers.income !== '') {
      docs.push('Recent Family Income Certificate from MRO/Secretariat (ఆదాయ ధృవీకరణ పత్రం)');
    }

    setChecklistResults([...new Set(docs)]);
  }, [checklistAnswers]);

  // --- TEXT TO SPEECH (TTS) ENGINES ---
  const speakText = (textToSpeak: string, onEndCallback?: () => void) => {
    if (!('speechSynthesis' in window)) {
      alert("Text to speech is not supported in this browser.");
      return;
    }

    // If currently speaking, stop it
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentlySpeakingText('');
      if (currentlySpeakingText === textToSpeak) {
        return;
      }
    }

    // Safe cleaning of markdown from text for smooth reading
    const cleanText = textToSpeak
      .replace(/[*#_\-\[\]()]/g, '')
      .replace(/₹/g, ' రూపాయల ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to locate a matching voice for selected language
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    if (language === 'te') {
      utterance.lang = 'te-IN';
      
      // 1. Try to find the user's custom configured voice
      if (selectedVoiceName) {
        selectedVoice = voices.find(v => v.name === selectedVoiceName);
      }
      
      // 2. Fall back to finding a Telugu female/girl voice automatically using premium ranking engine
      if (!selectedVoice) {
        selectedVoice = getBestTeluguVoice(voices);
      }
    } else {
      utterance.lang = 'en-US';
      selectedVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.startsWith('en'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // High fidelity realistic voice tuning
    utterance.pitch = pitch; 
    utterance.rate = easyMode ? Math.min(rate, 0.8) : rate; 

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentlySpeakingText(textToSpeak);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingText('');
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingText('');
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentlySpeakingText('');
  };

  // Read whole page aloud
  const readEntireActivePageText = () => {
    let text = "";
    if (activeTab === 'home') {
      if (selectedScheme) {
        text = language === 'te' 
          ? `రకం: ${selectedScheme.nameTe}. వివరాలు: ${selectedScheme.summaryTe}. లాభాలు: ${selectedScheme.benefitsTe.join(', ')}. అర్హతలు: ${selectedScheme.eligibilityTe.join(', ')}. అవసరమైన పత్రాలు: ${selectedScheme.documentsTe.join(', ')}`
          : `Scheme: ${selectedScheme.nameEn}. Summary: ${selectedScheme.summaryEn}. Benefits: ${selectedScheme.benefitsEn.join(', ')}. Eligibility: ${selectedScheme.eligibilityEn.join(', ')}. Documents required: ${selectedScheme.documentsEn.join(', ')}`;
      } else {
        text = language === 'te'
          ? "ప్రజా మిత్ర హోమ్ స్క్రీన్‌కు స్వాగతం. రైతు పథకాలు, విద్యార్థి పథకాలు, మహిళా పథకాలు, పెన్షన్ సహాయాలను తనిఖీ చేయడానికి కింద ఇవ్వబడిన బటన్‌లను క్లిక్ చేయండి."
          : "Welcome to Praja Mitra Home Screen. Select study, farmer, pension, women, housing or health cards below to instantly query related schemes.";
      }
    } else if (activeTab === 'checklist') {
      text = language === 'te'
        ? "పత్రాల చెక్‌లిస్ట్ సహాయ కేంద్రీకరణ పద్ధతి. మీ సమాచారాన్ని పూరించండి, తద్వారా మీరు మీ సచివాలయానికి తీసుకెళ్లవలసిన ఖచ్చితమైన పత్రాలను మేము సిద్ధం చేస్తాము."
        : "Documents checklist helper. Select your answers to customize the list of certified documents to carry to your village secretariat office.";
    } else if (activeTab === 'map') {
      text = language === 'te'
        ? `మీ సమీప సచివాలయం మరియు మీసేవ కేంద్రాల వివరాలు. ప్రస్తుతం ఎంచుకున్న జిల్లా: ${selectedDistrict}. సమయాలు ఉదయం పది గంటల నుండి సాయంత్రం ఐదు గంటల వరకు.`
        : `Your nearby government offices locator. Selected district is ${selectedDistrict}. Working hours are 10 AM to 5 PM.`;
    } else if (activeTab === 'helpline') {
      text = language === 'te'
        ? "అత్యవసర ప్రభుత్వ హెల్ప్ లైన్ నంబర్లు. ముఖ్యమంత్రి సహాయ కేంద్రం 1902, ఆరోగ్యశ్రీ సహాయ కేంద్రం 104, రైతు భరోసా కేంద్రం 155251."
        : "Emergency state help line numbers. CM Grievance 1902, Health center support 104, Farmer help desk 155251.";
    }

    speakText(text);
  };

  // --- VOICE SYSTEM ENGINE (continuous voice mode) ---
  const toggleVoiceContinuousListening = () => {
    if (isListening) {
      setVoiceGuidanceActive(false);
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        alert(language === 'te' ? "క్షమించండి, మీ బ్రౌజర్ వాయిస్ రికగ్నిషన్‌ను సపోర్ట్ చేయదు." : "Your browser does not support voice recognition API.");
        return;
      }
      
      // Stop ongoing speaking before listening to avoid echo
      stopSpeaking();
      setVoiceGuidanceActive(true);
      
      // Initial greeting speech response before listening
      const initialGreeting = language === 'te'
        ? "ప్రజా మిత్ర వాయిస్ సహాయ కేంద్రాన్ని యాక్టివేట్ చేశారు. మీరు నన్ను ప్రశ్న అడగండి, నేను వింటున్నాను."
        : "Praja Mitra voice mode is on. Please ask me any question. I am listening.";
      
      speakText(initialGreeting, () => {
        try {
          if (voiceGuidanceActiveRef.current) {
            recognitionRef.current.start();
          }
        } catch(e) {
          console.log(e);
        }
      });
    }
  };

  // Send voice transcript to backend API
  const sendUserVoiceMessage = async (transcript: string) => {
    if (!transcript.trim()) return;

    // Add user message to state
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: transcript,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          history: updatedHistory.map(h => ({ role: h.role, text: h.text })),
          language: language,
          easyMode: easyMode
        })
      });

      const data = await response.json();
      setIsChatLoading(false);

      if (data.response) {
        const aiMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'model',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, aiMsg]);
        
        // Auto-read aloud AI response for high accessibility! (One-click Voice Mode behavior)
        speakText(data.response, () => {
          if (voiceGuidanceActiveRef.current) {
            try {
              recognitionRef.current?.start();
            } catch (err) {
              console.log(err);
            }
          }
        });
      }
    } catch (e) {
      console.error(e);
      setIsChatLoading(false);
    }
  };

  // --- MANUAL CHAT SUBMISSION ---
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const textToSend = chatInput;
    setChatInput('');

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: updatedHistory.map(h => ({ role: h.role, text: h.text })),
          language: language,
          easyMode: easyMode
        })
      });

      const data = await response.json();
      setIsChatLoading(false);

      if (data.response) {
        const aiMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'model',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, aiMsg]);
        
        // Auto speech in voice-guidance active or option shown
        if (voiceGuidanceActive) {
          speakText(data.response, () => {
            if (voiceGuidanceActiveRef.current) {
              try {
                recognitionRef.current?.start();
              } catch (err) {
                console.log(err);
              }
            }
          });
        }
      }
    } catch (err) {
      console.error(err);
      setIsChatLoading(false);
    }
  };

  const handleQuickQuestionClick = (question: string) => {
    setChatInput(question);
  };

  // --- SEARCH & CATEGORY FILTERING ---
  const filteredSchemes = AP_SCHEMES.filter(scheme => {
    // Filter by Category
    if (selectedCategory && scheme.category !== selectedCategory) {
      return false;
    }
    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchEn = scheme.nameEn.toLowerCase().includes(q) || scheme.summaryEn.toLowerCase().includes(q);
      const matchTe = scheme.nameTe.toLowerCase().includes(q) || scheme.summaryTe.toLowerCase().includes(q);
      return matchEn || matchTe;
    }
    return true;
  });

  // Render Language Screen if no language selected
  if (!language) {
    return <LanguageScreen onSelectLanguage={(lang) => setLanguage(lang)} />;
  }

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${easyMode ? 'text-lg' : 'text-base'}`} id="app-root-container">
      
      {/* --- ELDER-SAFETY TOP BAR --- */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white shadow-md border-b-4 border-amber-500 py-3 px-4 sm:px-8 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Layout */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <span className="text-3xl sm:text-4xl filter drop-shadow animate-pulse" role="img" aria-label="emblem">🤝</span>
            <div>
              <h2 className={`font-extrabold tracking-tight ${easyMode ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'} flex items-center gap-2`}>
                Praja Mitra <span className="text-amber-400">&bull; ప్రజా మిత్ర</span>
              </h2>
              <p className={`text-xs text-slate-300 font-medium ${easyMode ? 'text-sm' : ''}`}>
                {language === 'te' ? 'ఆంధ్రప్రదేశ్ ప్రభుత్వ డిజిటల్ పథకాల సహాయ కేంద్రం' : 'Andhra Pradesh Government AI Welfare Companion'}
              </p>
            </div>
          </div>

          {/* Quick Access Global Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            
            {/* EASY MODE / ELDER MODE SWITCH */}
            <button
              onClick={() => setEasyMode(!easyMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all duration-300 border-2 active:scale-95 shadow ${
                easyMode 
                  ? 'bg-amber-400 text-slate-900 border-amber-300 text-lg py-2.5 px-6 animate-pulse' 
                  : 'bg-slate-700 text-white border-transparent hover:bg-slate-600 text-xs'
              }`}
              id="global-elder-mode-toggle"
              aria-label="Toggle Elder Mode for bigger texts"
            >
              <span className="text-xl">👴</span>
              <span>
                {language === 'te' 
                  ? (easyMode ? 'సాధారణ మోడ్ (Normal)' : 'పెద్ద అక్షరాలు (Easy Mode)') 
                  : (easyMode ? 'Normal Size' : 'Easy Mode (Elder)')}
              </span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => {
                const nl = language === 'en' ? 'te' : 'en';
                setLanguage(nl);
                stopSpeaking();
              }}
              className="flex items-center gap-1.5 bg-slate-800 text-white px-3 py-2 rounded-full border border-slate-600 hover:border-amber-400 font-semibold text-xs transition-colors active:scale-95"
              id="global-language-selector"
            >
              <Languages size={15} className="text-emerald-400" />
              <span>{language === 'en' ? 'తెలుగు చదవండి' : 'Read English'}</span>
            </button>

            {/* Reset / Exit language */}
            <button 
              onClick={() => {
                localStorage.removeItem('ap_sahayak_lang');
                setLanguage(null);
                stopSpeaking();
              }}
              title="Reset Settings"
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer px-2"
            >
              🇮🇳 Change language ({language === 'te' ? 'తెలుగు' : 'English'})
            </button>
          </div>

        </div>
      </div>

      {/* --- HERO BANNER & REALTIME STATEMENTS --- */}
      <div className="bg-emerald-600 text-white py-6 px-4 sm:px-8 border-b border-emerald-700 relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative">
          
          <div className="space-y-2 text-center md:text-left max-w-2xl">
            <h1 className={`font-black tracking-tight leading-tight ${easyMode ? 'text-3xl sm:text-4xl text-amber-300' : 'text-2xl sm:text-3xl'}`}>
              {language === 'te' ? 'నమస్కారం! మేము మీకు ఎలా సహాయం చేయగలం?' : 'Welcome! How can we help you today?'}
            </h1>
            <p className={`text-slate-100 font-medium ${easyMode ? 'text-xl' : 'text-sm sm:text-base'}`}>
              {language === 'te' 
                ? 'ఏదైనా ఆంధ్రప్రదేశ్ ప్రభుత్వ పథకం గురించి మీ సొంత సులభమైన భాషలో తెలుసుకోండి.' 
                : 'Instantly view verified criteria, financial aids & cash documents for AP government schemes.'}
            </p>
          </div>

          {/* Core continuous audio prompt tool panel */}
          <div className="w-full md:w-auto bg-slate-900/90 rounded-2xl p-4 border-2 border-amber-400 shadow-xl flex flex-col items-center gap-3 max-w-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isListening ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isListening ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              </span>
              <p className="text-xs font-bold text-slate-200 tracking-wider uppercase">
                {language === 'te' ? 'వన్-క్లిక్ వాయిస్ అసిస్టెంట్' : 'One-Click Voice Mode'}
              </p>
            </div>

            <button
              onClick={toggleVoiceContinuousListening}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-transform active:scale-95 text-center shadow-md ${
                isListening 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-amber-400 text-slate-900 hover:bg-amber-300'
              } ${easyMode ? 'text-xl py-5' : 'text-sm'}`}
              id="one-click-voice-mode-btn"
            >
              {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              <span>
                {isListening 
                  ? (language === 'te' ? 'వింటున్నాను &bull; రికార్డింగ్ ఆపండి' : 'Listening... Click to Stop') 
                  : (language === 'te' ? '🎤 మాట్లాడండి (Speak)' : '🎤 Speak Now')}
              </span>
            </button>

            {/* Error or guidance text bar */}
            <p className="text-xs text-slate-300 text-center font-medium">
              {recognitionError ? (
                <span className="text-red-400 flex items-center justify-center gap-1"><AlertCircle size={12} /> {recognitionError}</span>
              ) : isListening ? (
                language === 'te' ? 'సావధానంగా మాట్లాడండి' : 'Speak clearly into your microphone'
              ) : (
                language === 'te' ? 'కీబోర్డుతో అవసరం లేకుండా మాట్లాడి వెతకండి' : 'Talk in English or Telugu without typing!'
              )}
            </p>

            {/* Collapse toggle for setting fine pitch and voice engine */}
            <div className="w-full border-t border-slate-700/60 pt-2 pb-1 text-left">
              <button 
                onClick={() => setShowVoiceSettingsToggle(!showVoiceSettingsToggle)}
                className="w-full flex items-center justify-between text-xs text-amber-400 font-bold hover:text-amber-300 transition-colors py-1 cursor-pointer"
                id="voice-settings-toggle-btn"
              >
                <span>⚙️ {language === 'te' ? 'అసిస్టెంట్ వాయిస్ అమరికలు' : 'Voice Tuning Settings'}</span>
                <span>{showVoiceSettingsToggle ? '▲ hide' : '▼ show'}</span>
              </button>
              
              {showVoiceSettingsToggle && (
                <div className="sub-container space-y-3 mt-3 bg-slate-800 p-3 rounded-xl border border-slate-700">
                  {/* Voice list selection */}
                  <div className="space-y-1">
                    <label className="block text-[11px] text-slate-300 font-bold tracking-wider uppercase">
                      {language === 'te' ? 'వాయిస్ ఇంజిన్ ఎంచుకోండి:' : 'Speech Output Engine:'}
                    </label>
                    <select
                      value={selectedVoiceName}
                      onChange={(e) => {
                        setSelectedVoiceName(e.target.value);
                        stopSpeaking();
                      }}
                      className="w-full bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1.5 font-semibold text-slate-200 outline-none focus:border-amber-400"
                    >
                      {availableVoices.length === 0 ? (
                        <option value="">{language === 'te' ? 'సాధారణ సిస్టమ్ వాయిస్' : 'Default System Voice'}</option>
                      ) : (
                        availableVoices
                          .filter(v => {
                            const lowerL = v.lang.toLowerCase();
                            const lowerN = v.name.toLowerCase();
                            const isTe = lowerL.startsWith('te') || lowerL.includes('-te-') || lowerN.includes('telugu');
                            const isEn = lowerL.startsWith('en') || lowerN.includes('english');
                            // Filter out English accents for Telugu representation
                            const isEnglishAccentForTe = isTe && (lowerN.includes('english') || lowerN.includes('accent'));
                            return (isTe || isEn) && !isEnglishAccentForTe;
                          })
                          .map((v) => {
                            const lowerName = v.name.toLowerCase();
                            const isTe = v.lang.toLowerCase().startsWith('te') || v.lang.toLowerCase().includes('-te-') || lowerName.includes('telugu');
                            const isV3 = lowerName.includes('v3') || lowerName.includes('-v3');
                            const isFemale = lowerName.includes('female') || lowerName.includes('girl') || lowerName.includes('shruti') || lowerName.includes('heera') || lowerName.includes('swara') || lowerName.includes('kavya') || lowerName.includes('priya') || lowerName.includes('uma') || lowerName.includes('vanya') || lowerName.includes('vruta') || lowerName.includes('pallavi') || lowerName.includes('vani') || lowerName.includes('lakshmi') || lowerName.includes('sita');
                            const isNeural = lowerName.includes('natural') || lowerName.includes('neural') || lowerName.includes('online');
                            
                            let label = isTe ? '🌾 [తెలుగు] ' : '🇬🇧 [Eng] ';
                            label += v.name.replace('Microsoft', 'MS').replace('Google', 'G').trim();
                            
                            if (isV3) {
                              label += ' ✨ (Natural V3)';
                            } else if (isNeural) {
                              label += ' 🌐 (Neural)';
                            }
                            
                            if (isFemale) {
                              label += ' 👩 (Female Girl)';
                            } else {
                              label += ' 👨 (Male)';
                            }
                            
                            return (
                              <option key={v.name} value={v.name}>
                                {label}
                              </option>
                            );
                          })
                      )}
                    </select>
                  </div>

                  {/* Girl Pitch Booster */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-300 font-bold uppercase">
                        {language === 'te' ? 'బాలిక స్వర తీవ్రత (Girl Tone)' : 'Realistic Girl Pitch:'}
                      </span>
                      <span className="text-amber-400 font-bold font-mono">{pitch.toFixed(2)}x</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">👵</span>
                      <input 
                        type="range"
                        min="0.8"
                        max="1.7"
                        step="0.05"
                        value={pitch}
                        onChange={(e) => {
                          setPitch(parseFloat(e.target.value));
                        }}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <span className="text-xs">👧</span>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-normal">
                      {pitch > 1.2 ? (
                        <span className="text-emerald-400 font-medium">✓ {language === 'te' ? 'యవ్వన కంఠస్వరం సక్రియం చేయబడింది!' : 'Realistic feminine girl tone active!'}</span>
                      ) : (
                        language === 'te' ? 'సుందరమైన బాలిక కంఠస్వరం కోసం 1.25x - 1.4x కి మార్చండి.' : 'Set to 1.25x - 1.4x for a beautiful girl voice.'
                      )}
                    </div>
                  </div>

                  {/* Speed adjustment */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-300 font-bold uppercase">
                        {language === 'te' ? 'మాట్లాడే వేగం (Assist Speed)' : 'Assist Speed:'}
                      </span>
                      <span className="text-amber-400 font-bold font-mono">{rate.toFixed(2)}x</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Slow</span>
                      <input 
                        type="range"
                        min="0.6"
                        max="1.4"
                        step="0.05"
                        value={rate}
                        onChange={(e) => {
                          setRate(parseFloat(e.target.value));
                        }}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <span className="text-[10px] text-slate-400">Fast</span>
                    </div>
                  </div>

                  {/* Voice Test button */}
                  <button
                    onClick={() => {
                      const testTxt = language === 'te' 
                        ? "నిర్ణయించబడిన బాలిక కంఠస్వరం విజయవంతంగా సక్రియం చేయబడింది!"
                        : "Tuned realistic girl voice activated successfully!";
                      speakText(testTxt);
                    }}
                    type="button"
                    className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all text-slate-900 font-black text-xs py-1.5 rounded uppercase tracking-wider cursor-pointer"
                  >
                    🔊 {language === 'te' ? 'వాయిస్ టెస్ట్ చేయండి' : 'Test Tuned Voice'}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* --- COHESIVE TAB NAVIGATION BAR --- */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex overflow-x-auto scrollbar-hide">
          <button
            onClick={() => { setActiveTab('home'); stopSpeaking(); }}
            className={`flex-1 py-4 px-4 text-center font-extrabold transition-all border-b-4 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'home' && !selectedScheme
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${easyMode ? 'text-xl py-5' : 'text-sm'}`}
            id="tab-home"
          >
            <Home size={easyMode ? 22 : 18} />
            <span>{language === 'te' ? '🏠 హోమ్ స్క్రీన్' : '🏠 Schemes Home'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('checklist'); stopSpeaking(); }}
            className={`flex-1 py-4 px-4 text-center font-extrabold transition-all border-b-4 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'checklist' 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${easyMode ? 'text-xl py-5' : 'text-sm'}`}
            id="tab-checklist"
          >
            <FileText size={easyMode ? 22 : 18} />
            <span>{language === 'te' ? '📄 పత్రాల లిస్ట్' : '📄 Documents Helper'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('map'); stopSpeaking(); }}
            className={`flex-1 py-4 px-4 text-center font-extrabold transition-all border-b-4 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'map' 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${easyMode ? 'text-xl py-5' : 'text-sm'}`}
            id="tab-map"
          >
            <MapPin size={easyMode ? 22 : 18} />
            <span>{language === 'te' ? '📍 సమీప ఆఫీస్' : '📍 Nearby Office'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('helpline'); stopSpeaking(); }}
            className={`flex-1 py-4 px-4 text-center font-extrabold transition-all border-b-4 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'helpline' 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40' 
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${easyMode ? 'text-xl py-5' : 'text-sm'}`}
            id="tab-helpline"
          >
            <Phone size={easyMode ? 22 : 18} />
            <span>{language === 'te' ? '📞 సహాయ కేంద్రీకృత' : '📞 Help Numbers'}</span>
          </button>
        </div>
      </div>

      {/* --- VOICE READING FLOAT CONTROL (Reads active screen context block) --- */}
      <div className="bg-amber-100 border-y border-amber-200 py-2.5 px-4 sm:px-8 text-amber-900 flex items-center justify-between shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Volume2 className="text-amber-600 shrink-0 animate-bounce" size={24} />
            <p className={`font-semibold ${easyMode ? 'text-lg' : 'text-xs sm:text-sm'}`}>
              {language === 'te' 
                ? 'వైకల్యం కలిగిన వారు, చదవలేని వారు ఈ బటన్ నొక్కడం ద్వారా ఈ లోపలి పేజీని పూర్తిగా వినవచ్చు:' 
                : 'Elderly or visually challenged users can listen to this entire screen read aloud:'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={readEntireActivePageText}
              className={`flex items-center gap-2 font-black px-6 py-2.5 rounded-full shadow-md active:scale-95 transition-all duration-300 ${
                isSpeaking 
                  ? 'bg-red-600 text-white ring-2 ring-red-300' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              } ${easyMode ? 'text-lg px-8 py-3' : 'text-sm'}`}
              id="speech-listener-toggle-btn"
            >
              {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span>
                {isSpeaking 
                  ? (language === 'te' ? '⏹️ చదవడం ఆపండి' : '⏹️ Stop Voice') 
                  : (language === 'te' ? '🔊 పేజీ చదివి వినిపించు' : '🔊 Listen to Page')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* --- MAIN PAGE GRAPHICS & SECTIONS --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8" id="main-content-layout">
        
        {/* ==================== HOME SCREEN TAB ==================== */}
        {activeTab === 'home' && (
          <div className="space-y-8" id="home-view-wrapper">
            
            {/* If a dynamic scheme details is open, show details screen */}
            {selectedScheme ? (
              <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-500 overflow-hidden" id="scheme-details-container">
                {/* Back to schemes bar */}
                <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-4 flex items-center justify-between">
                  <button 
                    onClick={() => { setSelectedScheme(null); stopSpeaking(); }}
                    className="flex items-center gap-2 font-bold hover:text-amber-300 focus:outline-none cursor-pointer transition-colors"
                  >
                    <ArrowLeft size={24} />
                    <span>{language === 'te' ? 'వెనుకకు (మొత్తం పథకాలు)' : 'Back to schemes list'}</span>
                  </button>
                  <span className="bg-emerald-800 text-emerald-200 text-xs px-3 py-1 rounded-full font-extrabold uppercase tracking-wide">
                    {selectedScheme.category}
                  </span>
                </div>

                <div className="p-6 sm:p-10 space-y-8">
                  {/* Title & Speech */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div className="flex items-start gap-4">
                      <span className="text-5xl bg-emerald-50 p-4 rounded-2xl shrink-0" role="img" aria-label="Scheme representation">
                        {selectedScheme.icon}
                      </span>
                      <div>
                        <h2 className={`font-extrabold text-slate-800 ${easyMode ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}>
                          {language === 'te' ? selectedScheme.nameTe : selectedScheme.nameEn}
                        </h2>
                        <p className={`text-slate-500 mt-1 font-medium ${easyMode ? 'text-lg' : 'text-sm'}`}>
                          {language === 'te' ? 'ఆంధ్రప్రదేశ్ ప్రభుత్వ అధికారిక భరోసా' : 'Certified guidelines under AP state regulations'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const schemeText = language === 'te'
                          ? `పథకం పేరు: ${selectedScheme.nameTe}. లభించే సహాయం: ${selectedScheme.amountTe}. వివరాలు: ${selectedScheme.summaryTe}`
                          : `Scheme Name: ${selectedScheme.nameEn}. Financial Benefit: ${selectedScheme.amountEn}. Details: ${selectedScheme.summaryEn}`;
                        speakText(schemeText);
                      }}
                      className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold transition-all shadow active:scale-95 text-sm"
                    >
                      <Volume2 size={16} />
                      <span>{language === 'te' ? '🔊 పథకం చదివి వినిపించు' : '🔊 Listen to Scheme Info'}</span>
                    </button>
                  </div>

                  {/* Scheme Summary */}
                  <div className="space-y-2">
                    <h3 className={`font-bold text-slate-800 ${easyMode ? 'text-2xl' : 'text-lg'}`}>
                      {language === 'te' ? 'పథకం వివరణ (About Scheme):' : 'Scheme Summary:'}
                    </h3>
                    <div className={`text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100 leading-relaxed font-medium ${easyMode ? 'text-xl' : 'text-base'}`}>
                      {language === 'te' ? selectedScheme.summaryTe : selectedScheme.summaryEn}
                    </div>
                  </div>

                  {/* Financial Assistance Amount */}
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div>
                      <span className="block text-xs uppercase text-amber-800 font-extrabold tracking-wider">
                        {language === 'te' ? 'లభించే ఆర్థిక సహాయం' : 'Financial Assistance Given'}
                      </span>
                      <strong className={`block text-amber-900 font-extrabold ${easyMode ? 'text-3xl' : 'text-2xl'}`}>
                        {language === 'te' ? selectedScheme.amountTe : selectedScheme.amountEn}
                      </strong>
                    </div>
                    <span className="text-4xl">💰</span>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Benefits Column */}
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                        <h4 className="font-bold text-emerald-900 flex items-center gap-2">
                          <span>🎁</span>
                          {language === 'te' ? 'పథకం ప్రయోజనాలు' : 'Welfare Benefits'}
                        </h4>
                        <button 
                          onClick={() => speakText(language === 'te' ? selectedScheme.benefitsTe.join(', ') : selectedScheme.benefitsEn.join(', '))}
                          className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
                          title="Read section"
                        >
                          🔊 Listen
                        </button>
                      </div>
                      <ul className="space-y-3">
                        {(language === 'te' ? selectedScheme.benefitsTe : selectedScheme.benefitsEn).map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-slate-700 leading-relaxed">
                            <span className="text-emerald-600 shrink-0 font-bold">&#10003;</span>
                            <span className={easyMode ? 'text-lg font-medium' : 'text-sm'}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Eligibility Column */}
                    <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                        <h4 className="font-bold text-orange-900 flex items-center gap-2">
                          <span>📋</span>
                          {language === 'te' ? 'అర్హతలు (ఎవరు అర్హులు?)' : 'Eligibility Criteria'}
                        </h4>
                        <button 
                          onClick={() => speakText(language === 'te' ? selectedScheme.eligibilityTe.join(', ') : selectedScheme.eligibilityEn.join(', '))}
                          className="text-orange-700 hover:text-orange-900 text-xs font-bold"
                          title="Read section"
                        >
                          🔊 Listen
                        </button>
                      </div>
                      <ul className="space-y-3">
                        {(language === 'te' ? selectedScheme.eligibilityTe : selectedScheme.eligibilityEn).map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-slate-700 leading-relaxed">
                            <span className="text-orange-600 shrink-0 font-bold">&bull;</span>
                            <span className={easyMode ? 'text-lg font-medium' : 'text-sm'}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Documents Needed Column */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                        <h4 className="font-bold text-blue-900 flex items-center gap-2">
                          <span>📂</span>
                          {language === 'te' ? 'తీసుకెళ్లవలసిన పత్రాలు' : 'Required Documents'}
                        </h4>
                        <button 
                          onClick={() => speakText(language === 'te' ? selectedScheme.documentsTe.join(', ') : selectedScheme.documentsEn.join(', '))}
                          className="text-blue-700 hover:text-blue-900 text-xs font-bold"
                          title="Read section"
                        >
                          🔊 Listen
                        </button>
                      </div>
                      <ul className="space-y-3">
                        {(language === 'te' ? selectedScheme.documentsTe : selectedScheme.documentsEn).map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-slate-700 leading-relaxed">
                            <span className="text-blue-500 shrink-0 font-extrabold">+</span>
                            <span className={easyMode ? 'text-lg font-bold text-blue-980' : 'text-sm font-semibold'}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Action box */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center space-y-4">
                    <p className={`font-semibold text-slate-700 ${easyMode ? 'text-xl' : 'text-base'}`}>
                      {language === 'te' 
                        ? 'ఈ పథకానికి దరఖాస్తు చేయాలనుకుంటున్నారా? మీ గ్రామంలోని సచివాలయానికి పైన తెలిపిన పత్రాలతో వెళ్లండి.' 
                        : 'Wish to apply? Head over to your nearest Secretariat registration office with the above original documents.'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <button 
                        onClick={() => { setActiveTab('map'); setSelectedScheme(null); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow"
                      >
                        📍 {language === 'te' ? 'సమీప కార్యాలయం వెతుకుము' : 'Find Nearby Office'}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('checklist'); setSelectedScheme(null); }}
                        className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl transition-all shadow"
                      >
                        📄 {language === 'te' ? 'అర్హత చెక్‌లిస్ట్ సహాయకి' : 'Document Checker'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <>
                {/* --- SMART SEARCH HEADER SECTION --- */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100 space-y-6" id="search-box-home">
                  
                  <div className="space-y-2">
                    <h3 className={`font-extrabold text-slate-800 ${easyMode ? 'text-2xl' : 'text-lg'}`}>
                      {language === 'te' ? '🔍 పథకం పేరు లేదా రైస్ కార్డ్ వివరాలతో వెతకండి:' : '🔍 Ask or Search Any Government Scheme:'}
                    </h3>
                    
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={language === 'te' ? "ఉదాహరణకు: రైతు భరోసా, పెన్షన్, విద్యా దీవెన..." : "For example: Rythu Bharosa, Amma Vodi, Health, Crop..."}
                        className={`w-full bg-slate-50 border-2 border-slate-300 rounded-2xl pl-12 pr-12 py-4 text-slate-800 font-medium focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-sm ${
                          easyMode ? 'text-2xl py-5' : 'text-base'
                        }`}
                        id="scheme-main-search-input"
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={easyMode ? 26 : 20} />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold"
                          title="Clear Search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Suggestive short queries buttons list */}
                  <div className="flex flex-wrap items-center gap-2" id="search-suggestive-queries">
                    <span className="text-xs text-slate-400 font-bold uppercase">{language === 'te' ? 'తరచుగా వెతికేవి:' : 'Quick search:'}</span>
                    {language === 'te' ? (
                      <>
                        <button onClick={() => setSearchQuery('పెన్షన్')} className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 font-bold">👵 పెన్షన్ కానుక</button>
                        <button onClick={() => setSearchQuery('భరోసా')} className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 font-bold">🌾 రైతు సహాయం</button>
                        <button onClick={() => setSearchQuery('ఆరోగ్యశ్రీ')} className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 font-bold">🏥 ఉచిత వైద్యం</button>
                        <button onClick={() => setSearchQuery('అమ్మ ఒడి')} className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 font-bold">🎓 చదువుల సాయం</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setSearchQuery('Pension')} className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 font-bold">👵 Pension Kanuka</button>
                        <button onClick={() => setSearchQuery('Farmer')} className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 font-bold">🚜 Farmer Support</button>
                        <button onClick={() => setSearchQuery('Health')} className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 font-bold">🏥 Aarogyasri</button>
                        <button onClick={() => setSearchQuery('Education')} className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 font-bold">🎓 Student Fees</button>
                      </>
                    )}
                  </div>
                </div>

                {/* --- STATE SCHEMES QUICK ACCESS CATEGORIES --- */}
                <div className="space-y-4" id="home-category-chooser">
                  <h3 className={`font-extrabold text-slate-800 ${easyMode ? 'text-2xl' : 'text-lg'}`}>
                    {language === 'te' ? '🎯 మీ వర్గాన్ని ఎంచుకోండి (పథకాలు కనుగొనండి):' : '🎯 Choose Your Category to Find Schemes:'}
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="categories-grid">
                    {[
                      { id: 'farmer', icon: '🚜', titleEn: 'Farmer Schemes', titleTe: 'రైతు పథకాలు' },
                      { id: 'student', icon: '🎓', titleEn: 'For Students', titleTe: 'విద్యార్థి చదువులు' },
                      { id: 'women', icon: '👩', titleEn: 'Women Schemes', titleTe: 'మహిళా స్వశక్తి' },
                      { id: 'pension', icon: '👴', titleEn: 'Pension Aids', titleTe: 'వృద్ధాప్య పెన్షన్' },
                      { id: 'health', icon: '🏥', titleEn: 'Health / Medical', titleTe: 'ఆరోగ్య బీమా' },
                      { id: 'housing', icon: '🏠', titleEn: 'Housing Sites', titleTe: 'పేదలకు ఇళ్లు' },
                      { id: 'loan', icon: '💰', titleEn: 'SHG Zero Interest', titleTe: 'సున్నా వడ్డీ రుణాలు' },
                    ].map((categ) => {
                      const isActive = selectedCategory === categ.id;
                      return (
                        <button
                          key={categ.id}
                          onClick={() => {
                            setSelectedCategory(isActive ? null : categ.id);
                            stopSpeaking();
                          }}
                          className={`flex flex-col items-center justify-center p-6 rounded-3xl border-3 transition-all cursor-pointer shadow-sm relative group active:scale-95 ${
                            isActive 
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-300' 
                              : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/20 text-slate-700'
                          }`}
                          id={`category-card-${categ.id}`}
                        >
                          <span className={`${easyMode ? 'text-5xl' : 'text-4xl'} mb-3 block transform group-hover:scale-110 transition-transform`}>{categ.icon}</span>
                          <span className={`block font-black text-center leading-snug ${easyMode ? 'text-xl' : 'text-sm sm:text-base'}`}>
                            {language === 'te' ? categ.titleTe : categ.titleEn}
                          </span>
                          {isActive && (
                            <span className="absolute top-2 right-2 bg-emerald-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                          )}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => { setSelectedCategory(null); setSearchQuery(''); stopSpeaking(); }}
                      className="flex flex-col items-center justify-center p-6 rounded-3xl border-3 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100 cursor-pointer transition-all active:scale-95"
                      id="category-card-all"
                    >
                      <span className="text-3xl mb-3 block">📋</span>
                      <span className={`block font-black text-center ${easyMode ? 'text-xl' : 'text-sm'}`}>
                        {language === 'te' ? 'అన్ని పథకాలు చూడండి' : 'Show All Schemes'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* --- LIST OF SCHEMES --- */}
                <div className="space-y-4" id="home-schemes-listing-results">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-extrabold text-slate-800 ${easyMode ? 'text-2xl' : 'text-lg'}`}>
                      {language === 'te' 
                        ? `నిర్ణయించిన పథకాలు (${filteredSchemes.length} లభించినవి):` 
                        : `Welfare Schemes for You (${filteredSchemes.length} found):`}
                    </h3>
                    {(selectedCategory || searchQuery) && (
                      <button 
                        onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        {language === 'te' ? 'ఫిల్టర్లు తొలగించండి ✕' : 'Clear filters ✕'}
                      </button>
                    )}
                  </div>

                  {filteredSchemes.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-slate-200 text-slate-500 space-y-3">
                      <p className="text-lg font-bold">{language === 'te' ? 'ఏ విధమైన ఫలితాలు లభించలేదు.' : 'No matching schemes found.'}</p>
                      <p className="text-sm">{language === 'te' ? 'దయచేసి పైన ఉన్న శోధన పదాన్ని మార్చండి లేదా మరొక విభాగం ఎంచుకోండి.' : 'Try cleaning search bar parameters or select another category.'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="schemes-grid-list">
                      {filteredSchemes.map((scm) => (
                        <div
                          key={scm.id}
                          onClick={() => { setSelectedScheme(scm); stopSpeaking(); }}
                          className="bg-white rounded-3xl border-2 border-slate-200 hover:border-emerald-600 hover:shadow-xl transition-all p-6 cursor-pointer flex flex-col justify-between gap-6 relative group"
                          id={`scheme-list-item-${scm.id}`}
                        >
                          <div className="flex gap-4">
                            <span className="text-4xl bg-slate-50 p-3 h-16 w-16 rounded-2xl flex items-center justify-center shrink-0" role="img" aria-label="icon">
                              {scm.icon}
                            </span>
                            <div>
                              <h4 className={`font-extrabold text-slate-800 group-hover:text-emerald-700 transition-colors ${easyMode ? 'text-2xl' : 'text-lg sm:text-lg'}`}>
                                {language === 'te' ? scm.nameTe : scm.nameEn}
                              </h4>
                              <p className={`text-slate-500 mt-1 leading-snug ${easyMode ? 'text-lg' : 'text-xs sm:text-sm'}`}>
                                {language === 'te' ? scm.summaryTe.slice(0, 100) + "..." : scm.summaryEn.slice(0, 100) + "..."}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs font-bold text-slate-700">
                            <div>
                              <span className="block text-slate-400 capitalize">{language === 'te' ? 'లభించే ఆర్థిక మొత్తం' : 'Amount Assist'}</span>
                              <span className={`text-amber-600 font-extrabold ${easyMode ? 'text-lg' : 'text-sm'}`}>
                                {language === 'te' ? scm.amountTe.slice(0, 35) : scm.amountEn.slice(0, 35)}
                              </span>
                            </div>
                            <span className="text-emerald-600 flex items-center gap-1">
                              {language === 'te' ? 'వివరాలు చూడండి' : 'Check Details'} <ChevronRight size={14} />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* --- AP STATE DAILY ANNOUNCEMENTS & EMERGENCY SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6" id="home-announcements-and-faqs">
                  
                  {/* Daily Updates Banner Block */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg border border-slate-800 relative">
                    <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-full animate-bounce">
                      {language === 'te' ? 'తాజా వార్తలు' : 'Today Updates'}
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <span>📢</span> {language === 'te' ? 'ఈరోజు ప్రభుత్వ అధికారిక ప్రకటనలు:' : 'Today State Announcements:'}
                      </h3>
                      <p className="text-slate-400 text-xs">{language === 'te' ? 'తాజా నిధులు విడుదల మరియు గడువులు సమాచారం' : 'Live state dispatch & input extension dates'}</p>
                    </div>

                    <div className="space-y-4" id="daily-announcements-list">
                      {DAILY_UPDATES.map((upd, idx) => (
                        <div key={idx} className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
                          <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold mb-1">
                            <span>{upd.date}</span>
                            <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded">Active</span>
                          </div>
                          <h4 className="font-bold text-slate-100 text-sm">{language === 'te' ? upd.titleTe : upd.titleEn}</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{language === 'te' ? upd.descTe : upd.descEn}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Frequently Asked Questions */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100 space-y-6" id="faq-accordions">
                    <div className="space-y-1">
                      <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                        <HelpCircle className="text-emerald-600" />
                        {language === 'te' ? 'చిన్న సందేహాలు & ప్రశ్నలు:' : 'Common Citizen Questions:'}
                      </h3>
                      <p className="text-slate-400 text-xs">{language === 'te' ? 'పథకాలకు సంబంధించిన సాధారణ ప్రశ్నలు' : 'Frequently asked inquiries about volunteer process'}</p>
                    </div>

                    <div className="space-y-4">
                      {FAQ_ITEMS.map((faq, idx) => (
                        <div key={idx} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                          <h4 className="font-black text-slate-800 text-sm mb-2 flex items-start gap-1">
                            <span className="text-emerald-600">Q.</span>
                            <span>{language === 'te' ? faq.qTe : faq.qEn}</span>
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-semibold pl-4">
                            {language === 'te' ? faq.aTe : faq.aEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </>
            )}

          </div>
        )}

        {/* ==================== DOCUMENTS ACCESSIBILITY HELPER WIZARD ==================== */}
        {activeTab === 'checklist' && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden text-slate-800" id="checklist-guided-tool">
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-6 sm:p-8 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black">{language === 'te' ? '📄 మీ పత్రాల చెక్‌లిస్ట్ సహాయకుడు' : '📄 Smart Documents Checklist Helper'}</h2>
              <p className="text-slate-200 text-sm">
                {language === 'te' 
                  ? 'మీ వయస్సు మరియు వృత్తి సమాచారాన్ని ఎంచుకోండి, మేము వెంటనే మీరు సచివాలయానికి తీసుకువెళ్ళవలసిన పత్రాల జాబితాను సిద్ధం చేస్తాము.' 
                  : 'Check boxes below regarding your status to generate a customized download list of documents to present to your Rythu / Ward Volunteer.'}
              </p>
            </div>

            <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Questionnaire Left Section */}
              <div className="lg:col-span-5 space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <span>🗳️</span> {language === 'te' ? 'మతిమరుపు లేకుండా సమాచారాన్ని ఎంచుకోండి:' : 'Select Your Status Parameters:'}
                </h3>

                {/* Occupation Input */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-500 uppercase">{language === 'te' ? '1. మీ ప్రధాన వృత్తి ఏది?' : '1. What is your occupation?'}</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'farmer', labels: ['రైతు', 'Farmer'] },
                      { val: 'student', labels: ['విద్యార్థి', 'Student'] },
                      { val: 'other', labels: ['ఇతర/None', 'Other'] }
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => setChecklistAnswers(prev => ({ ...prev, occupation: item.val }))}
                        className={`p-3 rounded-xl font-bold text-xs border text-center transition-all ${
                          checklistAnswers.occupation === item.val
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {language === 'te' ? item.labels[0] : item.labels[1]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age Input */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-500 uppercase">{language === 'te' ? '2. మీ వయస్సు ఎంత?' : '2. What is your Age?'}</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'old', labels: ['👵 వృద్ధులు (60+)', '60+ Years'] },
                      { val: 'mid', labels: ['మధ్యవయస్సు', '45 - 59 yrs'] },
                      { val: 'young', labels: ['యువత', 'Below 45'] }
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => setChecklistAnswers(prev => ({ ...prev, age: item.val }))}
                        className={`p-3 rounded-xl font-bold text-xs border text-center transition-all ${
                          checklistAnswers.age === item.val
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {language === 'te' ? item.labels[0] : item.labels[1]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Income input */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-500 uppercase">{language === 'te' ? '3. రేషన్ కార్డు ఉందా / కుటుంబ ఆదాయం ఎంత?' : '3. Income & Rice Card Status?'}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'low', labels: ['బియ్యం కార్డ్ ఉంది (దారిద్రం దిగువ)', 'BPL Rice Card Holder'] },
                      { val: 'high', labels: ['ఆదాయం ఎక్కువ ఉంది', 'Regular Income'] }
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => setChecklistAnswers(prev => ({ ...prev, income: item.val }))}
                        className={`p-3 rounded-xl font-bold text-xs border text-center transition-all ${
                          checklistAnswers.income === item.val
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {language === 'te' ? item.labels[0] : item.labels[1]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Disability Status */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-500 uppercase">{language === 'te' ? '4. వైకల్యం ఎవరైనా ఉన్నారా?' : '4. Do you have any physical disability?'}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'yes', labels: ['అవును (40%+ వైకల్యం)', 'Yes (Certified SADAREM)'] },
                      { val: 'no', labels: ['లేదు (No Disability)', 'No'] }
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => setChecklistAnswers(prev => ({ ...prev, disabled: item.val }))}
                        className={`p-3 rounded-xl font-bold text-xs border text-center transition-all ${
                          checklistAnswers.disabled === item.val
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {language === 'te' ? item.labels[0] : item.labels[1]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender Input */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-500 uppercase">{language === 'te' ? '5. లింగము (Gender):' : '5. Select Gender:'}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'female', labels: ['స్త్రీ (Female)', 'Female'] },
                      { val: 'male', labels: ['పురుషుడు (Male)', 'Male'] }
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => setChecklistAnswers(prev => ({ ...prev, gender: item.val }))}
                        className={`p-3 rounded-xl font-bold text-xs border text-center transition-all ${
                          checklistAnswers.gender === item.val
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {language === 'te' ? item.labels[0] : item.labels[1]}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setChecklistAnswers({ occupation: '', age: '', income: '', disabled: '', gender: '' })}
                  className="w-full text-center text-xs text-rose-600 hover:underline font-bold"
                >
                  {language === 'te' ? 'రిసెట్ చేయండి (Clear all parameters)' : 'Clear and Restart Checker'}
                </button>
              </div>

              {/* Dynamic Checklist Results Right Section */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-4">
                  <h3 className="text-xl font-extrabold text-emerald-950 flex items-center justify-between">
                    <span>💡 {language === 'te' ? 'మీరు కార్యాలయానికి తీసుకెళ్లవలసిన పత్రాలు:' : 'Your Custom Document Checklist:'}</span>
                    <button 
                      onClick={() => speakText(language === 'te' ? `పత్రాల లిస్ట్ క్రింది విధంగా ఉన్నాయి: ${checklistResults.join(', ')}` : `Your registered checklist includes: ${checklistResults.join(', ')}`)}
                      className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700"
                      title="Read out list"
                    >
                      🔊 Read Out
                    </button>
                  </h3>

                  <div className="space-y-3" id="checklist-item-list">
                    {checklistResults.length === 1 ? (
                      <p className="text-sm text-slate-500 font-semibold italic text-center p-4">
                        {language === 'te' ? 'ఎడమ వైపున ఉన్న సమాచారాన్ని పూరించండి, తద్వారా ఖచ్చితమైన విశ్లేషణ వస్తుంది.' : 'Choose some answers on the left to personalize your needed document attachments.'}
                      </p>
                    ) : (
                      checklistResults.map((doc, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
                          <CheckCircle2 className="text-emerald-600 shrink-0" />
                          <span className={`${easyMode ? 'text-xl' : 'text-base'} font-extrabold text-slate-800`}>{doc}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-3 shadow-md">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">💡 {language === 'te' ? 'గమనిక / సచివాలయ సలహా:' : 'Volunteer Secretariat Advisory:'}</p>
                  <p className={`leading-relaxed text-slate-300 font-medium ${easyMode ? 'text-lg' : 'text-xs'}`}>
                    {language === 'te' 
                      ? 'పైన తెలపబడిన అన్ని ఒరిజినల్ పత్రాలు మరియు రెండు సెట్ల జిరాక్స్ కాపీలతో మీ గ్రామ పొదుపు వాలంటీరు సంప్రదించండి. దరఖాస్తు చేసుకోవడం ద్వారా ఎటువంటి రుసుములు చెల్లించనక్కర్లేదు.'
                      : 'Please carry two sets of xerox photocopies along with original documents for instant biometric attachment at your digital MeeSeva center.'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== NEARBY OFFICE FINDER TAB ==================== */}
        {activeTab === 'map' && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden" id="office-finder-tab">
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-6 sm:p-8 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black">{language === 'te' ? '📍 ఆంధ్రప్రదేశ్ సేవా కేంద్రాల స్థానములు' : '📍 AP District Secretariat & MeeSeva Locator'}</h2>
              <p className="text-slate-200 text-sm">
                {language === 'te' 
                  ? 'మీ సమీప గ్రామ సచివాలయాలు మరియు మీసేవ కార్యాలయాలను కనుగొని అధికారిక అధికారుల చిరునామాను తెలుసుకోండి.' 
                  : 'Select your local district below to inspect exact address coordinates and hours of your secretariat offices.'}
              </p>
            </div>

            <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Selector Column */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* District Choose list */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">{language === 'te' ? 'జిల్లాను ఎంచుకోండి:' : 'Select District:'}</label>
                  <select 
                    value={selectedDistrict} 
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 font-extrabold text-slate-800"
                  >
                    {['Guntur', 'Anantapur', 'Chittoor', 'Nellore', 'Visakhapatnam', 'Krishna', 'Vijayawada', 'Kurnool', 'Kadapa', 'West Godavari', 'East Godavari'].map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                {/* Office Type options */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">{language === 'te' ? 'కార్యాలయం రకం:' : 'Office Type:'}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedOfficeType('sachivalayam')}
                      className={`p-3 rounded-xl font-bold text-xs border text-center transition-all ${
                        selectedOfficeType === 'sachivalayam'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {language === 'te' ? '🏫 గ్రామ సచివాలయం' : '🏫 Secretariat'}
                    </button>
                    <button
                      onClick={() => setSelectedOfficeType('meeseva')}
                      className={`p-3 rounded-xl font-bold text-xs border text-center transition-all ${
                        selectedOfficeType === 'meeseva'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {language === 'te' ? '🏛️ మీసేవ కేంద్రం' : '🏛️ MeeSeva Center'}
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                  <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                    💡 {language === 'te' 
                      ? 'ప్రధాన మీసేవ నమోదు కార్యాలయాలు ప్రభుత్వ నియమాల ప్రకారం ఉదయం పది గంటల నుండి సాయంత్రం ఐదు గంటల వరకు తెరిచి ఉంటాయి.' 
                      : 'Secretariat offices remain active from 10:00 AM - 5:00 PM for on-spot digital registrations.'}
                  </p>
                </div>

              </div>

              {/* Central Map Canvas Simulation Column */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* SVG/Canvas Map simulator */}
                <div className="bg-slate-100 border border-slate-200 rounded-3xl p-4 shadow-inner relative overflow-hidden" id="office-map-simulator">
                  <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {language === 'te' ? 'లైవ్ లొకేషన్ సిమ్యులేటర్' : 'Map Simulation Only'}
                  </div>
                  
                  {/* Custom Map Representation */}
                  <svg viewBox="0 0 400 200" className="w-full bg-emerald-50 rounded-2xl border border-emerald-100">
                    {/* Grid */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#a7f3d0" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Simulated Districts Lines */}
                    <path d="M 50 20 Q 150 70 250 30 T 380 180" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="3,3" />
                    
                    {/* Nearby Office node */}
                    <circle cx="180" cy="90" r="14" fill="#ef4444" className="animate-ping opacity-40" />
                    <circle cx="180" cy="90" r="8" fill="#ef4444" />
                    <text x="195" y="95" fill="#1e293b" fontSize="12" fontWeight="bold">Nearby Secretariat</text>

                    {/* Citizen starting node */}
                    <circle cx="120" cy="140" r="10" fill="#3b82f6" />
                    <text x="70" y="145" fill="#2563eb" fontSize="11" fontWeight="bold">Your Safe Point</text>
                    <path d="M 120 140 L 180 90" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="4" />
                  </svg>
                </div>

                {/* Simulated Address matching selected attributes */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-lg flex items-center justify-between">
                    <span>🏫 {selectedDistrict} {selectedOfficeType === 'sachivalayam' ? 'గ్రామ సచివాలయం (Secretariat)' : 'మీసేవ కేంద్రం (MeeSeva Center)'}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Open</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <p className="text-slate-400 capitalize">{language === 'te' ? 'కార్యాలయ చిరునామా' : 'Office Address'}</p>
                      <p className="text-slate-800 text-sm mt-1">AP Government Complex Road, Block B, {selectedDistrict} District, Andhra Pradesh</p>
                    </div>
                    <div>
                      <p className="text-slate-400 capitalize">{language === 'te' ? 'అధికారి ఫోన్ నంబర్ / సహాయకుడి విరాట్' : 'Assigned Ward Officer / Mobile'}</p>
                      <p className="text-slate-800 text-sm mt-1">Sri K. Prasad Reddy, Volunteer Mobile: +91 99XXXX8477</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ==================== EMERGENCY WELFARE HELPLINES TAB ==================== */}
        {activeTab === 'helpline' && (
          <div className="space-y-6" id="helplines-directory-tab">
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-6 sm:p-8 space-y-2 rounded-3xl shadow-md">
              <h2 className="text-2xl sm:text-3xl font-black">{language === 'te' ? '📞 అధికారిక హెల్ప్ లైన్ నంబర్లు' : '📞 Official Welfare Helplines Directory'}</h2>
              <p className="text-slate-200 text-sm">
                {language === 'te' 
                  ? 'రుణాల కొరత, పెన్షన్ చెల్లింపుల ఆలస్యం, మరియు ఇళ్ల దరఖాస్తులపై అధికారులను నేరుగా సంప్రదించడానికి ఫోన్ చేయండి.' 
                  : 'Touch or click on the dial cards below to connect instantly with government officials regarding delay issues.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="helpline-directory-grid">
              {EMERGENCY_HELPLINES.map((hl, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-emerald-600 transition-all flex flex-col justify-between items-start gap-4 shadow-sm" id={`helpline-item-${idx}`}>
                  <div className="space-y-1">
                    <span className="text-3xl">📞</span>
                    <h3 className="text-lg font-extrabold text-slate-800">{language === 'te' ? hl.nameTe : hl.nameEn}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-semibold">{language === 'te' ? hl.purposeTe : hl.purposeEn}</p>
                  </div>
                  <div className="w-full flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-widest">{language === 'te' ? 'టోల్-ఫ్రీ ఫోన్ నంబరు' : 'Toll-Free Phone'}</span>
                      <strong className="text-slate-900 font-extrabold text-xl">{hl.number}</strong>
                    </div>
                    <a 
                      href={`tel:${hl.number}`} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all"
                    >
                      {language === 'te' ? 'ఇప్పుడే కాల్ చేయి' : 'Call Now'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* --- INTEGRATED AI FLOATING CHAT ASSISTANT BOX --- */}
      <div className="bg-white border-t-4 border-emerald-600 shadow-2xl p-4 sm:p-6 lg:px-8 mt-12 relative z-10" id="integrated-ai-chat-assistant">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* AI Helper details left sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 p-2 rounded-xl text-xl">🤖</span>
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-1.5">
                  Praja Mitra AI Assistant
                  <Sparkles size={16} className="text-amber-500 shrink-0" />
                </h3>
                <p className="text-slate-500 text-xs font-semibold">{language === 'te' ? 'నిరంతర 24 గంటల సచివాలయం స్నేహితుడు' : 'Available with 24/7 scheme translation support'}</p>
              </div>
            </div>

            <p className={`text-slate-600 leading-relaxed font-medium ${easyMode ? 'text-lg' : 'text-xs'}`}>
              {language === 'te'
                ? "నేరుగా మాట్లాడండి లేదా కింద ఉన్న ప్రశ్నల బటన్లను నొక్కండి. ఉదాహరణకు: 'నాకు బడి చుదువుతున్న ఇద్దరు పిల్లలు ఉన్నారు, అమ్మ ఒడి పథకం వర్తిస్తుందా?'"
                : "Talk to our advisor without any legal jargon. We support languages Telugu & English based on your settings."}
            </p>

            {/* Suggested quick template queries cards */}
            <div className="space-y-2 pt-2">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{language === 'te' ? 'క్విక్ ప్రశ్న టెంప్లేట్ ముక్కలు:' : 'Tap to Ask Instantly:'}</span>
              <div className="flex flex-col gap-1.5">
                {[
                  language === 'te' 
                    ? "నేను రైతుని. నాకు ఏ పథకాలు వస్తాయి?" 
                    : "I am a farmer. What schemes do I qualify for?",
                  language === 'te' 
                    ? "నా కొడుకు ఇంజినీరింగ్ చదువుతున్నాడు. స్కాలర్షిప్ ఉందా?" 
                    : "My child is in college. Is there any fee refund scholarship?",
                  language === 'te' 
                    ? "వృద్ధులకు ఇంటి వద్దకే పెన్షన్ ఎలా వస్తుంది?" 
                    : "Who delivers monthly old age pension?"
                ].map((qText, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestionClick(qText)}
                    className="text-left bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold p-2.5 rounded-xl border border-slate-200 text-xs truncate transition-all duration-300"
                  >
                    🚀 "{qText}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Chat interface layout right container */}
          <div className="lg:col-span-8 flex flex-col bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden min-h-[350px] shadow-sm">
            
            {/* Header detail bar */}
            <div className="bg-slate-900 text-slate-100 px-4 py-3 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                AP Gov Secretariat Authorized Intelligence
              </span>
              <span>English / తెలుగు</span>
            </div>

            {/* Chat Messages Frame list */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[250px] min-h-[250px]" id="chat-messages-container">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <span className="text-4xl">👋</span>
                  <p className="text-xs font-bold">
                    {language === 'te' 
                      ? 'నమస్కారం! నేను ప్రజా మిత్ర. కింద ఉన్న చాట్ బాక్సుతో ఏదైనా అడగండి!' 
                      : 'Hello! I am Praja Mitra. Ask me about Rythu Bharosa, Amma Vodi, Pension or Aarogyasri!'}
                  </p>
                </div>
              ) : (
                chatHistory.map((ch) => (
                  <div key={ch.id} className={`flex ${ch.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                      ch.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                    }`}>
                      <p className={`leading-relaxed font-semibold ${easyMode ? 'text-xl' : 'text-sm'}`}>
                        {ch.text}
                      </p>
                      
                      {/* TTS read aloud for individual model responses */}
                      {ch.role === 'model' && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                          <button
                            onClick={() => speakText(ch.text)}
                            className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-extrabold text-[10px] px-2.5 py-1 rounded flex items-center gap-1 transition-all"
                            title="Read response aloud"
                          >
                            <Volume2 size={12} /> {currentlySpeakingText === ch.text ? '⏹️ Stop' : '🔊 Listen Speech'}
                          </button>
                          <span className="text-[10px] text-slate-400">{ch.timestamp}</span>
                        </div>
                      )}
                      
                      {ch.role === 'user' && (
                        <div className="text-right text-[10px] text-emerald-200 mt-1">{ch.timestamp}</div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Loader indicator */}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border rounded-2xl p-4 shadow-sm text-slate-400 text-xs font-bold flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    {language === 'te' ? 'ప్రజా మిత్ర విశ్లేషిస్తోంది...' : 'Praja Mitra is preparing your answer...'}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Submission controller */}
            <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={language === 'te' ? "పథకం గురించి అడగండి (ఉదా: నా కొడుకు ఇంజినీరింగ్ చదువుతున్నాడు)" : "Ask details about schemes..."}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 font-medium text-slate-800 text-sm focus:outline-none focus:border-emerald-600"
                id="ai-assistant-text-input"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-colors active:scale-95 shrink-0"
                id="ai-assistant-send-btn"
              >
                {language === 'te' ? 'పంపండి' : 'Send'}
              </button>
            </form>

          </div>

        </div>
      </div>

      {/* --- FOOTER LICENSE CREDITS --- */}
      <footer className="bg-slate-900 border-t-4 border-amber-500 text-white py-12 px-4 sm:px-8 mt-auto" id="app-footer-credits">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <h4 className="text-lg font-black text-amber-400">Praja Mitra</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'te' 
                ? 'ప్రజా మిత్ర అనేది ఆంధ్రప్రదేశ్ గ్రామీణ మరియు పట్టణ నివాసులకు పథకాలను సులభంగా అర్థం చేసుకోవడానికి రూపొందించబడిన స్వతంత్ర AI సహాయక కేంద్రం.' 
                : 'Pristine educational intelligence companion designed with extreme accessibility and Elder Easy Mode for rural citizens of Andhra Pradesh.'}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-black text-amber-400">{language === 'te' ? 'ప్రధాన విభాగాలు:' : 'Core Navigation:'}</h4>
            <ul className="text-xs text-slate-400 space-y-2 font-semibold">
              <li><button onClick={() => { setActiveTab('home'); stopSpeaking(); }} className="hover:text-white underline">🏠 {language === 'te' ? 'పథకాలు గ్రిడ్' : 'Schemes Grid'}</button></li>
              <li><button onClick={() => { setActiveTab('checklist'); stopSpeaking(); }} className="hover:text-white underline">📄 {language === 'te' ? 'పత్రాల చెకర్ అవసరం' : 'Documents Prep Coordinator'}</button></li>
              <li><button onClick={() => { setActiveTab('map'); stopSpeaking(); }} className="hover:text-white underline">📍 {language === 'te' ? 'సచివాలయాల స్థానం' : 'Office Locator Coordinates'}</button></li>
              <li><button onClick={() => { setActiveTab('helpline'); stopSpeaking(); }} className="hover:text-white underline">📞 {language === 'te' ? 'అధికారిక ఫోన్ నంబర్లు' : 'Toll-Free Help Directory'}</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-black text-amber-400">{language === 'te' ? 'అధికారిక హామీలు:' : 'Digital Integrity:'}</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              {language === 'te' 
                ? 'ఈ వ్యవస్థ ఏపి ప్రభుత్వ అధికారాల విభాగాలపై అనుసంధానించబడిన శోధన కేంద్రాన్ని మాత్రమే కలిగి ఉంది. కాబట్టి పూర్తి ధృవీకరణల అధికారాలు మీ సచివాలయానికే కలవు.'
                : 'All information provided is kept cached and compliant with continuous offline reading capability. We adhere to local storage permissions.'}
            </p>
            <div className="text-[10px] text-slate-500 font-extrabold uppercase bg-slate-950 p-2.5 rounded border border-slate-800">
              PWA COMPLIANT &bull; OFFLINE SECURED
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-8 pt-6 text-center text-[11px] text-slate-500 font-bold space-y-1">
          <p>© 2026 Praja Mitra Initiative. Made with 💚 for Andhra Pradesh Citizens.</p>
          <p>{language === 'te' ? 'ఆంధ్రప్రదేశ్ - సేవయే పరమావధి' : 'Andhra Pradesh - Transparent Digital Empowerment'}</p>
        </div>
      </footer>

    </div>
  );
}
