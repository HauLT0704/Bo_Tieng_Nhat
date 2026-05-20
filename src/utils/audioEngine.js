/**
 * JapaneseAudioEngine - Multi-source Japanese TTS with intelligent fallback
 * 
 * Priority order:
 * 1. ResponsiveVoice.org API (natural Japanese female voice)
 * 2. Google Translate TTS (highest quality but may rate-limit)
 * 3. System SpeechSynthesis (offline fallback)
 */

// ─── Audio Cache ────────────────────────────────────────────────
const audioCache = new Map();
const MAX_CACHE_SIZE = 200;

function getCacheKey(text, slow) {
  return `${text}_${slow ? 'slow' : 'normal'}`;
}

function addToCache(key, audioBlob) {
  if (audioCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry
    const firstKey = audioCache.keys().next().value;
    const oldUrl = audioCache.get(firstKey);
    if (oldUrl && typeof oldUrl === 'string' && oldUrl.startsWith('blob:')) {
      URL.revokeObjectURL(oldUrl);
    }
    audioCache.delete(firstKey);
  }
  audioCache.set(key, audioBlob);
}

// ─── Active Audio Tracking ──────────────────────────────────────
let activeAudio = null;
let activeUtterance = null;

function stopAllAudio() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch (e) {}
    activeAudio = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
}

// ─── Event Callbacks ────────────────────────────────────────────
let onPlayStart = null;
let onPlayEnd = null;

export function setAudioCallbacks(callbacks) {
  if (callbacks.onPlayStart) onPlayStart = callbacks.onPlayStart;
  if (callbacks.onPlayEnd) onPlayEnd = callbacks.onPlayEnd;
}

function notifyStart() {
  if (onPlayStart) onPlayStart();
}

function notifyEnd() {
  if (onPlayEnd) onPlayEnd();
}

// ─── Source 1: ResponsiveVoice-style endpoint ───────────────────
function playResponsiveVoice(text, slow = false) {
  return new Promise((resolve, reject) => {
    try {
      const speed = slow ? 0.35 : 0.5;
      const url = `https://responsivevoice.org/responsivevoice/getvoice.php?t=${encodeURIComponent(text)}&tl=ja&sv=&vn=&pitch=0.5&rate=${speed}&vol=1&gender=female`;
      
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      
      // Set a timeout - if it doesn't load in 4 seconds, reject
      const timeout = setTimeout(() => {
        audio.removeAttribute('src');
        reject(new Error('ResponsiveVoice timeout'));
      }, 4000);

      audio.addEventListener('canplaythrough', () => {
        clearTimeout(timeout);
        activeAudio = audio;
        audio.volume = 1.0;
        audio.playbackRate = slow ? 0.85 : 1.0;
        
        audio.addEventListener('ended', () => {
          activeAudio = null;
          notifyEnd();
        });
        audio.addEventListener('error', () => {
          activeAudio = null;
          notifyEnd();
        });

        notifyStart();
        audio.play()
          .then(() => resolve(true))
          .catch((err) => {
            notifyEnd();
            reject(err);
          });
      }, { once: true });

      audio.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error('ResponsiveVoice load error'));
      }, { once: true });

      audio.src = url;
      audio.load();
    } catch (e) {
      reject(e);
    }
  });
}

// ─── Source 2: Google Translate TTS ─────────────────────────────
function playGoogleTTS(text, slow = false) {
  return new Promise((resolve, reject) => {
    try {
      // Try multiple Google TTS endpoints
      const endpoints = [
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=${encodeURIComponent(text)}`,
        `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=ja&client=gtx&q=${encodeURIComponent(text)}`,
      ];

      let attemptIndex = 0;

      const tryEndpoint = () => {
        if (attemptIndex >= endpoints.length) {
          reject(new Error('All Google TTS endpoints failed'));
          return;
        }

        const url = endpoints[attemptIndex];
        const audio = new Audio();

        const timeout = setTimeout(() => {
          audio.removeAttribute('src');
          attemptIndex++;
          tryEndpoint();
        }, 3500);

        audio.addEventListener('canplaythrough', () => {
          clearTimeout(timeout);
          activeAudio = audio;
          audio.volume = 1.0;
          audio.playbackRate = slow ? 0.7 : 1.0;
          
          audio.addEventListener('ended', () => {
            activeAudio = null;
            notifyEnd();
          });
          audio.addEventListener('error', () => {
            activeAudio = null;
            notifyEnd();
          });

          notifyStart();
          audio.play()
            .then(() => resolve(true))
            .catch((err) => {
              notifyEnd();
              attemptIndex++;
              tryEndpoint();
            });
        }, { once: true });

        audio.addEventListener('error', () => {
          clearTimeout(timeout);
          attemptIndex++;
          tryEndpoint();
        }, { once: true });

        audio.src = url;
        audio.load();
      };

      tryEndpoint();
    } catch (e) {
      reject(e);
    }
  });
}

// ─── Source 3: System SpeechSynthesis (Offline) ─────────────────
function playSystemSpeech(text, slow = false, voiceSettings = {}) {
  return new Promise((resolve, reject) => {
    try {
      if (!window.speechSynthesis) {
        reject(new Error('SpeechSynthesis not available'));
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';

      // Find best Japanese voice
      const voices = window.speechSynthesis.getVoices();
      const jaVoices = voices.filter(v => v.lang.startsWith('ja') || v.lang.includes('JP'));

      if (jaVoices.length > 0) {
        const { voiceProfile = 'standard', selectedVoiceName = '' } = voiceSettings;
        let selectedVoice = null;

        if (voiceProfile === 'male') {
          selectedVoice = jaVoices.find(v =>
            v.name.toLowerCase().includes('ichiro') ||
            v.name.toLowerCase().includes('keita') ||
            v.name.toLowerCase().includes('male')
          );
        } else if (voiceProfile === 'female') {
          selectedVoice = jaVoices.find(v =>
            v.name.toLowerCase().includes('ayumi') ||
            v.name.toLowerCase().includes('haruka') ||
            v.name.toLowerCase().includes('nanami') ||
            v.name.toLowerCase().includes('female')
          );
        }

        if (!selectedVoice && selectedVoiceName) {
          selectedVoice = jaVoices.find(v => v.name === selectedVoiceName);
        }
        if (!selectedVoice) {
          selectedVoice = jaVoices[0];
        }

        utterance.voice = selectedVoice;
      }

      // Set pitch and rate based on voice profile
      const { voiceProfile = 'standard' } = voiceSettings;
      utterance.volume = 1.0;

      if (voiceProfile === 'male') {
        utterance.pitch = 0.60;
        utterance.rate = slow ? 0.50 : 0.80;
      } else if (voiceProfile === 'female') {
        const hasRealFemale = jaVoices?.some(v =>
          v.name.toLowerCase().includes('ayumi') ||
          v.name.toLowerCase().includes('haruka') ||
          v.name.toLowerCase().includes('nanami') ||
          v.name.toLowerCase().includes('female')
        );
        utterance.pitch = hasRealFemale ? 1.0 : 1.25;
        utterance.rate = slow ? 0.62 : 1.0;
      } else if (voiceProfile === 'anime') {
        utterance.pitch = 1.5;
        utterance.rate = slow ? 0.65 : 1.1;
      } else {
        utterance.pitch = 1.0;
        utterance.rate = slow ? 0.6 : 0.95;
      }

      activeUtterance = utterance;

      utterance.onstart = () => {
        notifyStart();
      };
      utterance.onend = () => {
        activeUtterance = null;
        notifyEnd();
        resolve(true);
      };
      utterance.onerror = (e) => {
        activeUtterance = null;
        notifyEnd();
        // Don't reject on 'interrupted' errors (happen when cancel() is called)
        if (e.error === 'interrupted' || e.error === 'canceled') {
          resolve(true);
        } else {
          reject(e);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      reject(e);
    }
  });
}

// ─── Main Speak Function ────────────────────────────────────────

/**
 * Speak Japanese text with multi-source fallback
 * @param {string} text - Japanese text to speak
 * @param {object} options - Options
 * @param {boolean} options.slow - Speak slowly
 * @param {string} options.engine - 'cloud' or 'system'
 * @param {string} options.voiceProfile - 'standard', 'male', 'female', 'anime'
 * @param {string} options.selectedVoiceName - System voice name
 */
export async function speak(text, options = {}) {
  const {
    slow = false,
    engine = 'cloud',
    voiceProfile = 'standard',
    selectedVoiceName = ''
  } = options;

  // Stop any currently playing audio
  stopAllAudio();

  if (!text || text.trim() === '') return;

  // If system engine is explicitly selected, use it directly
  if (engine === 'system') {
    try {
      await playSystemSpeech(text, slow, { voiceProfile, selectedVoiceName });
    } catch (e) {
      console.warn('[AudioEngine] System speech failed:', e);
      notifyEnd();
    }
    return;
  }

  // Cloud engine: try sources in priority order with fallback
  // Source 1: ResponsiveVoice
  try {
    await playResponsiveVoice(text, slow);
    return;
  } catch (e) {
    console.warn('[AudioEngine] ResponsiveVoice failed, trying Google TTS...', e.message);
  }

  // Source 2: Google TTS
  try {
    await playGoogleTTS(text, slow);
    return;
  } catch (e) {
    console.warn('[AudioEngine] Google TTS failed, falling back to system...', e.message);
  }

  // Source 3: System fallback
  try {
    await playSystemSpeech(text, slow, { voiceProfile, selectedVoiceName });
  } catch (e) {
    console.warn('[AudioEngine] All sources failed:', e);
    notifyEnd();
  }
}

/**
 * Quick speak for testing voices in sidebar
 */
export function speakTest(engine, voiceProfile, selectedVoiceName, availableVoices) {
  const testPhrase = 'こんにちは';
  speak(testPhrase, {
    slow: false,
    engine,
    voiceProfile,
    selectedVoiceName
  });
}

/**
 * Stop all currently playing audio
 */
export { stopAllAudio };

/**
 * Preload common kana audio (call once on app init)
 * This warms the cache for faster first-play
 */
export function preloadCommonKana() {
  // Preload vowels in background after a delay
  const commonKana = ['あ', 'い', 'う', 'え', 'お'];
  let index = 0;

  const preloadNext = () => {
    if (index >= commonKana.length) return;
    const kana = commonKana[index];
    const key = getCacheKey(kana, false);
    
    if (!audioCache.has(key)) {
      // Just create the URL so the browser can cache the DNS/connection
      const url = `https://responsivevoice.org/responsivevoice/getvoice.php?t=${encodeURIComponent(kana)}&tl=ja&sv=&vn=&pitch=0.5&rate=0.5&vol=1&gender=female`;
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'audio';
      document.head.appendChild(link);
    }
    
    index++;
    setTimeout(preloadNext, 800);
  };

  // Start preloading after 3 seconds
  setTimeout(preloadNext, 3000);
}
