import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  HelpCircle, 
  Award, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Play,
  Heart,
  Timer
} from 'lucide-react';
import { hiraganaData, katakanaData } from '../data/kanaData';
import { rewardXP, updateSRSElement } from '../utils/srsEngine';

export const ListeningTrainer = ({ userStats, setUserStats, soundEnabled, playAudio }) => {
  const [gameState, setGameState] = useState('start'); // 'start', 'trainer', 'summary'
  const [alphabet, setAlphabet] = useState('both'); // 'hiragana', 'katakana', 'both'
  const [studyScope, setStudyScope] = useState('basic'); // 'basic', 'starred', 'all'
  const [difficulty, setDifficulty] = useState('normal'); // 'easy', 'normal', 'hard'
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [lives, setLives] = useState(3);
  const [mistakes, setMistakes] = useState([]);
  const [speakingSlowly, setSpeakingSlowly] = useState(false);

  // Sound Synthesizer (Web Audio API)
  const synthSound = (type) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130.81, audioCtx.currentTime); // C3
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  const startTrainer = () => {
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

    const decoyCount = difficulty === 'easy' ? 2 : difficulty === 'hard' ? 5 : 3;

    // Shuffle and pick 12 questions (or source.length if less than 12)
    const shuffled = source.sort(() => Math.random() - 0.5);
    const questionsCount = Math.min(12, source.length);
    const trainerDeck = shuffled.slice(0, questionsCount).map((target) => {
      let decoyPool = [];
      if (alphabet === 'hiragana') decoyPool = [...hiraganaData];
      else if (alphabet === 'katakana') decoyPool = [...katakanaData];
      else decoyPool = [...hiraganaData, ...katakanaData];

      if (studyScope === 'basic') {
        decoyPool = decoyPool.filter(x => x.type === 'basic');
      }

      const decoys = decoyPool
        .filter((x) => x.kana !== target.kana)
        .map((x) => x.kana);
      const uniqueDecoys = [...new Set(decoys)].sort(() => Math.random() - 0.5).slice(0, decoyCount);
      
      const choices = [target.kana, ...uniqueDecoys].sort(() => Math.random() - 0.5);

      return {
        target,
        choices,
        correctChoice: target.kana
      };
    });

    setQuestions(trainerDeck);
    setIndex(0);
    setScore(0);
    setXpEarned(0);
    setLives(3);
    setMistakes([]);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setGameState('trainer');
    
    // Play initial audio speak
    setTimeout(() => {
      speakTarget(trainerDeck[0].target.kana, false);
    }, 400);
  };

  const speakTarget = (text, slow = false) => {
    if (difficulty === 'hard') {
      playAudio(text, false);
    } else {
      playAudio(text, slow);
    }
  };

  const activeQuestion = questions[index];

  const handleChoiceSelect = (choice) => {
    if (isAnswered) return;
    setSelectedAnswer(choice);
    setIsAnswered(true);

    const isCorrect = choice === activeQuestion.correctChoice;

    if (isCorrect) {
      synthSound('correct');
      setScore((prev) => prev + 1);
      setXpEarned((prev) => prev + 15); // +15 XP for matching audio correctly!

      let updated = updateSRSElement(userStats, activeQuestion.target.kana, true);
      updated = rewardXP(updated, 15, true);
      setUserStats(updated);
    } else {
      synthSound('wrong');
      setLives((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setTimeout(() => endTrainer(score, [...mistakes, activeQuestion.target]), 1000);
        }
        return next;
      });
      setMistakes((prev) => [...prev, activeQuestion.target]);

      let updated = updateSRSElement(userStats, activeQuestion.target.kana, false);
      updated = rewardXP(updated, 0, false);
      setUserStats(updated);
    }
  };

  const handleNext = () => {
    if (lives <= 0) return;
    if (index + 1 >= questions.length) {
      endTrainer(score, mistakes);
    } else {
      setIndex((prev) => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setSpeakingSlowly(false);
      
      // Auto speak next question's target character audio!
      setTimeout(() => {
        speakTarget(questions[index + 1].target.kana, false);
      }, 350);
    }
  };

  const endTrainer = (finalScore, finalMistakes) => {
    setGameState('summary');
  };

  return (
    <div className="max-w-xl mx-auto py-4">
      {/* 1. START PANEL */}
      {gameState === 'start' && (
        <div className="premium-card p-8 text-center space-y-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]">
          <div className="w-16 h-16 rounded-3xl bg-[var(--bg-accent)]/15 text-[var(--bg-accent)] flex items-center justify-center mx-auto floating-element shadow-sm">
            <Volume2 size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="font-extrabold text-2xl">Luyện Nghe Nhận Diện</h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto font-semibold leading-relaxed">
              Rèn luyện phản xạ thính giác! Nghe phát âm chuẩn của chữ cái tiếng Nhật từ trình duyệt và chọn ký tự viết tương ứng. Có 3 trái tim (mạng)!
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
                { id: 'easy', label: 'Dễ (3 Lựa chọn + 🐢)' },
                { id: 'normal', label: 'Vừa (4 Lựa chọn)' },
                { id: 'hard', label: 'Khó (6 Lựa chọn + Khóa 🐢)' }
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
            onClick={startTrainer}
            className="w-full py-4 rounded-2xl font-black bg-[var(--bg-accent)] text-[var(--text-inverse)] hover:bg-[var(--bg-accent-hover)] transition-all shadow-lg shadow-[var(--glow-color)] text-sm"
          >
            Bắt đầu luyện nghe 🎧
          </button>
        </div>
      )}

      {/* 2. ACTIVE SESSION */}
      {gameState === 'trainer' && activeQuestion && (
        <div className="space-y-6">
          {/* Header Panel */}
          <div className="flex justify-between items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  size={18}
                  className={`transition-all duration-300 ${
                    i < lives 
                      ? 'text-rose-500 fill-rose-500 scale-105' 
                      : 'text-[var(--border-color)] scale-90'
                  }`}
                />
              ))}
            </div>

            <div className="text-xs font-extrabold text-[var(--text-primary)]">
              Câu {index + 1} / {questions.length}
            </div>

            <div className="text-xs font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/10">
              Đúng: {score} câu
            </div>
          </div>

          {/* Giant Audio Play Board */}
          <div className="premium-card p-10 flex flex-col items-center justify-center min-h-[220px] text-center border relative">
            <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] opacity-60">
              Nghe âm thanh và chọn chữ cái đúng
            </span>

            {/* Glowing Soundwave Speaker Trigger */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => speakTarget(activeQuestion.target.kana, speakingSlowly)}
                className="w-24 h-24 rounded-full bg-[var(--bg-accent)] text-[var(--text-inverse)] hover:bg-[var(--bg-accent-hover)] shadow-xl shadow-[var(--glow-color)] flex items-center justify-center transition-all scale-105 hover:scale-110 active:scale-95 glow-active"
                title="Nghe lại"
              >
                <Volume2 size={40} className="animate-pulse" />
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSpeakingSlowly(false);
                    speakTarget(activeQuestion.target.kana, false);
                  }}
                  className={`py-1.5 px-3 rounded-lg text-[10px] font-black border transition-all ${
                    !speakingSlowly 
                      ? 'bg-[var(--bg-accent)]/15 border-[var(--bg-accent)]/30 text-[var(--bg-accent)] font-bold'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)]'
                  }`}
                >
                  ⚡ Tốc độ thường
                </button>
                {difficulty === 'hard' ? (
                  <button
                    disabled
                    className="py-1.5 px-3 rounded-lg text-[10px] font-black border border-[var(--border-color)] text-[var(--text-secondary)] opacity-50 cursor-not-allowed"
                    title="Cấp độ Khó khóa nghe chậm"
                  >
                    🔒 Khóa nghe chậm 🐢
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSpeakingSlowly(true);
                      speakTarget(activeQuestion.target.kana, true);
                    }}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-black border transition-all ${
                      speakingSlowly 
                        ? 'bg-[var(--bg-accent)]/15 border-[var(--bg-accent)]/30 text-[var(--bg-accent)] font-bold'
                        : 'border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    🐢 Tốc độ rùa chậm
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grid Selection choices */}
          <div className="grid grid-cols-2 gap-3">
            {activeQuestion.choices.map((choice, i) => {
              const isCorrectChoice = choice === activeQuestion.correctChoice;
              const isSelected = choice === selectedAnswer;

              let btnClass = 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)]';

              if (isAnswered) {
                if (isCorrectChoice) {
                  btnClass = 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20';
                } else if (isSelected) {
                  btnClass = 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20';
                } else {
                  btnClass = 'opacity-40 border-[var(--border-color)]';
                }
              }

              return (
                <button
                  key={i}
                  disabled={isAnswered || lives <= 0}
                  onClick={() => handleChoiceSelect(choice)}
                  className={`
                    p-6 rounded-2xl border-2 font-black transition-all duration-200 text-3xl select-none
                    ${btnClass}
                  `}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {/* Next trigger bar */}
          {isAnswered && lives > 0 && (
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl font-black bg-[var(--bg-accent)] text-[var(--text-inverse)] hover:bg-[var(--bg-accent-hover)] transition-colors text-sm shadow-md shadow-[var(--glow-color)]"
            >
              Tiếp tục
            </button>
          )}
        </div>
      )}

      {/* 3. SESSION SUMMARY PANEL */}
      {gameState === 'summary' && (
        <div className="premium-card p-8 text-center space-y-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]">
          <div className="w-16 h-16 rounded-3xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mx-auto floating-element">
            <Award size={32} />
          </div>

          <div className="space-y-1">
            <h2 className="font-extrabold text-2xl">Kết Quả Luyện Nghe</h2>
            <p className="text-xs text-[var(--text-secondary)] font-semibold">
              {lives <= 0 ? 'Bạn đã hết lượt mạng!' : 'Bạn có kỹ năng thính lực tiếng Nhật cực kỳ xuất sắc!'}
            </p>
          </div>

          {/* Stats Breakdown cards */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl">
            <div className="text-center space-y-1">
              <div className="text-[9px] font-black uppercase text-[var(--text-secondary)]">Điểm số</div>
              <div className="text-xl font-black text-[var(--text-primary)]">{score} / {questions.length}</div>
            </div>
            <div className="text-center space-y-1 border-x border-[var(--border-color)]">
              <div className="text-[9px] font-black uppercase text-[var(--text-secondary)]">Độ chính xác</div>
              <div className="text-xl font-black text-[var(--text-primary)]">
                {Math.round((score / Math.min(questions.length, index + 1)) * 100) || 0}%
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-[9px] font-black uppercase text-[var(--text-secondary)]">XP Nhận</div>
              <div className="text-xl font-black text-emerald-500">+{xpEarned} XP</div>
            </div>
          </div>

          {/* Mistakes checklist for review */}
          {mistakes.length > 0 && (
            <div className="text-left space-y-2.5">
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] px-1">
                Các chữ cái cần nghe lại ({mistakes.length})
              </div>
              <div className="max-h-36 overflow-y-auto border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)]/50 divide-y divide-[var(--border-color)]">
                {mistakes.map((char, index) => (
                  <div key={index} className="flex justify-between items-center p-3 text-xs font-bold text-[var(--text-primary)]">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black">{char.kana}</span>
                      <span className="text-[var(--text-secondary)] uppercase">({char.romaji})</span>
                    </div>
                    <span className="text-[var(--text-secondary)] opacity-70 text-[10px]">{char.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setGameState('start')}
              className="flex-1 py-3.5 rounded-xl border border-[var(--border-color)] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors text-xs"
            >
              Quay lại thiết lập
            </button>
            <button
              onClick={startTrainer}
              className="flex-1 py-3.5 rounded-xl font-black bg-[var(--bg-accent)] text-[var(--text-inverse)] hover:bg-[var(--bg-accent-hover)] transition-colors text-xs shadow-md shadow-[var(--glow-color)]"
            >
              Luyện tiếp lượt mới 🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
