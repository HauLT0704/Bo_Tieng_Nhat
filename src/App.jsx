import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Sparkles, BookOpen, Flame, Award, BookCheck } from 'lucide-react';
import { initStorage, saveStorage } from './utils/srsEngine';
import { speak, setAudioCallbacks, stopAllAudio, preloadCommonKana } from './utils/audioEngine';
import {
  getTitleForLevel,
  checkAchievements,
  processStreakWithLives,
  checkDailyReward,
} from './utils/gamificationEngine';

// Auth
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

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

// Auth Pages
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';

// Profile & Gamification
import { UserProfile } from './components/profile/UserProfile';
import { Leaderboard } from './components/leaderboard/Leaderboard';
import { AchievementPopup } from './components/gamification/AchievementPopup';
import { LevelUpModal } from './components/gamification/LevelUpModal';

function AppContent() {
  const { currentUser, userProfile, loading: authLoading, syncProgress, updateProfile } = useAuth();

  const [currentMode, setCurrentMode] = useState('chart');
  const [userStats, setUserStats] = useState(null);
  const [theme, setTheme] = useState('kyoto');
  const [sakuraEnabled, setSakuraEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth page state
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'register'

  // Transitions & Voices
  const [preloadedChar, setPreloadedChar] = useState(null);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [voiceProfile, setVoiceProfile] = useState('standard');
  const [voiceEngine, setVoiceEngine] = useState('cloud');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Gamification UI state
  const [achievementQueue, setAchievementQueue] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(null); // level number or null

  // Initialize storage
  useEffect(() => {
    const stats = initStorage();
    // Process streak with lives system
    const processedStats = processStreakWithLives(stats);
    setUserStats(processedStats);
    if (JSON.stringify(stats) !== JSON.stringify(processedStats)) {
      saveStorage(processedStats);
    }

    // Load saved preferences
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

  // Check achievements whenever userStats changes
  useEffect(() => {
    if (!userStats || !currentUser) return;

    const existingAchievements = userStats.achievements || [];
    const newAchievements = checkAchievements(userStats, existingAchievements);

    if (newAchievements.length > 0) {
      setAchievementQueue(prev => [...prev, ...newAchievements]);

      // Update achievements in state
      const updatedAchievements = [...existingAchievements, ...newAchievements.map(a => a.id)];
      const newState = { ...userStats, achievements: updatedAchievements };
      setUserStats(newState);
      saveStorage(newState);
    }
  }, [userStats?.level, userStats?.streak, Object.keys(userStats?.srsData || {}).length]);

  // Sync progress to Firestore when userStats changes (debounced)
  useEffect(() => {
    if (!userStats || !currentUser) return;

    const timer = setTimeout(() => {
      syncProgress(userStats);
    }, 2000);

    return () => clearTimeout(timer);
  }, [userStats, currentUser]);

  // Update title when level changes
  useEffect(() => {
    if (!userStats) return;
    const titleInfo = getTitleForLevel(userStats.level);
    if (titleInfo.title !== userStats.title) {
      const newState = { ...userStats, title: titleInfo.title, titleIcon: titleInfo.icon };
      setUserStats(newState);
      saveStorage(newState);
    }
  }, [userStats?.level]);

  // Enhanced setUserStats that checks for level-up
  const handleSetUserStats = useCallback((updater) => {
    setUserStats(prev => {
      const newStats = typeof updater === 'function' ? updater(prev) : updater;
      
      // Check for level up
      if (prev && newStats.level > prev.level) {
        setShowLevelUp(newStats.level);
      }

      // Check daily reward
      const reward = checkDailyReward(newStats.streak);
      if (reward && !prev._rewardedStreak?.includes(newStats.streak)) {
        newStats.xp = (newStats.xp || 0) + reward.exp;
        newStats._rewardedStreak = [...(prev._rewardedStreak || []), newStats.streak];
      }

      return newStats;
    });
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

  // Setup audio engine callbacks
  useEffect(() => {
    setAudioCallbacks({
      onPlayStart: () => setIsAudioPlaying(true),
      onPlayEnd: () => setIsAudioPlaying(false),
    });
    preloadCommonKana();
  }, []);

  const playVoiceAudio = useCallback((text, slow = false) => {
    speak(text, {
      slow,
      engine: voiceEngine,
      voiceProfile,
      selectedVoiceName,
    });
  }, [voiceEngine, voiceProfile, selectedVoiceName]);

  // Theme management
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
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

  useEffect(() => {
    localStorage.setItem('nihongohub_v1_sakura', String(sakuraEnabled));
  }, [sakuraEnabled]);

  useEffect(() => {
    localStorage.setItem('nihongohub_v1_sound', String(soundEnabled));
  }, [soundEnabled]);

  // ===== AUTH GATE =====
  // Show login/register if not authenticated
  const [explicitAuthRequired, setExplicitAuthRequired] = useState(false);
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF6EE] text-[#C92A2A]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C92A2A] mx-auto"></div>
          <p className="font-extrabold text-sm tracking-wider uppercase">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  const totalCharactersStudied = userStats ? Object.keys(userStats.srsData || {}).length : 0;
  const GUEST_WORD_LIMIT = 15;
  const requireLoginForProgress = totalCharactersStudied >= GUEST_WORD_LIMIT;
  const requireLoginForFeature = currentMode === 'profile' || currentMode === 'leaderboard';
  
  const shouldShowAuth = !currentUser && (explicitAuthRequired || requireLoginForProgress || requireLoginForFeature);

  if (shouldShowAuth) {
    const isForced = requireLoginForProgress;
    
    const handleCancel = () => {
      setExplicitAuthRequired(false);
      if (requireLoginForFeature) {
        setCurrentMode('chart');
      }
    };

    return authPage === 'register' ? (
      <RegisterPage 
        onSwitchToLogin={() => setAuthPage('login')} 
        onCancel={isForced ? undefined : handleCancel}
      />
    ) : (
      <LoginPage 
        onSwitchToRegister={() => setAuthPage('register')} 
        onCancel={isForced ? undefined : handleCancel}
      />
    );
  }

  // ===== MAIN APP (AUTHENTICATED) =====
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

  const totalCharactersStudied = Object.keys(userStats.srsData).length;
  const accuracy = userStats.totalQuestionsAnswered > 0
    ? Math.round((userStats.correctAnswersCount / userStats.totalQuestionsAnswered) * 100)
    : 100;

  const modeHeaderNames = {
    chart: 'Bảng Chữ Cái Nhật Bản',
    flashcard: 'Luyện Nhớ Flashcards',
    quiz: 'Trắc Nghiệm Tính Giờ',
    typing: 'Luyện Gõ Phiên Âm',
    listening: 'Luyện Nghe Trắc Nghiệm',
    tracing: 'Tập Viết Nét Chữ Chuẩn',
    dictionary: 'Tra Từ & Sổ Tay Từ Vựng',
    profile: 'Hồ Sơ Cá Nhân',
    leaderboard: 'Bảng Xếp Hạng',
  };

  const titleInfo = getTitleForLevel(userStats.level || 1);

  return (
    <div className="min-h-screen relative flex">
      {/* SAKURA BACKGROUND */}
      {sakuraEnabled && <SakuraBackground theme={theme} />}

      {/* SIDEBAR */}
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
        userProfile={userProfile}
        onLoginClick={() => setExplicitAuthRequired(true)}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-h-screen lg:pl-80 z-10 transition-all duration-300">

        {/* Header */}
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
                Xin chào, {userProfile?.displayName || 'bạn'}! {titleInfo.icon} {titleInfo.title}
              </p>
            </div>
          </div>

          {/* Header Stats */}
          <div className="flex items-center gap-3 text-xs font-semibold select-none">
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

            {/* Level badge */}
            <div className="hidden sm:flex items-center gap-1 bg-amber-500/10 text-amber-600 py-1.5 px-3 rounded-full border border-amber-500/20">
              <Award size={14} />
              <strong className="font-extrabold">Lv.{userStats.level}</strong>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1 bg-[var(--bg-accent)]/10 text-[var(--bg-accent)] py-1.5 px-3 rounded-full border border-[var(--bg-accent)]/10">
              <Flame size={14} className="fill-[var(--bg-accent)] text-[var(--bg-accent)] animate-pulse" />
              <strong className="font-extrabold">{userStats.streak} ngày</strong>
            </div>

            {/* Avatar mini */}
            {currentUser ? (
              <button
                onClick={() => setCurrentMode('profile')}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--border-color)] hover:border-[var(--bg-accent)] transition-all cursor-pointer flex-shrink-0"
              >
                {userProfile?.avatar ? (
                  <img src={userProfile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xs text-white font-black">
                    {(userProfile?.displayName || 'U')[0].toUpperCase()}
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={() => setExplicitAuthRequired(true)}
                className="text-xs font-bold bg-[var(--bg-accent)] text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Đăng Nhập
              </button>
            )}
          </div>
        </header>

        {/* Mode Router */}
        <section className="flex-1 p-4 sm:p-6 overflow-y-auto z-10 relative">
          {currentMode === 'chart' && (
            <KanaChart
              userStats={userStats}
              setUserStats={handleSetUserStats}
              currentMode={currentMode}
              setCurrentMode={setCurrentMode}
              setPreloadedChar={setPreloadedChar}
              playAudio={playVoiceAudio}
            />
          )}
          {currentMode === 'flashcard' && (
            <Flashcards
              userStats={userStats}
              setUserStats={handleSetUserStats}
              playAudio={playVoiceAudio}
            />
          )}
          {currentMode === 'quiz' && (
            <QuizMCQ
              userStats={userStats}
              setUserStats={handleSetUserStats}
              soundEnabled={soundEnabled}
              playAudio={playVoiceAudio}
            />
          )}
          {currentMode === 'typing' && (
            <TypingPractice
              userStats={userStats}
              setUserStats={handleSetUserStats}
              soundEnabled={soundEnabled}
              playAudio={playVoiceAudio}
            />
          )}
          {currentMode === 'listening' && (
            <ListeningTrainer
              userStats={userStats}
              setUserStats={handleSetUserStats}
              soundEnabled={soundEnabled}
              playAudio={playVoiceAudio}
            />
          )}
          {currentMode === 'tracing' && (
            <TracingCanvas
              userStats={userStats}
              setUserStats={handleSetUserStats}
              soundEnabled={soundEnabled}
              preloadedChar={preloadedChar}
              setPreloadedChar={setPreloadedChar}
              playAudio={playVoiceAudio}
            />
          )}
          {currentMode === 'dictionary' && (
            <Dictionary
              userStats={userStats}
              setUserStats={handleSetUserStats}
              playAudio={playVoiceAudio}
            />
          )}
          {currentMode === 'profile' && (
            <UserProfile userStats={userStats} />
          )}
          {currentMode === 'leaderboard' && (
            <Leaderboard />
          )}
        </section>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-[var(--border-color)] text-center text-[10px] font-bold text-[var(--text-secondary)] opacity-70 bg-[var(--bg-secondary)]/10">
          © {new Date().getFullYear()} Bơ Tiếng Nhật. Cùng nhau học tập mỗi ngày.
        </footer>
      </main>

      {/* === GAMIFICATION OVERLAYS === */}

      {/* Achievement Popup Queue */}
      {achievementQueue.length > 0 && (
        <AchievementPopup
          achievement={achievementQueue[0]}
          onClose={() => setAchievementQueue(prev => prev.slice(1))}
        />
      )}

      {/* Level Up Modal */}
      {showLevelUp && (
        <LevelUpModal
          newLevel={showLevelUp}
          onClose={() => setShowLevelUp(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
