import React, { useState } from 'react';
import { Play, Heart, HeartOff, HelpCircle, Sparkles, BookOpen, ArrowRight, Volume2 } from 'lucide-react';
import { hiraganaData, katakanaData, KANA_ROWS } from '../data/kanaData';
import { toggleStarElement, updateSRSElement } from '../utils/srsEngine';

export const KanaChart = ({ userStats, setUserStats, currentMode, setCurrentMode, setPreloadedChar, playAudio }) => {
  const [alphabet, setAlphabet] = useState('hiragana'); // 'hiragana' or 'katakana'
  const [filterType, setFilterType] = useState('all'); // 'all', 'basic', 'dakuon', 'yoon', 'starred'
  const [selectedChar, setSelectedChar] = useState(null);
  const [speakingSlowly, setSpeakingSlowly] = useState(false);

  const dataset = alphabet === 'hiragana' ? hiraganaData : katakanaData;

  // Filter dataset
  const filteredData = dataset.filter((item) => {
    if (filterType === 'starred') {
      return userStats.starred[item.kana] === true;
    }
    if (filterType !== 'all' && item.type !== filterType) {
      return false;
    }
    return true;
  });

  // Group characters by row for clean table/grid visualization
  const rowsKeys = Object.keys(KANA_ROWS);
  const groupedData = rowsKeys.reduce((acc, key) => {
    const items = filteredData.filter((item) => item.row === key);
    if (items.length > 0) {
      acc.push({ key, name: KANA_ROWS[key], items });
    }
    return acc;
  }, []);

  const handleStarToggle = (e, char) => {
    e.stopPropagation(); // Avoid opening drawer
    const nextState = toggleStarElement(userStats, char);
    setUserStats(nextState);
  };

  const handleCardClick = (item) => {
    setSelectedChar(item);
    playAudio(item.kana, false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Chart Title & Filters Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-2xl shadow-sm">
        {/* Toggle Alphabet Tab */}
        <div className="flex p-1 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
          <button
            onClick={() => {
              setAlphabet('hiragana');
              setSelectedChar(null);
            }}
            className={`px-6 py-2.5 rounded-lg text-sm font-extrabold transition-all duration-300 ${
              alphabet === 'hiragana'
                ? 'bg-[var(--bg-accent)] text-[var(--text-inverse)] shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Hiragana (平仮名)
          </button>
          <button
            onClick={() => {
              setAlphabet('katakana');
              setSelectedChar(null);
            }}
            className={`px-6 py-2.5 rounded-lg text-sm font-extrabold transition-all duration-300 ${
              alphabet === 'katakana'
                ? 'bg-[var(--bg-accent)] text-[var(--text-inverse)] shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Katakana (片仮名)
          </button>
        </div>

        {/* Filter Selection Chips */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'basic', label: 'Cơ bản (Gojūon)' },
            { id: 'dakuon', label: 'Âm đục (Dakuon)' },
            { id: 'yoon', label: 'Âm ghép (Yōon)' },
            { id: 'starred', label: 'Yêu thích ⭐' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterType(chip.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                filterType === chip.id
                  ? 'bg-[var(--bg-accent)]/10 text-[var(--bg-accent)] border-[var(--bg-accent)]/30'
                  : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      {groupedData.length === 0 ? (
        <div className="text-center p-12 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-inner">
          <p className="text-[var(--text-secondary)] font-bold text-sm">Không tìm thấy âm tiết nào thỏa điều kiện lọc.</p>
        </div>
      ) : (
        <div className="space-y-8 pb-12">
          {groupedData.map((group) => (
            <div key={group.key} className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] px-2">
                {group.name}
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                {group.items.map((item) => {
                  const srs = userStats.srsData[item.kana] || { box: 0 };
                  const isStarred = userStats.starred[item.kana] === true;
                  const isSelected = selectedChar?.kana === item.kana;

                  return (
                    <div
                      key={item.kana}
                      onClick={() => handleCardClick(item)}
                      className={`
                        premium-card relative p-5 flex flex-col items-center justify-center cursor-pointer border select-none
                        ${isSelected 
                          ? 'border-[var(--bg-accent)] bg-[var(--bg-accent)]/5 scale-105 shadow-md shadow-[var(--glow-color)] glow-active' 
                          : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
                        }
                      `}
                    >
                      {/* Favorite star */}
                      <button
                        onClick={(e) => handleStarToggle(e, item.kana)}
                        className={`absolute top-2 right-2 p-1 rounded-md transition-all duration-200 ${
                          isStarred 
                            ? 'text-yellow-500 scale-110' 
                            : 'text-[var(--text-secondary)] opacity-30 hover:opacity-100 hover:text-yellow-500'
                        }`}
                      >
                        <Heart size={14} className={isStarred ? "fill-yellow-500 text-yellow-500" : ""} />
                      </button>

                      {/* Box level progress indicators */}
                      <div className="absolute bottom-2 left-2 flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              i < srs.box
                                ? srs.box === 5 
                                  ? 'bg-emerald-500' 
                                  : 'bg-[var(--bg-accent)]'
                                : 'bg-[var(--border-color)]'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Giant Kana */}
                      <div className="text-4xl font-extrabold leading-none mb-1 text-[var(--text-primary)]">
                        {item.kana}
                      </div>

                      {/* Romaji subtext */}
                      <div className="text-xs font-black tracking-wider text-[var(--text-secondary)] opacity-85 uppercase mt-1">
                        {item.romaji}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Detail Drawer (Right side Slide-out or Bottom panel on Mobile) */}
      {selectedChar && (
        <div className="fixed bottom-0 left-0 right-0 lg:bottom-6 lg:right-6 lg:left-auto lg:w-96 bg-[var(--bg-secondary)] border-t lg:border border-[var(--border-color)] shadow-2xl p-6 rounded-t-3xl lg:rounded-3xl z-40 transform transition-all duration-300 flex flex-col gap-5 max-w-full animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--bg-accent)] px-2 py-1 rounded-md bg-[var(--bg-accent)]/10">
                {selectedChar.type === 'basic' ? 'Cơ bản' : selectedChar.type === 'dakuon' ? 'Âm đục' : 'Âm ghép'}
              </span>
              <h3 className="font-extrabold text-lg mt-2 text-[var(--text-primary)]">Chi tiết âm tiết</h3>
            </div>
            <button
              onClick={() => setSelectedChar(null)}
              className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
            >
              Đóng
            </button>
          </div>

          <div className="flex gap-5 items-center bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-color)] relative">
            <div className="text-6xl font-black text-[var(--text-primary)] select-none w-20 h-20 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center border border-[var(--border-color)] shadow-sm">
              {selectedChar.kana}
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-xs font-bold text-[var(--text-secondary)]">Phiên âm Romaji</div>
              <div className="text-2xl font-black uppercase text-[var(--bg-accent)]">{selectedChar.romaji}</div>
              <div className="text-[10px] font-bold text-[var(--text-secondary)] opacity-70">
                Số nét vẽ: {selectedChar.strokes || 1} nét
              </div>
            </div>
            {/* Drawer Star Toggle */}
            <button
              onClick={(e) => handleStarToggle(e, selectedChar.kana)}
              className={`p-2.5 rounded-xl transition-all duration-300 border flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer ${
                userStats.starred[selectedChar.kana]
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 shadow-sm'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] opacity-60 hover:opacity-100'
              }`}
              title={userStats.starred[selectedChar.kana] ? 'Bỏ chọn học' : 'Chọn học ⭐'}
            >
              <Heart size={18} className={userStats.starred[selectedChar.kana] ? "fill-yellow-500 text-yellow-500" : ""} />
              <span className="text-[9px] font-bold tracking-tight">
                {userStats.starred[selectedChar.kana] ? 'Đang học' : 'Chọn học'}
              </span>
            </button>
          </div>

          {/* Example vocabulary section */}
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)]">Ví dụ minh họa</div>
            <div className="p-3 bg-[var(--bg-primary)]/70 rounded-xl border border-[var(--border-color)] text-sm">
              <div className="flex justify-between font-bold">
                <span className="text-[var(--text-primary)]">{selectedChar.example}</span>
                <span className="text-[var(--bg-accent)] uppercase text-xs">{selectedChar.romaji} example</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1 font-semibold">{selectedChar.meaning}</div>
            </div>
          </div>

          {/* Voice Controls and quick-actions */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => playAudio(selectedChar.kana, false)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-[var(--bg-accent)] text-[var(--text-inverse)] hover:bg-[var(--bg-accent-hover)] shadow-md shadow-[var(--glow-color)] transition-colors text-sm"
              >
                <Volume2 size={16} />
                Giọng chuẩn
              </button>
              <button
                onClick={() => playAudio(selectedChar.kana, true)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors text-sm"
              >
                🐢 Giọng chậm
              </button>
            </div>

            <button
              onClick={() => {
                setPreloadedChar(selectedChar);
                setCurrentMode('tracing');
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-colors text-sm mt-1"
            >
              Luyện viết nét chữ này
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
