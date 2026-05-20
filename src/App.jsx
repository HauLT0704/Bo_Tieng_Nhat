import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Sparkles, BookOpen, Flame, Award, BookCheck, HelpCircle } from 'lucide-react';
import { initStorage, saveStorage } from './utils/srsEngine';
import { speak, setAudioCallbacks, speakTest, stopAllAudio, preloadCommonKana } from './utils/audioEngine';

// Components
import { Sidebar } from './components/Sidebar';
import { SakuraBackground } from './components/SakuraBackground';
import { KanaChart } from './components/KanaChart';
import { Flashcards } from './components/Flashcards';
import { QuizMCQ } from './components/QuizMCQ';
import { TypingPractice } from './components/TypingPractice';
import { ListeningTrainer } from './components/ListeningTrainer';
import { TracingCanvas } from './components/TracingCanvas';
import { Dictionary } from './components/Dictionary';

function App() {
  const [currentMode, setCurrentMode] = useState('chart'); // 'chart', 'flashcard', 'quiz', 'typing', 'listening', 'tracing'
  const [userStats, setUserStats] = useState(null);
  const [theme, setTheme] = useState('kyoto'); // 'kyoto', 'tokyo', 'anime'
  const [sakuraEnabled, setSakuraEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Transitions & Voices
  const [preloadedChar, setPreloadedChar] = useState(null);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [voiceProfile, setVoiceProfile] = useState('standard'); // 'standard', 'male', 'female', 'anime'
  const [voiceEngine, setVoiceEngine] = useState('cloud'); // 'cloud', 'system'
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Initialize storage
  useEffect(() => {
    const stats = initStorage();
    setUserStats(stats);
    
    // Load saved preferences if any
    const savedTheme = localStorage.getItem('nihongohub_v1_theme');
    const savedSakura = localStorage.getItem('nihongohub_v1_sakura');
    const savedSound = localStorage.getItem('nihongohub_v1_sound');
    const savedVoiceProfile = localStorage.getItem('nihongohub_v1_voice_profile');
    const savedVoiceEngine = localStorage.getItem('nihongohub_v1_voice_engine');
    
    if (savedTheme) setTheme(savedTheme);
    if (savedSakura) setSakuraEnabled(savedSakura === 'true');
    if (savedSound) setSoundEnabled(savedSound === 'true');
    if (savedVoiceProfile) setVoiceProfile(savedVoiceProfile);
    if (savedVoiceEngine) setVoiceEngine(savedVoiceEngine);
  }, []);

  // Speech voice loading hook
  useEffect(() => {
    const loadVoices = () => {
      if (!window.speechSynthesis) return;
      const voices = window.speechSynthesis.getVoices();
      const jaVoices = voices.filter(v => v.lang.startsWith('ja') || v.lang.includes('JP'));
      setAvailableVoices(jaVoices);
      
      const savedVoice = localStorage.getItem('nihongohub_v1_voice');
      if (savedVoice && jaVoices.some(v => v.name === savedVoice)) {
        setSelectedVoiceName(savedVoice);
      } else {
        // Fallback or prefer Microsoft Ichiro or another male Japanese voice
        const defaultMale = jaVoices.find(v => 
          v.name.toLowerCase().includes('ichiro') || 
          v.name.toLowerCase().includes('keita') || 
          v.name.toLowerCase().includes('male')
        );
        if (defaultMale) {
          setSelectedVoiceName(defaultMale.name);
          localStorage.setItem('nihongohub_v1_voice', defaultMale.name);
        } else if (jaVoices.length > 0) {
          setSelectedVoiceName(jaVoices[0].name);
          localStorage.setItem('nihongohub_v1_voice', jaVoices[0].name);
        }
      }
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Setup audio engine callbacks for UI animation
  useEffect(() => {
    setAudioCallbacks({
      onPlayStart: () => setIsAudioPlaying(true),
      onPlayEnd: () => setIsAudioPlaying(false),
    });
    // Preload common kana for faster first-play
    preloadCommonKana();
  }, []);

  // Unified audio playback using the new audioEngine
  const playVoiceAudio = useCallback((text, slow = false) => {
    speak(text, {
      slow,
      engine: voiceEngine,
      voiceProfile,
      selectedVoiceName,
    });
  }, [voiceEngine, voiceProfile, selectedVoiceName]);

  // Update root container class based on active theme
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    // Reset classes
    root.className = '';
    
    if (theme === 'tokyo') {
      root.classList.add('theme-tokyo');
      document.body.style.backgroundColor = '#0A0714';
    } else if (theme === 'anime') {
      root.classList.add('theme-anime');
      document.body.style.backgroundColor = '#FFF0F5';
    } else {
      document.body.style.backgroundColor = '#FAF6EE';
    }

    localStorage.setItem('nihongohub_v1_theme', theme);
  }, [theme]);

  // Persist settings toggles
  useEffect(() => {
    localStorage.setItem('nihongohub_v1_sakura', String(sakuraEnabled));
  }, [sakuraEnabled]);

  useEffect(() => {
    localStorage.setItem('nihongohub_v1_sound', String(soundEnabled));
  }, [soundEnabled]);

  if (!userStats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF6EE] text-[#C92A2A]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C92A2A] mx-auto"></div>
          <p className="font-extrabold text-sm tracking-wider uppercase">Khởi tạo dữ liệu học...</p>
        </div>
      </div>
    );
  }

  // Calculate learning rate stats
  const totalCharactersStudied = Object.keys(userStats.srsData).length;
  const accuracy = userStats.totalQuestionsAnswered > 0 
    ? Math.round((userStats.correctAnswersCount / userStats.totalQuestionsAnswered) * 100)
    : 100;

  // Mode header title translations
  const modeHeaderNames = {
    chart: 'Bảng Chữ Cái Nhật Bản',
    flashcard: 'Luyện Nhớ Flashcards',
    quiz: 'Trắc Nghiệm Tính Giờ',
    typing: 'Luyện Gõ Phiên Âm',
    listening: 'Luyện Nghe Trắc Nghiệm',
    tracing: 'Tập Viết Nét Chữ Chuẩn',
    dictionary: 'Tra Từ & Sổ Tay Từ Vựng'
  };

  return (
    <div className="min-h-screen relative flex">
      {/* 1. GPU SAKURA BLOSSOMS FALL BACKGROUND */}
      {sakuraEnabled && <SakuraBackground theme={theme} />}

      {/* 2. RESPONSIVE SIDEBAR NAVIGATION */}
      <Sidebar 
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        userStats={userStats}
        theme={theme}
        setTheme={setTheme}
        sakuraEnabled={sakuraEnabled}
        setSakuraEnabled={setSakuraEnabled}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedVoiceName={selectedVoiceName}
        setSelectedVoiceName={setSelectedVoiceName}
        availableVoices={availableVoices}
        voiceProfile={voiceProfile}
        setVoiceProfile={setVoiceProfile}
        voiceEngine={voiceEngine}
        setVoiceEngine={setVoiceEngine}
        isAudioPlaying={isAudioPlaying}
        playAudio={playVoiceAudio}
      />

      {/* 3. MAIN CONTENT BOARD WORKSPACE */}
      <main className="flex-1 flex flex-col min-h-screen lg:pl-80 z-10 transition-all duration-300">
        
        {/* Top Header navbar banner */}
        <header className="p-4 sm:p-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-all shadow-sm"
            >
              <Menu size={20} />
            </button>
            
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
                {modeHeaderNames[currentMode]}
              </h2>
              <p className="text-[10px] text-[var(--text-secondary)] opacity-80 font-bold hidden sm:block">
                Chào mừng bạn đến với Bơ Tiếng Nhật!
              </p>
            </div>
          </div>

          {/* Quick Header Stats */}
          <div className="flex items-center gap-4 text-xs font-semibold select-none">
            <div className="hidden md:flex gap-4">
              <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <BookCheck size={14} className="text-[var(--bg-accent)]" />
                <span>Đã thuộc: <strong className="text-[var(--text-primary)]">{totalCharactersStudied}</strong> âm</span>
              </div>
              <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <Sparkles size={14} className="text-amber-500" />
                <span>Độ chính xác: <strong className="text-[var(--text-primary)]">{accuracy}%</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-[var(--bg-accent)]/10 text-[var(--bg-accent)] py-1.5 px-3 rounded-full border border-[var(--bg-accent)]/10">
              <Flame size={14} className="fill-[var(--bg-accent)] text-[var(--bg-accent)] animate-pulse" />
              <strong className="font-extrabold">{userStats.streak} ngày</strong>
            </div>
          </div>
        </header>

        {/* Dynamic Mode Router Container */}
        <section className="flex-1 p-4 sm:p-6 overflow-y-auto z-10 relative">
          
          {currentMode === 'chart' && (
            <KanaChart 
              userStats={userStats} 
              setUserStats={setUserStats}
              currentMode={currentMode}
              setCurrentMode={setCurrentMode}
              setPreloadedChar={setPreloadedChar}
              playAudio={playVoiceAudio}
            />
          )}

          {currentMode === 'flashcard' && (
            <Flashcards 
              userStats={userStats} 
              setUserStats={setUserStats} 
              playAudio={playVoiceAudio}
            />
          )}

          {currentMode === 'quiz' && (
            <QuizMCQ 
              userStats={userStats} 
              setUserStats={setUserStats} 
              soundEnabled={soundEnabled}
              playAudio={playVoiceAudio}
            />
          )}

          {currentMode === 'typing' && (
            <TypingPractice 
              userStats={userStats} 
              setUserStats={setUserStats} 
              soundEnabled={soundEnabled}
              playAudio={playVoiceAudio}
            />
          )}

          {currentMode === 'listening' && (
            <ListeningTrainer 
              userStats={userStats} 
              setUserStats={setUserStats} 
              soundEnabled={soundEnabled}
              playAudio={playVoiceAudio}
            />
          )}

          {currentMode === 'tracing' && (
            <TracingCanvas 
              userStats={userStats} 
              setUserStats={setUserStats} 
              soundEnabled={soundEnabled}
              preloadedChar={preloadedChar}
              setPreloadedChar={setPreloadedChar}
              playAudio={playVoiceAudio}
            />
          )}

          {currentMode === 'dictionary' && (
            <Dictionary 
              userStats={userStats} 
              setUserStats={setUserStats} 
              playAudio={playVoiceAudio}
            />
          )}

        </section>

        {/* Global Footer */}
        <footer className="py-4 px-6 border-t border-[var(--border-color)] text-center text-[10px] font-bold text-[var(--text-secondary)] opacity-70 bg-[var(--bg-secondary)]/10">
          © {new Date().getFullYear()} Bơ Tiếng Nhật. Cùng nhau học tập mỗi ngày.
        </footer>
      </main>
    </div>
  );
}

export default App;
