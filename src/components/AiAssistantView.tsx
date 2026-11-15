import { Mic, MicOff, RefreshCw, RotateCcw, Send, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Translations } from '../i18n/translations';
import type { AiChatMessage, LanguageCode, NasaOverviewResponse } from '../types/farm';

interface AiAssistantViewProps {
  language: LanguageCode;
  t: Translations;
  selectedLabel: string;
  selectedLat: number;
  selectedLon: number;
  activeCropName: string;
  overview: NasaOverviewResponse | null;
  aiAvailable: boolean | null;
  messages: AiChatMessage[];
  onChangeMessages: (updater: (prev: AiChatMessage[]) => AiChatMessage[]) => void;
  pendingPrompt: string | null;
  onClearPendingPrompt: () => void;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechLang(lang: LanguageCode): string {
  if (lang === 'hi') return 'hi-IN';
  if (lang === 'bn') return 'bn-IN';
  return 'en-IN';
}

export function AiAssistantView({
  language,
  t,
  selectedLabel,
  selectedLat,
  selectedLon,
  activeCropName,
  overview,
  aiAvailable,
  messages,
  onChangeMessages,
  pendingPrompt,
  onClearPendingPrompt,
}: AiAssistantViewProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const sendingRef = useRef(false);

  // Load available browser TTS voices for English, Hindi, and Bengali
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, []);

  const speakText = (text: string, idx: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_`]/g, '');
    const targetLang = getSpeechLang(language);
    const shortLang = language;
    const matchedVoice =
      voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase()) ??
      voices.find((v) => v.lang.toLowerCase().startsWith(shortLang));

    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = targetLang;
    if (matchedVoice) utter.voice = matchedVoice;
    utter.rate = 0.96;
    utter.onend = () => setSpeakingIdx(null);
    utter.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIdx(null);
  };

  const sendMessage = async (textToSend: string, isRetry = false) => {
    const trimmed = textToSend.trim();
    if (!trimmed || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    setVoiceError(null);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const cleaned = isRetry ? messages.filter((m) => !m.error) : messages;
    const last = cleaned[cleaned.length - 1];
    const nextList: AiChatMessage[] =
      isRetry && last?.role === 'user' && last.content === trimmed
        ? cleaned
        : [...cleaned, { role: 'user' as const, content: trimmed, timestamp }];
    const historyForApi = nextList
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }));

    onChangeMessages(() => nextList);

    if (!isRetry) setInput('');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages:
            historyForApi.length > 0 ? historyForApi : [{ role: 'user', content: trimmed }],
          language,
          locationLabel: selectedLabel,
          lat: selectedLat,
          lon: selectedLon,
          cropName: activeCropName,
          nasaData: overview,
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || t.ai.errorFallback);
      }

      const aiMsg: AiChatMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const newIndex = nextList.length;
      onChangeMessages((prev) => [...prev, aiMsg]);

      if (autoSpeak) {
        setTimeout(() => speakText(aiMsg.content, newIndex), 50);
      }
    } catch {
      const errMsg: AiChatMessage = {
        role: 'assistant',
        content: t.ai.errorFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true,
        retryPrompt: trimmed,
      };
      onChangeMessages((prev) => [...prev, errMsg]);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  useEffect(() => {
    if (pendingPrompt) {
      const prompt = pendingPrompt;
      onClearPendingPrompt();
      void sendMessage(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      recognitionRef.current?.stop();
    };
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setVoiceError(t.ai.voiceUnsupported);
      return;
    }

    setVoiceError(null);
    const recognition = new SpeechRec();
    recognition.lang = getSpeechLang(language);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? '';
      if (transcript.trim()) {
        setInput(transcript.trim());
      }
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setVoiceError(t.ai.voicePermissionDenied);
      } else if (event.error === 'no-speech') {
        setVoiceError(t.ai.voiceNoSpeech);
      } else {
        setVoiceError(t.ai.voiceFailed);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current = recognition;
      setIsListening(true);
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceError(t.ai.voiceFailed);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Context & Starter Questions */}
      <aside className="lg:col-span-4 space-y-5">
        <div className="bg-white border border-[#DCE7DC] rounded-2xl p-5 space-y-3">
          <h1 className="font-display text-2xl font-bold text-[#102617]">{t.ai.title}</h1>
          <p className="text-sm text-[#435E4A] leading-relaxed">{t.ai.subtitle}</p>

          <div
            className={`text-xs font-semibold ${
              aiAvailable === false ? 'text-[#B91C1C]' : 'text-[#15803D]'
            }`}
          >
            {aiAvailable === false ? t.ai.unavailableStatus : t.ai.readyStatus}
          </div>

          <div className="p-3.5 rounded-xl bg-[#F4FAF4] border border-[#D8E7D8] text-xs text-[#25452D] space-y-1">
            <div className="font-semibold">{t.ai.contextBanner}</div>
            <div className="font-bold text-sm text-[#102617]">{selectedLabel}</div>
            <div className="tabular-nums">
              {activeCropName} · {overview?.nasaPower.latestObservationDate ?? 'NASA POWER'}
            </div>
            <p className="pt-1 text-[#4A6751]">{t.ai.dataDistinctionNote}</p>
          </div>

          <label className="flex items-center justify-between gap-3 pt-1 cursor-pointer">
            <span className="text-sm font-medium text-[#213B27]">{t.ai.autoSpeakLabel}</span>
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={(e) => {
                setAutoSpeak(e.target.checked);
                if (!e.target.checked) stopSpeaking();
              }}
              className="w-5 h-5 accent-[#15803D] cursor-pointer"
            />
          </label>
        </div>

        <div className="bg-white border border-[#DCE7DC] rounded-2xl p-5 space-y-3">
          <h2 className="font-display text-sm font-bold text-[#1B3A24]">{t.ai.starterTitle}</h2>
          <div className="space-y-2">
            {t.ai.starters.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => void sendMessage(q)}
                disabled={sending}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-[#F7FBF7] hover:bg-[#E7F3E7] border border-[#DCE7DC] text-sm text-[#1D3924] transition-colors cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Panel */}
      <section className="lg:col-span-8 bg-white border border-[#DCE7DC] rounded-2xl flex flex-col min-h-[560px] max-h-[76vh]">
        <div className="px-5 py-3.5 border-b border-[#E3ECE3] flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-[#1E3B26] truncate">
            {selectedLabel} · {activeCropName}
          </span>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onChangeMessages(() => []);
                setVoiceError(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#315039] hover:bg-[#EFF6EF] cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.ai.clearChatBtn}</span>
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="p-5 rounded-2xl bg-[#F4F9F4] border border-[#DCE7DC] text-sm sm:text-base text-[#1E3B26] leading-relaxed">
              {t.ai.welcomeGreeting}
            </div>
          )}

          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isSpeakingThis = speakingIdx === idx;
            return (
              <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                    msg.error
                      ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'
                      : isUser
                      ? 'bg-[#15803D] text-white'
                      : 'bg-[#F4F9F4] text-[#102617] border border-[#DCE7DC]'
                  }`}
                >
                  {msg.content}
                </div>
                <div className="flex items-center gap-3 mt-1.5 px-1">
                  <span className="text-xs text-[#647E6B] tabular-nums">{msg.timestamp}</span>
                  {msg.error && msg.retryPrompt && (
                    <button
                      type="button"
                      disabled={sending}
                      onClick={() => void sendMessage(msg.retryPrompt!, true)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#991B1B] hover:underline cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t.ai.retryBtn}</span>
                    </button>
                  )}
                  {!isUser && !msg.error && (
                    <button
                      type="button"
                      onClick={() =>
                        isSpeakingThis ? stopSpeaking() : speakText(msg.content, idx)
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#15803D] hover:underline cursor-pointer"
                    >
                      {isSpeakingThis ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>{t.ai.stopBtn}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t.ai.listenBtn}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex items-start">
              <div className="bg-[#F4F9F4] border border-[#DCE7DC] rounded-2xl px-4 py-3 text-sm text-[#35543D]">
                {t.ai.thinkingText}
              </div>
            </div>
          )}

          {voiceError && (
            <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#991B1B]">
              {voiceError}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);
          }}
          className="p-4 border-t border-[#E3ECE3] bg-[#F9FCF9] rounded-b-2xl space-y-2"
        >
          {isListening && (
            <p className="text-xs font-semibold text-[#15803D]">{t.ai.listeningLabel}</p>
          )}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isListening
                  ? 'bg-[#DC2626] text-white'
                  : 'bg-[#EEF6EE] hover:bg-[#DFEEE0] text-[#15803D] border border-[#C6DEC6]'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{t.ai.voiceInputBtn}</span>
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.ai.inputPlaceholder}
              className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-white border border-[#C8D9C8] text-sm sm:text-base text-[#102617] placeholder:text-[#6A8470] focus:outline-2 focus:outline-[#15803D]"
            />

            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>{t.ai.sendBtn}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
