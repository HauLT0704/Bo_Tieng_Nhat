import React from 'react';
import { 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Keyboard, 
  Volume2, 
  Edit3, 
  Sun, 
  Moon, 
  Heart, 
  VolumeX, 
  Volume,
  Award,
  Flame,
  Menu,
  X,
  Search,
  User,
  Trophy,
  LogOut
} from 'lucide-react';
import { getRequiredExp, getLevelProgress, getRemainingExpInLevel, getTitleForLevel } from '../utils/gamificationEngine';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = ({ 
  currentMode, 
  setCurrentMode, 
  userStats, 
  theme, 
  setTheme, 
  sakuraEnabled, 
  setSakuraEnabled, 
  soundEnabled, 
  setSoundEnabled,
  sidebarOpen,
  setSidebarOpen,
  selectedVoiceName,
  setSelectedVoiceName,
  availableVoices,
  voiceProfile,
  setVoiceProfile,
  voiceEngine,
  setVoiceEngine,
  isAudioPlaying,
  playAudio,
  userProfile,
  onLoginClick
}) => {
  const { logout } = useAuth();
  const modes = [
    { id: 'chart', label: 'Bảng Chữ Cái', icon: BookOpen, desc: 'Học & tra cứu âm tiết' },
    { id: 'flashcard', label: 'Thẻ Flashcard', icon: Layers, desc: 'Luyện trí nhớ phản xạ' },
    { id: 'quiz', label: 'Trắc Nghiệm', icon: HelpCircle, desc: 'Thách thức tính điểm & thời gian' },
    { id: 'typing', label: 'Luyện Gõ Từ', icon: Keyboard, desc: 'Viết Romaji của chữ cái' },
    { id: 'listening', label: 'Luyện Nghe', icon: Volume2, desc: 'Nghe phát âm chọn mặt chữ' },
    { id: 'tracing', label: 'Tập Viết Chữ', icon: Edit3, desc: 'Vẽ nét chữ theo mẫu chuẩn' },
    { id: 'dictionary', label: 'Tra Từ & Thẻ', icon: Search, desc: 'Dịch Việt-Nhật & thêm thẻ' }
  ];

  const accountModes = [
    { id: 'profile', label: 'Hồ Sơ', icon: User, desc: 'Xem & chỉnh sửa thông tin' },
    { id: 'leaderboard', label: 'Bảng Xếp Hạng', icon: Trophy, desc: 'Xếp hạng người học tuần' },
  ];

  const nextLevelXp = getRequiredExp(userStats.level);
  const progressPercentage = getLevelProgress(userStats.xp, userStats.level);
  const accumulatedXpInLevel = getRemainingExpInLevel(userStats.xp, userStats.level);
  const titleInfo = getTitleForLevel(userStats.level);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-80 max-w-[90vw] z-50
        bg-[var(--bg-secondary)] border-r border-[var(--border-color)]
        flex flex-col h-full transform transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header with User Info */}
        <div className="p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/30 floating-element">
                🥑
              </div>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight text-[var(--text-primary)]">
                  Bơ Tiếng <span className="text-emerald-500">Nhật</span>
                </h1>
                <p className="text-[10px] tracking-widest uppercase opacity-75 font-semibold text-[var(--text-secondary)]">アボカド日本語</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Mini Profile */}
          {userProfile ? (
            <button
              onClick={() => { setCurrentMode('profile'); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-primary)]/60 border border-[var(--border-color)] hover:border-[var(--bg-accent)]/30 transition-all group"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[var(--border-color)] group-hover:border-[var(--bg-accent)] transition-colors flex-shrink-0">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xs text-white font-black">
                    {(userProfile.displayName || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-bold text-[var(--text-primary)] truncate">{userProfile.displayName}</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold" style={{ color: titleInfo.color }}>{titleInfo.icon} {titleInfo.title}</span>
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => { onLoginClick(); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-primary)]/60 border border-[var(--border-color)] hover:border-[var(--bg-accent)]/30 transition-all group"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[var(--border-color)] group-hover:border-[var(--bg-accent)] transition-colors flex-shrink-0 flex items-center justify-center bg-[var(--bg-secondary)]">
                <User size={16} className="text-[var(--text-secondary)]" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-bold text-[var(--text-primary)] truncate">Đăng nhập / Đăng ký</div>
                <div className="text-[9px] font-bold text-[var(--text-secondary)] mt-0.5">Để lưu tiến độ học tập</div>
              </div>
            </button>
          )}
        </div>

        {/* Gamified Stats Panel */}
        <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/50">
          <div className="flex items-center justify-between mb-4">
            {/* Level Counter */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                <Award size={18} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Cấp độ</div>
                <div className="text-sm font-black text-[var(--text-primary)]">Level {userStats.level}</div>
              </div>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500">
              <Flame size={16} className={userStats.streak > 0 ? "animate-pulse" : ""} />
              <span className="font-black text-sm">{userStats.streak} ngày</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5 text-[var(--text-secondary)]">
              <span>Tiến độ Level</span>
              <span>{accumulatedXpInLevel} / {nextLevelXp} XP</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[var(--border-color)] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--bg-accent)] to-amber-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content Area (Modes + Settings) */}
        <div className="flex-1 overflow-y-auto pb-4">
          
          {/* Nav Modes Menu */}
          <nav className="px-4 py-4 space-y-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-3 mb-2">
            Chế Độ Luyện Tập
          </div>
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setCurrentMode(m.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200
                  ${isActive 
                    ? 'bg-[var(--bg-accent)] text-[var(--text-inverse)] shadow-lg shadow-[var(--glow-color)] font-bold translate-x-1' 
                    : 'hover:bg-[var(--bg-primary)] text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)]'
                  }
                `}
              >
                <Icon size={20} className={isActive ? 'text-[var(--text-inverse)]' : 'text-[var(--bg-accent)]'} />
                <div>
                  <div className="text-sm font-semibold leading-none">{m.label}</div>
                  <div className={`text-[10px] mt-1 ${isActive ? 'opacity-80' : 'text-[var(--text-secondary)] opacity-90'}`}>
                    {m.desc}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Account section */}
          <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-3 mb-2 mt-4">
            Tài Khoản
          </div>
          {accountModes.map((m) => {
            const Icon = m.icon;
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setCurrentMode(m.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200
                  ${isActive 
                    ? 'bg-[var(--bg-accent)] text-[var(--text-inverse)] shadow-lg shadow-[var(--glow-color)] font-bold translate-x-1' 
                    : 'hover:bg-[var(--bg-primary)] text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)]'
                  }
                `}
              >
                <Icon size={20} className={isActive ? 'text-[var(--text-inverse)]' : 'text-[var(--bg-accent)]'} />
                <div>
                  <div className="text-sm font-semibold leading-none">{m.label}</div>
                  <div className={`text-[10px] mt-1 ${isActive ? 'opacity-80' : 'text-[var(--text-secondary)] opacity-90'}`}>
                    {m.desc}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Logout button */}
          {userProfile && (
            <button
              onClick={logout}
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 hover:bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/20 mt-2"
            >
              <LogOut size={20} />
              <div>
                <div className="text-sm font-semibold leading-none">Đăng Xuất</div>
                <div className="text-[10px] mt-1 opacity-70">Thoát tài khoản</div>
              </div>
            </button>
          )}

        </nav>

        {/* Footer Settings & Theme Options */}
        <div className="p-3 border-t border-[var(--border-color)] space-y-3 bg-[var(--bg-primary)]/30">
          {/* Toggles */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => setSakuraEnabled(!sakuraEnabled)}
              className={`
                flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-all duration-200
                ${sakuraEnabled 
                  ? 'bg-pink-500/10 border-pink-500/30 text-pink-600' 
                  : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                }
              `}
            >
              <Heart size={14} className={sakuraEnabled ? "fill-pink-500 text-pink-500 animate-bounce" : ""} />
              🌸 Sakura
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`
                flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-all duration-200
                ${soundEnabled 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600' 
                  : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                }
              `}
            >
              {soundEnabled ? <Volume size={14} /> : <VolumeX size={14} />}
              Âm thanh
            </button>
          </div>

          {/* Theme Selector */}
          <div>
            <div className="text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] mb-2 px-1">
              Giao Diện (Theme)
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
              {[
                { id: 'kyoto', name: 'Kyoto', color: 'bg-[#C92A2A]' },
                { id: 'tokyo', name: 'Tokyo', color: 'bg-[#EC4899]' },
                { id: 'anime', name: 'Anime', color: 'bg-[#8B5CF6]' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`
                    flex flex-col items-center gap-1.5 py-2 px-1.5 rounded-lg text-[10px] font-bold transition-all duration-250
                    ${theme === t.id 
                      ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm text-[var(--text-primary)] scale-105' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
                    }
                  `}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${t.color}`} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Engine Selector */}
          <div>
            <div className="text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] mb-2 px-1 flex items-center gap-2">
              <span>Bộ Phát Âm (Audio Engine)</span>
              {isAudioPlaying && (
                <span className="audio-waveform-mini">
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
              {[
                { id: 'cloud', name: 'Cloud HD 🎌', icon: '☁️', desc: 'Giọng Nhật chuẩn bản xứ' },
                { id: 'system', name: 'Offline 💻', icon: '💻', desc: 'Giọng hệ thống' }
              ].map((engine) => (
                <button
                  key={engine.id}
                  onClick={() => {
                    setVoiceEngine(engine.id);
                    localStorage.setItem('nihongohub_v1_voice_engine', engine.id);
                    // Sound test with new engine
                    setTimeout(() => playAudio('こんにちは'), 100);
                  }}
                  title={engine.desc}
                  className={`
                    flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[9px] font-extrabold transition-all duration-200
                    ${voiceEngine === engine.id 
                      ? 'bg-[var(--bg-accent)] text-[var(--text-inverse)] shadow-sm' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/20'
                    }
                  `}
                >
                  <span>{engine.icon}</span>
                  <span>{engine.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Profile (Pitch Preset) Selector - only show for system engine */}
          {voiceEngine === 'system' && (
          <div>
            <div className="text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] mb-2 px-1">
              🎭 Phong Cách Giọng Đọc (System Voice)
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
              {[
                { id: 'standard', name: 'Mặc định', icon: '🌸' },
                { id: 'male', name: 'Nam trầm', icon: '👦' },
                { id: 'female', name: 'Nữ ngọt ngào', icon: '👧' },
                { id: 'anime', name: 'Anime vui', icon: '⚡' }
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setVoiceProfile(style.id);
                    localStorage.setItem('nihongohub_v1_voice_profile', style.id);
                    // Test with new profile
                    setTimeout(() => playAudio('あ'), 100);
                  }}
                  className={`
                    flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-[9px] font-extrabold transition-all duration-200
                    ${voiceProfile === style.id 
                      ? 'bg-[var(--bg-accent)] text-[var(--text-inverse)] shadow-sm' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/20'
                    }
                  `}
                >
                  <span>{style.icon}</span>
                  <span>{style.name}</span>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Cloud HD quality badge */}
          {voiceEngine === 'cloud' && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-600 text-[9px] font-bold">
                <span className="text-sm">🎌</span>
                <span>Đang dùng giọng đọc HD chuẩn người Nhật bản xứ. Âm thanh tự nhiên, rõ ràng!</span>
              </div>
            </div>
          )}

          {/* Voice Selector - only show for system engine */}
          {voiceEngine === 'system' && (
          <div>
            <div className="text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] mb-2 px-1 opacity-70">
              🗣️ Thiết Bị Phát Âm Offline
            </div>
            <select
              value={selectedVoiceName}
              onChange={(e) => {
                setSelectedVoiceName(e.target.value);
                localStorage.setItem('nihongohub_v1_voice', e.target.value);
                // Test with new voice
                setTimeout(() => playAudio('あ'), 100);
              }}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl py-2.5 px-3 text-[11px] font-semibold outline-none focus:border-[var(--bg-accent)] transition-all cursor-pointer"
            >
              {availableVoices.map((v) => {
                let displayName = v.name;
                if (v.name.toLowerCase().includes('ichiro')) displayName = "Ichiro (Giọng Nam 👦)";
                else if (v.name.toLowerCase().includes('ayumi')) displayName = "Ayumi (Giọng Nữ 👧)";
                else if (v.name.toLowerCase().includes('haruka')) displayName = "Haruka (Giọng Nữ 👧)";
                else if (v.name.toLowerCase().includes('keita')) displayName = "Keita (Giọng Nam 👦)";
                else if (v.name.toLowerCase().includes('nanami')) displayName = "Nanami (Giọng Nữ 👧)";
                else if (v.name.toLowerCase().includes('male')) displayName += " (Giọng Nam 👦)";
                else if (v.name.toLowerCase().includes('female')) displayName += " (Giọng Nữ 👧)";
                
                return (
                  <option key={v.name} value={v.name}>
                    {displayName}
                  </option>
                );
              })}
              {availableVoices.length === 0 && (
                <option value="">Giọng mặc định thiết bị</option>
              )}
            </select>
          </div>
          )}

          {/* Test Audio Button */}
          <button
            onClick={() => playAudio('ありがとうございます')}
            className="w-full py-2 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-[10px] font-bold flex items-center justify-center gap-2"
          >
            {isAudioPlaying ? (
              <>
                <span className="audio-waveform-mini">
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                  <span className="wave-bar"></span>
                </span>
                Đang phát...
              </>
            ) : (
              <>
                <Volume2 size={12} />
                🔊 Test giọng đọc: ありがとうございます
              </>
            )}
          </button>
        </div>
        
        </div> {/* End of Scrollable Content Area */}
      </aside>
    </>
  );
};
