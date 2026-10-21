import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Send, Volume2, VolumeX, Loader2, Bot, User as UserIcon, ExternalLink, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage, Language } from '../types';

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function VoiceAssistantModal({ isOpen, onClose, language }: VoiceAssistantProps) {
  const isTe = language === 'te';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: isTe
        ? '**నమస్కారం!** నేను **ప్రజా మిత్ర** ఏఐ వాయిస్ సహాయకుడిని. \n\nఆంధ్రప్రదేశ్ ప్రభుత్వ సంక్షేమ పథకాలైన **పీఎం-కిసాన్**, **తల్లికి వందనం**, **ఎన్టీఆర్ భరోసా పెన్షన్**, **ఆరోగ్యశ్రీ** వంటి పథకాల గురించిన వివరాలు, అర్హతలు, కావలసిన పత్రాలు మరియు దరఖాస్తు విధానాన్ని ఇక్కడ సులభంగా తెలుసుకోవచ్చు.'
        : '**Namaskaram!** I am **Praja Mitra** AI Assistant.\n\nAsk any question about Andhra Pradesh welfare schemes like **PM-Kisan**, **Thalliki Vandanam**, **NTR Bharosa Pension**, **Aarogyasri Health Scheme**, and college fee reimbursements. I provide verified overviews, eligibility, documents, and application steps.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef<boolean>(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Monitor user scrolling to avoid forcibly dragging them down when reading older messages
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    shouldAutoScrollRef.current = isNearBottom;
  };

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Speech Synthesis - clean markdown formatting before reading aloud
  const speakText = (text: string, index?: number) => {
    window.speechSynthesis.cancel();
    if (speakingIndex === index && index !== undefined) {
      setSpeakingIndex(null);
      return;
    }

    const plainText = text
      .replace(/[*#_`\[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\n\r]+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = isTe ? 'te-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onstart = () => setSpeakingIndex(index !== undefined ? index : -1);
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeakingIndex(null);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Speech Recognition
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isTe ? 'మీ బ్రౌజర్ వాయిస్ రికగ్నిషన్‌ను సపోర్ట్ చేయదు.' : 'Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isTe ? 'te-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      handleSend(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : input).trim();
    if (!textToSend || loading) return;

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Always scroll on user sending new message
    shouldAutoScrollRef.current = true;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
          language: language,
          easyMode: false,
        }),
      });
      const data = await res.json();
      const reply = data.response || (isTe ? 'సమాధానం రాలేదు.' : 'No response received.');
      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
      speakText(reply, newMessages.length);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: isTe
            ? '**కనెక్షన్ లోపం:** సర్వర్‌తో అనుసంధానం కాలేదు. దయచేసి కొద్దిసేపటి తర్వాత ప్రయత్నించండి లేదా మీ ఇంటర్నెట్ తనిఖీ చేసుకోండి.'
            : '**Connection Error:** Could not reach the Praja Mitra server. Please verify your internet connection and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  const quickPrompts = isTe ? [
    'పీఎం-కిసాన్ వివరాలు చెప్పండి',
    'తల్లికి వందనం అర్హతలు ఏమిటి?',
    'ఎన్టీఆర్ భరోసా పెన్షన్ వివరాలు',
    'ఆరోగ్యశ్రీ ఉచిత వైద్యం పరిమితి ఎంత?',
    'సమీప సచివాలయం ఎక్కడ ఉంది?',
  ] : [
    'Tell me about PM-Kisan',
    'Eligibility for Thalliki Vandanam',
    'NTR Bharosa Pension details',
    'Aarogyasri Health treatment limits',
    'Where is the nearest Sachivalayam?',
  ];

  // Custom Markdown renderers for ChatGPT-style high readability
  const markdownComponents = {
    h1: ({ ...props }: any) => (
      <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-4 mb-2 first:mt-0 leading-snug tracking-tight" {...props} />
    ),
    h2: ({ ...props }: any) => (
      <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-4 mb-2 first:mt-0 leading-snug tracking-tight border-b border-slate-200 pb-1" {...props} />
    ),
    h3: ({ ...props }: any) => (
      <h3 className="text-[15px] sm:text-base font-bold text-slate-900 mt-3.5 mb-1.5 first:mt-0 leading-snug tracking-tight" {...props} />
    ),
    p: ({ ...props }: any) => (
      <p className="mb-3 last:mb-0 leading-[1.7] text-slate-800 text-[15px] sm:text-[16px]" {...props} />
    ),
    strong: ({ ...props }: any) => (
      <strong className="font-semibold text-slate-900" {...props} />
    ),
    ul: ({ ...props }: any) => (
      <ul className="list-disc pl-5 my-2.5 space-y-1.5 marker:text-emerald-600 text-slate-800 text-[15px] sm:text-[16px] leading-[1.7]" {...props} />
    ),
    ol: ({ ...props }: any) => (
      <ol className="list-decimal pl-5 my-2.5 space-y-1.5 marker:text-emerald-700 font-medium text-slate-800 text-[15px] sm:text-[16px] leading-[1.7]" {...props} />
    ),
    li: ({ ...props }: any) => (
      <li className="pl-1" {...props} />
    ),
    a: ({ href, children, ...props }: any) => {
      const isSafe = href && (href.startsWith('https://') || href.startsWith('http://') || href.startsWith('tel:') || href.startsWith('mailto:'));
      const safeHref = isSafe ? href : '#';
      return (
        <a
          href={safeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-3 decoration-emerald-500/60 hover:decoration-emerald-700 transition-colors inline-flex items-center gap-1 break-all"
          {...props}
        >
          <span>{children}</span>
          <ExternalLink size={13} className="shrink-0 opacity-80" />
        </a>
      );
    },
    table: ({ ...props }: any) => (
      <div className="overflow-x-auto my-3 rounded-xl border border-slate-200">
        <table className="min-w-full text-xs sm:text-sm divide-y divide-slate-200" {...props} />
      </div>
    ),
    th: ({ ...props }: any) => (
      <th className="px-3.5 py-2.5 text-left font-semibold text-slate-900 bg-slate-100" {...props} />
    ),
    td: ({ ...props }: any) => (
      <td className="px-3.5 py-2.5 text-slate-700 border-t border-slate-100" {...props} />
    ),
    code: ({ ...props }: any) => (
      <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[13px] border border-slate-200" {...props} />
    ),
    blockquote: ({ ...props }: any) => (
      <blockquote className="border-l-4 border-emerald-600 pl-3.5 py-1.5 italic text-slate-700 my-3 bg-emerald-50/60 rounded-r-lg" {...props} />
    ),
    hr: ({ ...props }: any) => (
      <hr className="my-4 border-slate-200" {...props} />
    ),
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl sm:max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[760px] border border-slate-200">
        
        {/* Header - Compact with Praja Mitra branding */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-xs">
              <Bot size={22} className="text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base leading-tight tracking-tight text-white">
                  {isTe ? 'ప్రజా మిత్ర • ఏఐ వాయిస్ అసిస్టెంట్' : 'Praja Mitra • AI Voice Assistant'}
                </h3>
                <span className="bg-emerald-500/40 text-emerald-100 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {isTe ? 'లైవ్' : 'Live'}
                </span>
              </div>
              <p className="text-emerald-200/90 text-xs mt-0.5">
                {isTe ? 'ఆంధ్రప్రదేశ్ ప్రభుత్వ సంక్షేమ పథకాల సమాచార మార్గదర్శి' : 'Official Andhra Pradesh Welfare Schemes Assistant'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {speakingIndex !== null && (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-1 text-xs bg-amber-400 text-slate-900 font-medium px-2.5 py-1.5 rounded-full hover:bg-amber-300 transition-colors shadow-xs"
                title={isTe ? 'వాయిస్ ఆపండి' : 'Stop voice'}
              >
                <VolumeX size={14} />
                <span className="hidden sm:inline">{isTe ? 'వాయిస్ ఆపండి' : 'Mute'}</span>
              </button>
            )}
            <button
              onClick={() => { stopSpeaking(); onClose(); }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Chat Message Stream - ChatGPT Style */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/60"
        >
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            const isSpeakingCurrent = speakingIndex === idx;

            if (isUser) {
              return (
                <div key={idx} className="flex justify-end items-end gap-2 pl-8">
                  <div className="bg-emerald-700 text-white px-4 py-2.5 rounded-2xl rounded-br-xs text-[14px] sm:text-[15px] leading-relaxed max-w-[85%] sm:max-w-[75%] shadow-xs break-words font-normal">
                    {m.text}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 text-xs font-bold mb-0.5">
                    <UserIcon size={14} />
                  </div>
                </div>
              );
            }

            // Assistant response - ChatGPT clean presentation
            return (
              <div key={idx} className="flex items-start gap-3 sm:gap-3.5 pr-2 sm:pr-8 group">
                {/* Bot Avatar */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot size={18} className="text-emerald-100" />
                </div>

                {/* Assistant Content - subtle transparent background, clean typography */}
                <div className="flex-1 min-w-0 bg-white sm:bg-white/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-sm">
                  <div className="font-sans text-slate-800 text-[15px] sm:text-[16px] leading-[1.7] antialiased break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {m.text}
                    </ReactMarkdown>
                  </div>

                  {/* Message Action Bar (Copy & Speak) */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px] font-medium text-emerald-700/80">
                      {isTe ? 'ప్రజా మిత్ర • అధికారిక మార్గదర్శనం' : 'Praja Mitra • Verified Scheme Guidance'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyToClipboard(m.text, idx)}
                        className="p-1.5 rounded-md hover:bg-slate-100 hover:text-slate-700 text-slate-400 transition-colors"
                        title={isTe ? 'కాపీ చేయండి' : 'Copy answer'}
                      >
                        {copiedIndex === idx ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => speakText(m.text, idx)}
                        className={`p-1.5 rounded-md transition-colors ${
                          isSpeakingCurrent 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'hover:bg-slate-100 hover:text-slate-700 text-slate-400'
                        }`}
                        title={isSpeakingCurrent ? (isTe ? 'ఆపండి' : 'Stop voice') : (isTe ? 'వినండి' : 'Listen')}
                      >
                        {isSpeakingCurrent ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Thinking / Loading indicator */}
          {loading && (
            <div className="flex items-start gap-3 sm:gap-3.5 pr-8">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Bot size={18} className="text-emerald-100" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-2.5 text-slate-600 text-sm">
                <Loader2 size={16} className="animate-spin text-emerald-600" />
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  {isTe ? 'ప్రజా మిత్ర సమాధానం సిద్ధం చేస్తోంది...' : 'Praja Mitra is preparing your response...'}
                </span>
                <span className="inline-flex gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-300" />
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 sm:px-5 py-2.5 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto text-[11px] sm:text-xs scrollbar-hide shrink-0">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider shrink-0 self-center hidden sm:inline mr-1">
            {isTe ? 'సూచనలు:' : 'Suggested:'}
          </span>
          {quickPrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(promptText)}
              disabled={loading}
              className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors shrink-0 font-medium disabled:opacity-50 active:scale-95 text-xs"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input Bar & Controls */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-2xl p-1.5 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-xs">
            
            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-md scale-105'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
              }`}
              title={isListening ? (isTe ? 'వినడం ఆపండి' : 'Stop listening') : (isTe ? 'మైక్ ద్వారా మాట్లాడండి' : 'Speak via microphone')}
            >
              {isListening ? <MicOff size={19} /> : <Mic size={19} />}
            </button>

            {/* Multiline auto-expanding textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder={
                isListening
                  ? (isTe ? 'వింటున్నాను... మాట్లాడండి...' : 'Listening... please speak now...')
                  : (isTe
                      ? 'మీ ప్రశ్న ఇక్కడ అడగండి (Enter: పంపు, Shift+Enter: కొత్త లైన్)...'
                      : 'Ask about any AP scheme (Enter to send, Shift+Enter for newline)...')
              }
              className="flex-1 bg-transparent border-0 px-2.5 py-2 text-[14px] sm:text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none max-h-32 leading-relaxed"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center shrink-0 transition-all shadow-xs disabled:shadow-none"
              title={isTe ? 'పంపండి' : 'Send message'}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>
              {isTe ? 'ప్రభుత్వ సమాచారం ఆధారంగా' : 'Based on official AP Government welfare portals'}
            </span>
            <span>
              {isTe ? 'సహాయం: 1902 టోల్ ఫ్రీ' : 'Citizen Helpline: 1902'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
