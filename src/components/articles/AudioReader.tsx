import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Sparkles,
  Settings2,
  Mic,
  Radio,
  Check,
  Key,
} from 'lucide-react';
import { sanitizeArticleForSpeech, VOICE_MODELS, VoiceModel } from '@/utils/textToSpeech';

interface AudioReaderProps {
  title: string;
  content: string;
  lang?: 'en' | 'ur';
}

// ─── Reliably load browser voices (async on Chrome/Edge) ──────────────────────
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    // Timeout safety net — 3 seconds max
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 3000);
  });
}

// ─── Pick the best voice for language + model ─────────────────────────────────
function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: 'en' | 'ur',
  model: VoiceModel
): { voice: SpeechSynthesisVoice; effectiveLang: string } | null {
  if (lang === 'ur') {
    const isMale = model.gender === 'male';

    // 1st priority: native Urdu voices (Microsoft Asad / Uzma — Windows neural)
    const urduVoices = voices.filter(
      (v) =>
        v.lang.toLowerCase().startsWith('ur') ||
        v.name.toLowerCase().includes('urdu') ||
        v.name.toLowerCase().includes('asad') ||
        v.name.toLowerCase().includes('uzma') ||
        v.name.toLowerCase().includes('hamed')
    );
    if (urduVoices.length > 0) {
      const picked =
        urduVoices.find((v) =>
          isMale
            ? v.name.includes('Asad') || v.name.toLowerCase().includes('male')
            : v.name.includes('Uzma') || v.name.toLowerCase().includes('female')
        ) || urduVoices[isMale ? 0 : urduVoices.length - 1];
      return { voice: picked, effectiveLang: picked.lang || 'ur-PK' };
    }

    // 2nd priority: Hindi voices (hi-IN) — sounds close to Urdu, widely installed
    const hindiVoices = voices.filter(
      (v) =>
        v.lang.toLowerCase().startsWith('hi') ||
        v.name.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('hemant') ||
        v.name.toLowerCase().includes('kalpana')
    );
    if (hindiVoices.length > 0) {
      const picked =
        hindiVoices.find((v) =>
          isMale
            ? v.name.toLowerCase().includes('hemant') || !v.name.toLowerCase().includes('kalpana')
            : v.name.toLowerCase().includes('kalpana') || v.name.toLowerCase().includes('female')
        ) || hindiVoices[0];
      return { voice: picked, effectiveLang: 'hi-IN' };
    }

    // 3rd priority: any available English voice — reads at slow rate
    const enVoice = voices.find((v) => v.lang.startsWith('en'));
    if (enVoice) return { voice: enVoice, effectiveLang: 'en-US' };

    return null;
  }

  // English voice priority per model
  const namePriority: Record<string, string[]> = {
    adam:      ['Microsoft David', 'David', 'Google US English', 'en-US'],
    george:    ['Microsoft George', 'Microsoft Hazel', 'Daniel', 'Google UK English Male'],
    rachel:    ['Microsoft Zira', 'Zira', 'Google US English Female', 'Samantha'],
    charlotte: ['Microsoft Aria', 'Aria', 'Google UK English Female', 'Karen'],
  };

  const preferred = namePriority[model.id] || [];
  for (const name of preferred) {
    const found = voices.find((v) => v.name.includes(name) || v.lang === name);
    if (found) return { voice: found, effectiveLang: found.lang || 'en-US' };
  }

  // Fallback: gender + locale match
  const isGB = model.id === 'george';
  const matched =
    voices.find((v) => {
      const langOk = isGB
        ? v.lang.includes('en-GB') || v.lang.includes('en_GB')
        : v.lang.includes('en-US') || v.lang.includes('en_US') || v.lang.startsWith('en');
      const genderOk =
        model.gender === 'male'
          ? !v.name.match(/zira|aria|female|samantha|karen|victoria|moira|fiona/i)
          : v.name.match(/zira|aria|female|samantha|karen|victoria|moira|fiona/i);
      return langOk && genderOk;
    }) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null;
  return matched ? { voice: matched, effectiveLang: matched.lang || 'en-US' } : null;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export const AudioReader: React.FC<AudioReaderProps> = ({
  title,
  content,
  lang = 'en',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userSpeed, setUserSpeed] = useState(1);
  const [elevenLabsKey, setElevenLabsKey] = useState(() => {
    try { return localStorage.getItem('pulse_el_key') || ''; } catch { return ''; }
  });
  const [voicesReady, setVoicesReady] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // ── Language-filtered models ────────────────────────────────────────────────
  const availableModels = useMemo(
    () => VOICE_MODELS.filter((m) => m.lang === lang),
    [lang]
  );

  const [selectedModelId, setSelectedModelId] = useState<string>(
    () => availableModels[0]?.id || (lang === 'ur' ? 'zainab' : 'adam')
  );

  useEffect(() => {
    if (!availableModels.some((m) => m.id === selectedModelId)) {
      setSelectedModelId(availableModels[0]?.id || '');
    }
  }, [lang, availableModels]);

  const activeModel = useMemo(
    () => availableModels.find((m) => m.id === selectedModelId) || availableModels[0] || VOICE_MODELS[0],
    [availableModels, selectedModelId]
  );

  // ── Pre-clean article into speech chunks ────────────────────────────────────
  const chunks = useMemo(
    () => sanitizeArticleForSpeech(title, content, lang),
    [title, content, lang]
  );

  // ── Refs for closure-safe state ────────────────────────────────────────────
  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const activeModelRef = useRef(activeModel);
  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chunksRef = useRef(chunks);
  const userSpeedRef = useRef(userSpeed);
  const isMutedRef = useRef(isMuted);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { activeModelRef.current = activeModel; }, [activeModel]);
  useEffect(() => { chunksRef.current = chunks; }, [chunks]);
  useEffect(() => {
    userSpeedRef.current = userSpeed;
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = userSpeed;
    }
  }, [userSpeed]);
  useEffect(() => {
    isMutedRef.current = isMuted;
    if (audioElementRef.current) {
      audioElementRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // ── Load browser voices once ────────────────────────────────────────────────
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    loadVoices().then((voices) => {
      voicesRef.current = voices;
      setVoicesReady(true);
    });
  }, [lang]);

  // ── Stop on lang/title change ───────────────────────────────────────────────
  useEffect(() => {
    stopAll();
    setCurrentChunkIndex(0);
    currentIndexRef.current = 0;
  }, [lang, title]);

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  // ── Core stop function ──────────────────────────────────────────────────────
  const stopAll = useCallback(() => {
    isPlayingRef.current = false;
    if (breathTimerRef.current) {
      clearTimeout(breathTimerRef.current);
      breathTimerRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.onended = null;
      audioElementRef.current.onerror = null;
      audioElementRef.current.src = '';
      audioElementRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  // ── Speak a single chunk using Dual-Engine (HD Neural Audio / Web Speech) ───
  const speakChunk = useCallback(
    (index: number, model: VoiceModel) => {
      if (!isPlayingRef.current) return;
      if (index >= chunksRef.current.length) {
        // Finished all chunks
        isPlayingRef.current = false;
        setIsPlaying(false);
        setCurrentChunkIndex(0);
        currentIndexRef.current = 0;
        return;
      }

      const text = chunksRef.current[index];
      if (!text || text.trim().length < 2) {
        speakChunk(index + 1, model);
        return;
      }

      setCurrentChunkIndex(index);
      currentIndexRef.current = index;
      setIsLoading(false);

      // Web Speech API execution path
      const playViaWebSpeech = () => {
        if (!('speechSynthesis' in window)) return;
        const synth = window.speechSynthesis;
        synth.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
        utter.rate = Math.max(0.6, Math.min(1.8, (model.rate || 1.0) * userSpeedRef.current));
        utter.pitch = Math.max(0.5, Math.min(2.0, model.pitch || 1.0));
        utter.volume = isMutedRef.current ? 0 : 1;

        const voiceResult = pickVoice(voicesRef.current, lang, model);
        if (voiceResult) {
          utter.voice = voiceResult.voice;
          utter.lang = voiceResult.effectiveLang;
        }

        utter.onend = () => {
          if (!isPlayingRef.current) return;
          breathTimerRef.current = setTimeout(() => {
            if (isPlayingRef.current) {
              speakChunk(index + 1, activeModelRef.current);
            }
          }, 200);
        };

        utter.onerror = (e) => {
          if (e.error === 'interrupted' || e.error === 'canceled') return;
          if (isPlayingRef.current) {
            breathTimerRef.current = setTimeout(() => {
              speakChunk(index + 1, activeModelRef.current);
            }, 300);
          }
        };

        synth.speak(utter);
      };

      // Native Urdu voice check in browser
      const hasNativeUrduVoice =
        lang === 'ur' &&
        voicesRef.current.some(
          (v) =>
            v.lang.toLowerCase().startsWith('ur') ||
            v.name.toLowerCase().includes('asad') ||
            v.name.toLowerCase().includes('uzma')
        );

      // If Urdu and no offline native Urdu voice installed, stream studio HD neural voice
      if (lang === 'ur' && !hasNativeUrduVoice) {
        if (audioElementRef.current) {
          audioElementRef.current.pause();
          audioElementRef.current.onended = null;
          audioElementRef.current.onerror = null;
          audioElementRef.current.src = '';
          audioElementRef.current = null;
        }

        const safeSlice = text.slice(0, 160).trim();
        const ttsUrl = `/api/tts?text=${encodeURIComponent(safeSlice)}&lang=ur&voice=${model.id}`;
        const audio = new Audio(ttsUrl);
        audio.playbackRate = userSpeedRef.current;
        audio.muted = isMutedRef.current;
        audioElementRef.current = audio;

        audio.onended = () => {
          if (!isPlayingRef.current) return;
          breathTimerRef.current = setTimeout(() => {
            if (isPlayingRef.current) {
              speakChunk(index + 1, activeModelRef.current);
            }
          }, 180);
        };

        audio.onerror = () => {
          // If offline or network drop, fall back to browser Web Speech
          playViaWebSpeech();
        };

        audio.play().catch(() => {
          playViaWebSpeech();
        });
        return;
      }

      playViaWebSpeech();
    },
    [lang]
  );

  // ── Play / Pause toggle ─────────────────────────────────────────────────────
  const handleTogglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      stopAll();
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      setIsLoading(true);
      const startIndex = currentIndexRef.current;
      setTimeout(() => {
        speakChunk(startIndex, activeModelRef.current);
      }, 80);
    }
  }, [stopAll, speakChunk]);

  // ── Restart ────────────────────────────────────────────────────────────────
  const handleRestart = useCallback(() => {
    stopAll();
    setCurrentChunkIndex(0);
    currentIndexRef.current = 0;
  }, [stopAll]);

  // ── Skip Forward ───────────────────────────────────────────────────────────
  const handleSkipForward = useCallback(() => {
    const next = Math.min(chunksRef.current.length - 1, currentIndexRef.current + 1);
    if (isPlayingRef.current) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
        audioElementRef.current = null;
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
      setCurrentChunkIndex(next);
      currentIndexRef.current = next;
      setTimeout(() => speakChunk(next, activeModelRef.current), 80);
    } else {
      setCurrentChunkIndex(next);
      currentIndexRef.current = next;
    }
  }, [speakChunk]);

  // ── Skip Backward ──────────────────────────────────────────────────────────
  const handleSkipBackward = useCallback(() => {
    const prev = Math.max(0, currentIndexRef.current - 1);
    if (isPlayingRef.current) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
        audioElementRef.current = null;
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
      setCurrentChunkIndex(prev);
      currentIndexRef.current = prev;
      setTimeout(() => speakChunk(prev, activeModelRef.current), 80);
    } else {
      setCurrentChunkIndex(prev);
      currentIndexRef.current = prev;
    }
  }, [speakChunk]);

  // ── Speed Cycle ────────────────────────────────────────────────────────────
  const handleCycleSpeed = useCallback(() => {
    const speeds = [0.85, 1, 1.25, 1.5];
    const next = speeds[(speeds.indexOf(userSpeed) + 1) % speeds.length];
    setUserSpeed(next);
    userSpeedRef.current = next;
  }, [userSpeed]);

  // ── Voice model switch ─────────────────────────────────────────────────────
  const handleSelectModel = useCallback(
    (modelId: string) => {
      const model = availableModels.find((m) => m.id === modelId) || activeModel;
      setSelectedModelId(modelId);
      activeModelRef.current = model;
      if (isPlayingRef.current) {
        window.speechSynthesis.cancel();
        if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
        setTimeout(() => speakChunk(currentIndexRef.current, model), 80);
      }
    },
    [availableModels, activeModel, speakChunk]
  );

  // ── Mute ──────────────────────────────────────────────────────────────────
  const handleToggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    isMutedRef.current = next;
    if (isPlayingRef.current) {
      // Re-speak current chunk at new volume
      window.speechSynthesis.cancel();
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
      setTimeout(() => speakChunk(currentIndexRef.current, activeModelRef.current), 80);
    }
  }, [isMuted, speakChunk]);

  const progressPercent = Math.min(
    100,
    Math.round(((currentChunkIndex + 1) / Math.max(1, chunks.length)) * 100)
  );

  const activeSentenceText = chunks[currentChunkIndex] || '';

  // Don't render if no content could be parsed
  if (!title && !content) return null;
  if (chunks.length === 0) return null;

  const accentColor = lang === 'ur' ? 'emerald' : 'blue';

  return (
    <div className="relative rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-sm p-4 sm:p-5 my-6 overflow-hidden transition-all">
      {/* Bottom progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${lang === 'ur' ? 'from-emerald-500 via-teal-400 to-green-400' : 'from-blue-600 via-indigo-500 to-cyan-400'} transition-all duration-500`}
        style={{ width: `${progressPercent}%` }}
      />

      {/* HD Neural Studio Voice Banner for Urdu */}
      {lang === 'ur' && (
        <div className="mb-3.5 flex items-center justify-between gap-2 p-2.5 px-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold font-urdu">
              <strong>سٹوڈیو نیورل وائس فعال:</strong> خودکار صاف اردو تلفظ کے ساتھ لائیو نشریات
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-mono">
            HD AI Audio
          </span>
        </div>
      )}

      {/* Main row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: meta */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isPlaying
                ? `bg-${accentColor}-600 text-white shadow-md shadow-${accentColor}-500/25`
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-neutral-950 dark:text-white uppercase tracking-wider">
                {lang === 'ur' ? 'آڈیو بلیٹن' : 'Audio Broadcast'}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-xs bg-${accentColor}-100 dark:bg-${accentColor}-950/70 text-${accentColor}-800 dark:text-${accentColor}-300`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                {activeModel.tag}
              </span>
              <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                {activeModel.name}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {isPlaying ? (
                <div className={`flex items-center gap-1.5 font-medium text-${accentColor}-600 dark:text-${accentColor}-400`}>
                  <div className="flex items-end gap-0.5 h-3">
                    {[0, 150, 300, 200].map((delay, i) => (
                      <span
                        key={i}
                        className={`w-1 bg-${accentColor}-500 rounded-full animate-bounce`}
                        style={{ height: `${[12, 16, 8, 14][i]}px`, animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                  <span>
                    {lang === 'ur'
                      ? `جملہ ${currentChunkIndex + 1} از ${chunks.length}`
                      : `Sentence ${currentChunkIndex + 1} of ${chunks.length}`}
                  </span>
                </div>
              ) : (
                <span>
                  {lang === 'ur'
                    ? 'پیشہ ورانہ آواز میں مکمل خبر سنیں'
                    : `${chunks.length} sentences · ${Math.ceil(chunks.length * 3.5)}s est.`}
                </span>
              )}
              <span>•</span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
          <button
            onClick={handleSkipBackward}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title={lang === 'ur' ? 'پچھلا جملہ' : 'Previous sentence'}
            aria-label="Previous sentence"
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer text-white bg-${accentColor}-600 hover:bg-${accentColor}-700 shadow-${accentColor}-600/25 disabled:opacity-70`}
            aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>
              {isLoading
                ? lang === 'ur' ? 'لوڈ...' : 'Loading...'
                : isPlaying
                ? lang === 'ur' ? 'وقفہ' : 'Pause'
                : lang === 'ur' ? 'خبر سنیں' : 'Play'}
            </span>
          </button>

          <button
            onClick={handleSkipForward}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title={lang === 'ur' ? 'اگلا جملہ' : 'Next sentence'}
            aria-label="Next sentence"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestart}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title={lang === 'ur' ? 'دوبارہ شروع' : 'Restart'}
            aria-label="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleCycleSpeed}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors cursor-pointer"
            title="Toggle playback speed"
            aria-label="Toggle playback speed"
          >
            {userSpeed}x
          </button>

          <button
            onClick={() => setShowSettings((s) => !s)}
            className={`p-2 rounded-lg transition-colors cursor-pointer relative ${
              showSettings
                ? 'bg-neutral-200 dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Voice settings"
            aria-label="Voice settings"
          >
            <Settings2 className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </button>
        </div>
      </div>

      {/* Live subtitle */}
      {isPlaying && activeSentenceText && (
        <div className="mt-3.5 pt-3.5 border-t border-neutral-100 dark:border-neutral-800/80 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800">
            <Radio className={`w-4 h-4 mt-0.5 text-${accentColor}-600 dark:text-${accentColor}-400 shrink-0 animate-pulse`} />
            <p
              dir={lang === 'ur' ? 'rtl' : 'ltr'}
              className={`text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed flex-1 ${
                lang === 'ur' ? 'text-right leading-loose' : ''
              }`}
            >
              {activeSentenceText}
            </p>
          </div>
        </div>
      )}

      {/* Settings drawer */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {lang === 'ur' ? 'اردو آواز منتخب کریں' : 'Select Voice Model'}
              </span>
            </div>
            <button
              onClick={handleToggleMute}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {availableModels.map((model) => {
              const isSelected = model.id === selectedModelId;
              return (
                <button
                  key={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? `border-${accentColor}-500 bg-${accentColor}-50/60 dark:bg-${accentColor}-950/40 ring-2 ring-${accentColor}-500/20 shadow-xs`
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-neutral-950 dark:text-white">
                        {model.nativeName}
                      </span>
                      {isSelected && (
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white bg-${accentColor}-600`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? `bg-${accentColor}-100 dark:bg-${accentColor}-900/60 text-${accentColor}-800 dark:text-${accentColor}-300`
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {model.tag}
                    </span>
                    <p
                      dir={lang === 'ur' ? 'rtl' : 'ltr'}
                      className={`text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed ${
                        lang === 'ur' ? 'text-right text-xs' : ''
                      }`}
                    >
                      {model.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ElevenLabs key */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Key className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <input
                type="password"
                placeholder="ElevenLabs API Key (optional — enables premium neural voices)"
                value={elevenLabsKey}
                onChange={(e) => {
                  const val = e.target.value;
                  setElevenLabsKey(val);
                  try {
                    val.trim()
                      ? localStorage.setItem('pulse_el_key', val.trim())
                      : localStorage.removeItem('pulse_el_key');
                  } catch {}
                }}
                className="w-full py-1.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
            <span className="text-[10px] text-neutral-400">
              {voicesReady
                ? `${voicesRef.current.filter((v) => v.lang.startsWith('ur')).length} Urdu · ${voicesRef.current.filter((v) => v.lang.startsWith('en')).length} English voices loaded`
                : 'Loading voices...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
