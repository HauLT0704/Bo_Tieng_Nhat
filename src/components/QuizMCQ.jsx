import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  HelpCircle, 
  Award, 
  RefreshCw, 
  Volume2, 
  XCircle, 
  CheckCircle, 
  Timer,
  Play,
  HeartCrack
} from 'lucide-react';
import { hiraganaData, katakanaData } from '../data/kanaData';
import { rewardXP, updateSRSElement } from '../utils/srsEngine';

export const QuizMCQ = ({ userStats, setUserStats, soundEnabled, playAudio }) => {
  const [gameState, setGameState] = useState('start'); // 'start', 'quiz', 'results'
  const [alphabet, setAlphabet] = useState('both'); // 'hiragana', 'katakana', 'both'
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [studyScope, setStudyScope] = useState('basic'); // 'basic', 'starred', 'all'
  
  // Level System
  const [quizLevel, setQuizLevel] = useState(1);
  const [quizStreak, setQuizStreak] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState('');
  const STREAK_TO_LEVEL_UP = 4;
  
  // Timer hooks
  const [timeLeft, setTimeLeft] = useState(15);
  const timerIntervalRef = useRef(null);

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
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130.81, audioCtx.currentTime); // C3
        osc.frequency.setValueAtTime(110.00, audioCtx.currentTime + 0.1); // A2
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'gameover') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.6);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      }
    } catch (e) {
      console.warn("Lỗi tạo âm thanh Web Audio API:", e);
    }
  };

  // Generate a quiz deck
  const startQuiz = () => {
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

    const qTime = 15; // default 15s
    const decoyCount = 5;

    // Shuffle and pick 15 elements
    const shuffled = source.sort(() => Math.random() - 0.5);
    const questionsCount = Math.min(15, source.length);
    const quizDeck = shuffled.slice(0, questionsCount).map((target) => {
      let decoyPool = [];
      if (alphabet === 'hiragana') decoyPool = [...hiraganaData];
      else if (alphabet === 'katakana') decoyPool = [...katakanaData];
      else decoyPool = [...hiraganaData, ...katakanaData];

      if (studyScope === 'basic') {
        decoyPool = decoyPool.filter(x => x.type === 'basic');
      }

      const kanaDecoys = decoyPool.filter((x) => x.kana !== target.kana).map((x) => x.kana);
      const uniqueKanaDecoys = [...new Set(kanaDecoys)].sort(() => Math.random() - 0.5).slice(0, decoyCount);
      
      const romajiDecoys = decoyPool.filter((x) => x.romaji !== target.romaji).map((x) => x.romaji);
      const uniqueRomajiDecoys = [...new Set(romajiDecoys)].sort(() => Math.random() - 0.5).slice(0, decoyCount);

      return {
        target,
        kanaChoices: [target.kana, ...uniqueKanaDecoys].sort(() => Math.random() - 0.5),
        romajiChoices: [target.romaji, ...uniqueRomajiDecoys].sort(() => Math.random() - 0.5)
      };
    });

    setQuestions(quizDeck);
    setCurrentQIndex(0);
    setLives(3);
    setScore(0);
    setXpEarned(0);
    setMistakes([]);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setTypedAnswer('');
    setQuizLevel(1);
    setQuizStreak(0);
    setGameState('quiz');
    setTimeLeft(qTime);
  };

  // Timer Countdown Logic
  useEffect(() => {
    if (gameState !== 'quiz' || isAnswered) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [gameState, currentQIndex, isAnswered]);

  const handleTimeOut = () => {
    setSelectedAnswer('TIMEOUT');
    setIsAnswered(true);
    
    const activeQ = questions[currentQIndex];
    // Phát âm chữ cái khi hết giờ
    playAudio(activeQ.target.kana, false);

    synthSound('wrong');
    setLives((prev) => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        setTimeout(() => endQuiz(score, mistakes), 1000);
      }
      return nextLives;
    });

    setMistakes((prev) => [...prev, activeQ.target]);
    
    // Update SRS schedule weight
    const nextSRS = updateSRSElement(userStats, activeQ.target.kana, false);
    setUserStats(nextSRS);
  };

  const handleAnswerClick = (choice, providedCorrectChoice = null) => {
    if (isAnswered) return;
    clearInterval(timerIntervalRef.current);
    setSelectedAnswer(choice);
    setIsAnswered(true);

    const activeQ = questions[currentQIndex];
    const isReverse = quizLevel === 2;
    const actualCorrectChoice = providedCorrectChoice || (isReverse ? activeQ.target.kana : activeQ.target.romaji);
    
    // Phát âm chữ cái dù chọn đúng hay sai
    playAudio(activeQ.target.kana, false);

    const isCorrect = choice.toLowerCase() === actualCorrectChoice.toLowerCase();

    if (isCorrect) {
      synthSound('correct');
      setScore((prev) => prev + 1);
      
      const xpReward = quizLevel === 1 ? 10 : quizLevel === 2 ? 15 : 25;
      setXpEarned((prev) => prev + xpReward);

      // Level progression logic
      setQuizStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak >= STREAK_TO_LEVEL_UP && quizLevel < 3) {
          setTimeout(() => setQuizLevel((l) => l + 1), 1500); // Level up animation delay
          return 0; // reset streak for next level
        }
        return newStreak;
      });

      // Update User Stats: SRS progress correct & XP
      let updated = updateSRSElement(userStats, activeQ.target.kana, true);
      updated = rewardXP(updated, xpReward, true);
      setUserStats(updated);
    } else {
      synthSound('wrong');
      setQuizStreak(0); // break streak
      setLives((prev) => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          setTimeout(() => endQuiz(score, [...mistakes, activeQ.target]), 1000);
        }
        return nextLives;
      });
      setMistakes((prev) => [...prev, activeQ.target]);

      // Update SRS progress incorrect & award 0 XP but register penalty
      let updated = updateSRSElement(userStats, activeQ.target.kana, false);
      updated = rewardXP(updated, 0, false);
      setUserStats(updated);
    }
  };

  const handleNextQuestion = () => {
    if (lives <= 0) return;
    if (currentQIndex + 1 >= questions.length) {
      endQuiz(score, mistakes);
    } else {
      setCurrentQIndex((prev) => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setTypedAnswer('');
      const qTime = 15 - (quizLevel * 2); // Harder levels give less time
      setTimeLeft(qTime);
    }
  };

  const endQuiz = (finalScore, finalMistakes) => {
    clearInterval(timerIntervalRef.current);
    if (lives <= 0) {
      synthSound('gameover');
    }
    setGameState('results');
  };

  return (
    <div className="max-w-xl mx-auto py-4">
      {/* 1. START GAME STATE */}
      {gameState === 'start' && (
        <div className="premium-card p-8 text-center space-y-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]">
          <div className="w-16 h-16 rounded-3xl bg-[var(--bg-accent)]/15 text-[var(--bg-accent)] flex items-center justify-center mx-auto floating-element shadow-sm">
            <HelpCircle size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="font-extrabold text-2xl">Trắc Nghiệm Tính Giờ</h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto font-semibold leading-relaxed">
              Thách thức phản xạ nhanh! Trả lời 15 câu hỏi trắc nghiệm dưới sức ép 15 giây đếm ngược mỗi câu. Chỉ có 3 mạng (trái tim)!
            </p>
          </div>

          {/* Filter options */}
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

          {/* Difficulty options (Removed in favor of Progressive Level system) */}
          <div className="space-y-3 hidden">
            <div className="text-[10px] font-black tracking-widest uppercase text-[var(--text-secondary)]">Chọn cấp độ thử thách</div>
          </div>

          <button
            onClick={startQuiz}
            className="w-full py-4 rounded-2xl font-black bg-[var(--bg-accent)] text-[var(--text-inverse)] hover:bg-[var(--bg-accent-hover)] transition-all shadow-lg shadow-[var(--glow-color)] text-sm"
          >
            Bắt đầu làm Quiz 🚀
          </button>
        </div>
      )}

      {/* 2. ACTIVE QUIZ STATE */}
      {gameState === 'quiz' && questions.length > 0 && (
        <div className="space-y-6">
          {/* Top Session Progress Bar & Health panel */}
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
              {lives <= 0 && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1 animate-pulse">Game Over!</span>}
            </div>

            {/* Question Counter */}
            <div className="text-xs font-extrabold text-[var(--text-primary)]">
              Câu {currentQIndex + 1} / {questions.length}
            </div>

            {/* Visual countdown timer */}
            <div className="flex items-center gap-2">
              <Timer size={16} className={timeLeft <= 3 ? "text-rose-500 animate-spin" : "text-amber-500"} />
              <span className={`font-black text-sm ${timeLeft <= 3 ? "text-rose-500 scale-110" : "text-[var(--text-primary)]"}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Progressive Level Display */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-2xl shadow-sm space-y-2">
             <div className="flex justify-between items-center text-[10px] font-black uppercase text-[var(--text-secondary)]">
               <span className="flex items-center gap-1"><Award size={14} className="text-amber-500" /> Cấp độ {quizLevel}/3</span>
               <span>Chuỗi đúng: {quizStreak}/{STREAK_TO_LEVEL_UP}</span>
             </div>
             <div className="w-full h-1.5 rounded-full bg-[var(--border-color)] overflow-hidden">
               <div 
                 className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500 ease-out"
                 style={{ width: `${(quizStreak / STREAK_TO_LEVEL_UP) * 100}%` }}
               />
             </div>
             {quizLevel === 1 && <p className="text-[10px] text-center font-bold text-[var(--text-secondary)]">Lv1: Nhìn chữ Tiếng Nhật ➔ Chọn Romaji</p>}
             {quizLevel === 2 && <p className="text-[10px] text-center font-bold text-amber-500">Lv2: Nhìn Romaji ➔ Chọn Tiếng Nhật</p>}
             {quizLevel === 3 && <p className="text-[10px] text-center font-black text-rose-500 animate-pulse">Lv3: Chế độ Gõ (Không có lựa chọn!)</p>}
          </div>

          {/* Core Question Card Display */}
          <div className="premium-card p-8 flex flex-col items-center justify-center min-h-[220px] text-center border relative select-none">
            <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] opacity-60">
              {quizLevel === 2 ? 'Nhìn cách đọc tìm mặt chữ' : 'Nhìn chữ tìm cách đọc'}
            </span>

            {/* Giant Target character or prompt */}
            <div className={`font-black text-[var(--text-primary)] leading-none select-none ${
              quizLevel === 2 ? 'text-4xl uppercase' : 'text-8xl sm:text-9xl'
            }`}>
              {questions[currentQIndex].target[quizLevel === 2 ? 'romaji' : 'kana']}
            </div>

            {/* Premium visual pronunciation feedback revealed upon answering */}
            {isAnswered && (
              <div className="mt-6 flex flex-col items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
                <div className="text-[10px] font-black text-[var(--text-secondary)] tracking-wider uppercase opacity-80">
                  Cách viết & Phiên âm:
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-accent)]/10 border border-[var(--bg-accent)]/20 shadow-sm text-sm font-bold text-[var(--text-primary)]">
                  <span className="text-base font-black text-[var(--bg-accent)]">{questions[currentQIndex].target.kana}</span>
                  <span className="text-[var(--text-secondary)]">({questions[currentQIndex].target.romaji.toUpperCase()})</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(questions[currentQIndex].target.kana, false);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-[var(--bg-accent)] text-white hover:bg-[var(--bg-accent-hover)] text-[10px] font-black tracking-wider uppercase shadow-md shadow-[var(--glow-color)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer mt-1"
                >
                  <Volume2 size={13} className="animate-pulse" />
                  Nghe phát âm
                </button>
              </div>
            )}
          </div>

          {/* Render Choices OR Typing Input based on Level */}
          {quizLevel < 3 ? (
            <div className="grid grid-cols-2 gap-3">
              {(quizLevel === 2 ? questions[currentQIndex].kanaChoices : questions[currentQIndex].romajiChoices).map((choice, i) => {
                const activeQ = questions[currentQIndex];
                const isCorrectChoice = choice === (quizLevel === 2 ? activeQ.target.kana : activeQ.target.romaji);
                const isSelected = choice === selectedAnswer;
                
                let btnClass = 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)]';
                
                if (isAnswered) {
                  if (isCorrectChoice) {
                    btnClass = 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20';
                  } else if (isSelected) {
                    btnClass = 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20 animate-bounce';
                  } else {
                    btnClass = 'opacity-40 border-[var(--border-color)]';
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={isAnswered || lives <= 0}
                    onClick={() => handleAnswerClick(choice, quizLevel === 2 ? activeQ.target.kana : activeQ.target.romaji)}
                    className={`
                      p-5 rounded-2xl border-2 font-black transition-all duration-200 text-base
                      ${btnClass}
                    `}
                  >
                    {quizLevel === 2 ? choice : choice.toUpperCase()}
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if(typedAnswer) handleAnswerClick(typedAnswer.toLowerCase(), questions[currentQIndex].target.romaji.toLowerCase()); }} className="space-y-4">
              <input
                type="text"
                autoFocus
                disabled={isAnswered || lives <= 0}
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Gõ Romaji (VD: a, ka, shi...)"
                className={`w-full text-center text-xl font-black p-4 rounded-2xl border-2 outline-none transition-all
                  ${isAnswered 
                    ? selectedAnswer.toLowerCase() === questions[currentQIndex].target.romaji.toLowerCase()
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                      : 'border-rose-500 bg-rose-500/10 text-rose-500'
                    : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--bg-accent)]'
                  }`}
              />
              {!isAnswered && (
                <button type="submit" disabled={!typedAnswer} className="w-full py-4 rounded-2xl font-black bg-[var(--bg-accent)] text-white disabled:opacity-50 transition-all">
                  Trả lời
                </button>
              )}
            </form>
          )}

          {/* Next / Continue trigger bar */}
          {isAnswered && lives > 0 && (
            <button
              onClick={handleNextQuestion}
              className="w-full py-4 rounded-2xl font-black bg-[var(--bg-accent)] text-[var(--text-inverse)] hover:bg-[var(--bg-accent-hover)] transition-colors text-sm shadow-md shadow-[var(--glow-color)] animate-in fade-in duration-300 mt-4"
            >
              Tiếp tục
            </button>
          )}
        </div>
      )}

      {/* 3. SHOW SCOREBOARD RESULTS */}
      {gameState === 'results' && (
        <div className="premium-card p-8 text-center space-y-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]">
          <div className="w-16 h-16 rounded-3xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mx-auto floating-element">
            <Award size={32} />
          </div>

          <div className="space-y-1">
            <h2 className="font-extrabold text-2xl">Kết quả Session</h2>
            <p className="text-xs text-[var(--text-secondary)] font-semibold">
              {lives <= 0 ? 'Thật tiếc, bạn đã hết lượt mạng!' : 'Hoàn thành xuất sắc 15 câu hỏi!'}
            </p>
          </div>

          {/* Stats Breakdown cards */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl">
            <div className="text-center space-y-1">
              <div className="text-[9px] font-black uppercase text-[var(--text-secondary)]">Điểm số</div>
              <div className="text-xl font-black text-[var(--text-primary)]">{score} / {questions.length}</div>
            </div>
            <div className="text-center space-y-1 border-x border-[var(--border-color)]">
              <div className="text-[9px] font-black uppercase text-[var(--text-secondary)]">Tỷ lệ đúng</div>
              <div className="text-xl font-black text-[var(--text-primary)]">
                {Math.round((score / Math.min(questions.length, currentQIndex + 1)) * 100) || 0}%
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-[9px] font-black uppercase text-[var(--text-secondary)]">XP Nhận</div>
              <div className="text-xl font-black text-emerald-500">+{xpEarned} XP</div>
            </div>
          </div>

          {/* Wrong answers recap for immediate review */}
          {mistakes.length > 0 && (
            <div className="text-left space-y-2.5">
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] px-1">
                Các chữ cái cần lưu ý ({mistakes.length})
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
              onClick={startQuiz}
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
