import React, { useState, useEffect, useRef } from 'react';
import { 
  Keyboard, 
  HelpCircle, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  RefreshCw,
  Sparkles,
  Flame
} from 'lucide-react';
import { hiraganaData, katakanaData } from '../data/kanaData';
import { rewardXP, updateSRSElement } from '../utils/srsEngine';

export const TypingPractice = ({ userStats, setUserStats, soundEnabled, playAudio }) => {
  const [sessionState, setSessionState] = useState('start'); // 'start', 'practice', 'summary'
  const [alphabet, setAlphabet] = useState('hiragana'); // 'hiragana', 'katakana', 'both'
  const [studyScope, setStudyScope] = useState('basic'); // 'basic', 'starred', 'all'
  const [difficulty, setDifficulty] = useState('normal'); // 'easy', 'normal', 'hard'
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [consecutiveStreak, setConsecutiveStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [incorrectList, setIncorrectList] = useState([]);
  
  const inputRef = useRef(null);

  // Sound Synthesizer (Web Audio API)
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(698.46, audioCtx.currentTime + 0.08); // F5
        osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.16); // A5
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(146.83, audioCtx.currentTime); // D3
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  const startPractice = () => {
    let source = [];
    if (alphabet === 'hiragana') source = [...hiraganaData];
    else if (alphabet === 'katakana') source = [...katakanaData];
    else source = [...hiraganaData, ...katakanaData];

    // Filter based on study scope
    if (studyScope === 'basic') {
      source = source.filter(x => x.type === 'basic');
    } else if (studyScope === 'starred') {
      source = source.filter(x => userStats.starred[x.kana] === true);
    }

    if (source.length === 0) {
      alert("Chưa có chữ cái nào thỏa phạm vi ôn tập đã chọn! Hãy chọn bảng khác hoặc thả tim (chọn học) thêm chữ cái ở Bảng chữ cái nhé ní.");
      return;
    }

    // Shuffle and slice 12 characters for a quick session (or source.length if less than 12)
    const list = source.sort(() => Math.random() - 0.5).slice(0, Math.min(12, source.length));
    
    setQueue(list);
    setIndex(0);
    setUserInput('');
    setIsChecked(false);
    setIsCorrect(false);
    setConsecutiveStreak(0);
    setMaxStreak(0);
    setXpEarned(0);
    setIncorrectList([]);
    setSessionState('practice');

    // Auto focus text input after load
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const activeChar = queue[index];

  // Auto-speak target kana on index change in Easy / Hard dictation mode
  useEffect(() => {
    if (sessionState === 'practice' && activeChar) {
      if (difficulty === 'easy' || difficulty === 'hard') {
        playAudio(activeChar.kana, false);
      }
    }
  }, [index, activeChar, sessionState, difficulty, playAudio]);

  // Auto-checking spelling as the user types (Vocal and premium visual responsive checking!)
  const handleInputChange = (e) => {
    const value = e.target.value.toLowerCase().trim();
    setUserInput(value);

    if (isChecked) return;

    // Direct match check:
    // If the user typed the exact romaji, register immediate correct response!
    if (value === activeChar.romaji.toLowerCase()) {
      setIsChecked(true);
      setIsCorrect(true);
      playSound('correct');
      setConsecutiveStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      setXpEarned((prev) => prev + 20); // +20 XP for typing active recall correct!

      // Update Local Database progress box correct
      let nextState = updateSRSElement(userStats, activeChar.kana, true);
      nextState = rewardXP(nextState, 20, true);
      setUserStats(nextState);

      // Auto advance to next question in 600ms
      setTimeout(() => {
        handleNext();
      }, 600);
    }
  };

  // Checking manually on hitting Enter or clicking reveal
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isChecked) {
      handleNext();
      return;
    }

    const cleanedInput = userInput.trim().toLowerCase();
    const isAnswerCorrect = cleanedInput === activeChar.romaji.toLowerCase();
    
    setIsChecked(true);
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      playSound('correct');
      setConsecutiveStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      setXpEarned((prev) => prev + 20);

      let nextState = updateSRSElement(userStats, activeChar.kana, true);
      nextState = rewardXP(nextState, 20, true);
      setUserStats(nextState);
    } else {
      playSound('wrong');
      setConsecutiveStreak(0); // Break streak!
      setIncorrectList((prev) => [...prev, activeChar]);

      let nextState = updateSRSElement(userStats, activeChar.kana, false);
      nextState = rewardXP(nextState, 0, false);
      setUserStats(nextState);
    }
  };

  const handleNext = () => {
    if (index + 1 >= queue.length) {
      setSessionState('summary');
    } else {
      setIndex((prev) => prev + 1);
      setUserInput('');
      setIsChecked(false);
      setIsCorrect(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleHintReveal = () => {
    if (isChecked) return;
    // Reveal the spelling, count as incorrect
    setUserInput(activeChar.romaji);
    setIsChecked(true);
    setIsCorrect(false);
    playSound('wrong');
    setConsecutiveStreak(0);
    setIncorrectList((prev) => [...prev, activeChar]);

    let nextState = updateSRSElement(userStats, activeChar.kana, false);
    nextState = rewardXP(nextState, 0, false);
    setUserStats(nextState);
  };

  const playAudioHint = () => {
    if (activeChar) {
      playAudio(activeChar.kana, false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4">
      {/* 1. START STATE */}
      {sessionState === 'start' && (
        <div className="premium-card p-8 text-center space-y-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]">
          <div className="w-16 h-16 rounded-3xl bg-[var(--bg-accent)]/15 text-[var(--bg-accent)] flex items-center justify-center mx-auto floating-element shadow-sm">
            <Keyboard size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="font-extrabold text-2xl">Luyện Gõ Đáp Án</h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto font-semibold leading-relaxed">
              Phương pháp nhớ chữ cái tiếng Nhật mạnh mẽ nhất! Nhìn ký tự Kana hiển thị và gõ chính xác Romaji (phiên âm) từ bàn phím.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-black tracking-widest uppercase text-[var(--text-secondary)]">Chọn bảng ôn tập</div>
            <div className="flex gap-2 p-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
              {[
                { id: 'hiragana', label: 'Hiragana' },
                { id: 'katakana', label: 'Katakana' },
                { id: 'both', label: 'Cả hai bảng' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAlphabet(tab.id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all ${
                    alphabet === tab.id
                      ? 'bg-[var(--bg-accent)] text-[var(--text-inverse)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scope options */}
          <div className="space-y-3">
            <div className="text-[10px] font-black tracking-widest uppercase text-[var(--text-secondary)]">Phạm vi ôn tập</div>
            <div className="flex gap-2 p-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
              {[
                { id: 'basic', label: 'Chỉ chữ cơ bản' },
                { id: 'starred', label: 'Đã chọn học ⭐' },
                { id: 'all', label: 'Tất cả chữ cái' }
              ].map((scope) => (
                <button
                  key={scope.id}
                  onClick={() => setStudyScope(scope.id)}
                  className={`flex-1 py-2 px-1 rounded-lg text-[10px] font-black transition-all ${
                    studyScope === scope.id
                      ? 'bg-[var(--bg-accent)] text-[var(--text-inverse)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {scope.label}
                </button>
              ))}
            </div>
            {studyScope === 'starred' && (
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold mt-1">
                * Chỉ ôn những chữ cái ní đã nhấn biểu tượng Trái Tim (Chọn học) ở Bảng chữ cái.
              </p>
            )}
          </div>

          {/* Difficulty options */}
          <div className="space-y-3">
            <div className="text-[10px] font-black tracking-widest uppercase text-[var(--text-secondary)]">Chọn cấp độ thử thách</div>
            <div className="flex gap-2 p-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
              {[
                { id: 'easy', label: 'Dễ (Có chữ + Tự đọc)' },
                { id: 'normal', label: 'Vừa (Có chữ + Click đọc)' },
                { id: 'hard', label: 'Khó (Ẩn chữ + Nghe gõ 🎧)' }
              ].map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id)}
                  className={`flex-grow py-2 px-1.5 rounded-lg text-[10px] font-black transition-all ${
                    difficulty === diff.id
                      ? diff.id === 'easy'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : diff.id === 'hard'
                        ? 'bg-rose-600 text-white shadow-sm animate-pulse'
                        : 'bg-amber-600 text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startPractice}
            className="w-full py-4 rounded-2xl font-black bg-[var(--bg-accent)] text-[var(--text-inverse)] hover:bg-[var(--bg-accent-hover)] transition-all shadow-lg shadow-[var(--glow-color)] text-sm"
          >
            Bắt đầu gõ bàn phím ⌨️
          </button>
        </div>
      )}

      {/* 2. ACTIVE PRACTICE */}
      {sessionState === 'practice' && activeChar && (
        <div className="space-y-6">
          {/* Progress Header and Session Run Streak */}
          <div className="flex justify-between items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-2xl shadow-sm">
            <div className="text-xs font-extrabold text-[var(--text-primary)]">
              Chữ {index + 1} / {queue.length}
            </div>

            {/* Visual indicator for typing streak */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black text-xs">
              <Flame size={14} className={consecutiveStreak > 0 ? "animate-bounce" : ""} />
              <span>Chuỗi đúng: {consecutiveStreak}</span>
            </div>
          </div>

          {/* Giant Card Prompt */}
          <div className="premium-card p-10 flex flex-col items-center justify-center min-h-[220px] text-center border relative">
            <button
              onClick={playAudioHint}
              className="absolute top-4 right-4 p-2 rounded-xl text-[var(--bg-accent)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm transition-all"
              title="Phát âm âm thanh"
            >
              <Volume2 size={16} />
            </button>

            <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] opacity-60">
              Gõ phiên âm Romaji tương ứng
            </span>

            {/* Giant Target character */}
            <div className="text-8xl sm:text-9xl font-black text-[var(--text-primary)] select-none">
              {difficulty === 'hard' && !isChecked ? (
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="w-24 h-24 rounded-full bg-[var(--bg-accent)]/10 text-[var(--bg-accent)] flex items-center justify-center animate-pulse border border-[var(--bg-accent)]/20 shadow-inner">
                    <Volume2 size={40} className="animate-bounce" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider">Nghe và Gõ phiên âm 🎧</span>
                </div>
              ) : (
                activeChar.kana
              )}
            </div>
          </div>

          {/* Interactive typing form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                disabled={isChecked && isCorrect}
                value={userInput}
                onChange={handleInputChange}
                placeholder="Nhập phiên âm... (ví dụ: ka, shi, tsu)"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                className={`
                  w-full px-5 py-4.5 rounded-2xl border-2 font-black text-center text-lg tracking-wider
                  transition-all duration-300 outline-none
                  ${isChecked
                    ? isCorrect
                      ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 shadow-md shadow-emerald-500/10'
                      : 'border-rose-500 bg-rose-500/5 text-rose-600 shadow-md shadow-rose-500/10'
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--bg-accent)] focus:ring-4 focus:ring-[var(--glow-color)] shadow-sm'
                  }
                `}
              />

              {isChecked && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isCorrect ? (
                    <CheckCircle2 className="text-emerald-500 w-6 h-6 animate-pulse" />
                  ) : (
                    <XCircle className="text-rose-500 w-6 h-6" />
                  )}
                </div>
              )}
            </div>

            {/* Feedback and Reveal panels */}
            {isChecked && !isCorrect && (
              <div className="p-4 bg-rose-500/5 border border-rose-500/15 text-rose-600 rounded-2xl text-center space-y-1 animate-in fade-in slide-in-from-top duration-300">
                <div className="text-[10px] font-black uppercase tracking-wider">Đáp án chính xác là</div>
                <div className="text-2xl font-black uppercase">{activeChar.romaji}</div>
                <div className="text-xs font-semibold text-[var(--text-secondary)] opacity-80">{activeChar.example} ({activeChar.meaning})</div>
              </div>
            )}

            {/* Control buttons */}
            <div className="flex gap-2">
              {!isChecked ? (
                <>
                  <button
                    type="button"
                    onClick={handleHintReveal}
                    className="flex-1 py-4 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold rounded-2xl text-xs transition-colors bg-[var(--bg-secondary)]/50"
                  >
                    Xem đáp án (Gợi ý)
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 rounded-2xl font-black bg-[var(--bg-accent)] text-[var(--text-inverse)] hover:bg-[var(--bg-accent-hover)] shadow-md shadow-[var(--glow-color)] transition-colors text-xs"
                  >
                    Kiểm tra
                  </button>
                </>
              ) : (
                // Only show next if incorrect or if autoplay correct matching lag occurs
                (!isCorrect) && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-4 rounded-2xl font-black bg-[var(--bg-accent)] text-[var(--text-inverse)] hover:bg-[var(--bg-accent-hover)] shadow-md shadow-[var(--glow-color)] transition-colors text-xs flex items-center justify-center gap-2"
                  >
                    Tiếp tục
                    <ArrowRight size={14} />
                  </button>
                )
              )}
            </div>
          </form>
        </div>
      )}

      {/* 3. SESSION SUMMARY PANEL */}
      {sessionState === 'summary' && (
        <div className="premium-card p-8 text-center space-y-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto floating-element">
            <Sparkles size={32} />
          </div>

          <div className="space-y-1">
            <h2 className="font-extrabold text-2xl">Kết Quả Gõ Bàn Phím</h2>
            <p className="text-xs text-[var(--text-secondary)] font-semibold">
              Chúc mừng bạn đã hoàn thành trọn vẹn session luyện gõ tích cực!
            </p>
          </div>

          {/* Stats Breakdown cards */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl">
            <div className="text-center space-y-1">
              <div className="text-[9px] font-black uppercase text-[var(--text-secondary)]">Độ chính xác</div>
              <div className="text-xl font-black text-[var(--text-primary)]">
                {Math.round(((queue.length - incorrectList.length) / queue.length) * 100) || 0}%
              </div>
            </div>
            <div className="text-center space-y-1 border-x border-[var(--border-color)]">
              <div className="text-[9px] font-black uppercase text-[var(--text-secondary)]">Chuỗi dài nhất</div>
              <div className="text-xl font-black text-amber-500 flex items-center justify-center gap-1">
                <Flame size={16} />
                {maxStreak}
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-[9px] font-black uppercase text-[var(--text-secondary)]">XP Nhận</div>
              <div className="text-xl font-black text-emerald-500">+{xpEarned} XP</div>
            </div>
          </div>

          {/* Mistakes checklist for review */}
          {incorrectList.length > 0 && (
            <div className="text-left space-y-2.5">
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] px-1">
                Các chữ cái cần rèn luyện thêm ({incorrectList.length})
              </div>
              <div className="max-h-36 overflow-y-auto border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)]/50 divide-y divide-[var(--border-color)]">
                {incorrectList.map((char, index) => (
                  <div key={index} className="flex justify-between items-center p-3 text-xs font-bold text-[var(--text-primary)] animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black">{char.kana}</span>
                      <span className="text-[var(--text-secondary)] uppercase">({char.romaji})</span>
                    </div>
                    <span className="text-rose-500 font-extrabold text-[10px] bg-rose-500/10 px-2 py-0.5 rounded-full">Luyện thêm</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setSessionState('start')}
              className="flex-1 py-3.5 rounded-xl border border-[var(--border-color)] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors text-xs"
            >
              Quay lại thiết lập
            </button>
            <button
              onClick={startPractice}
              className="flex-1 py-3.5 rounded-xl font-black bg-[var(--bg-accent)] text-[var(--text-inverse)] hover:bg-[var(--bg-accent-hover)] transition-colors text-xs shadow-md shadow-[var(--glow-color)]"
            >
              Bắt đầu luyện tiếp 🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
