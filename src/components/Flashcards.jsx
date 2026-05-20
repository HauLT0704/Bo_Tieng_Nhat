import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCw, 
  ChevronRight, 
  ChevronLeft, 
  Shuffle, 
  Heart, 
  Volume2, 
  Flame, 
  Sparkles, 
  Eye,
  RefreshCw
} from 'lucide-react';
import { hiraganaData, katakanaData } from '../data/kanaData';
import { toggleStarElement, getScheduledQueue, rewardXP } from '../utils/srsEngine';

export const Flashcards = ({ userStats, setUserStats, playAudio }) => {
  const [alphabet, setAlphabet] = useState('hiragana'); // 'hiragana', 'katakana', 'starred', 'srs'
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(3000); // 3 seconds
  
  const timerRef = useRef(null);

  // Initialize deck based on alphabet selection
  useEffect(() => {
    let list = [];
    if (alphabet === 'hiragana') {
      list = [...hiraganaData].filter(x => x.type === 'basic');
    } else if (alphabet === 'katakana') {
      list = [...katakanaData].filter(x => x.type === 'basic');
    } else if (alphabet === 'starred') {
      const allKana = [...hiraganaData, ...katakanaData];
      list = allKana.filter(x => userStats.starred[x.kana] === true);
    } else {
      // Smart SRS Deck
      const allKana = [...hiraganaData, ...katakanaData];
      list = getScheduledQueue(allKana, userStats, 15);
    }
    
    setDeck(list);
    setCurrentIndex(0);
    setIsFlipped(false);
    setAutoplay(false);
  }, [alphabet, userStats.starred, userStats.srsData]);

  // Auto-speak on card navigation or loading
  useEffect(() => {
    if (deck.length > 0 && deck[currentIndex]) {
      playAudio(deck[currentIndex].kana, false);
    }
  }, [currentIndex, deck, playAudio]);

  // Autoplay handler
  useEffect(() => {
    if (autoplay && deck.length > 0) {
      timerRef.current = setTimeout(() => {
        if (!isFlipped) {
          // Flip card first
          setIsFlipped(true);
          playAudio(deck[currentIndex].kana);
        } else {
          // Move to next card and unflip
          setIsFlipped(false);
          setTimeout(() => {
            handleNext();
          }, 400); // wait for unflip animation
        }
      }, isFlipped ? playSpeed + 1000 : playSpeed); // Allow more time on back side
    }
    return () => clearTimeout(timerRef.current);
  }, [autoplay, isFlipped, currentIndex, deck]);

  const currentCard = deck[currentIndex];

  const handleNext = () => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    // Award a tiny bit of XP (+2 XP) for studying a flashcard
    const nextState = rewardXP(userStats, 2, true);
    setUserStats(nextState);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % deck.length);
    }, 150);
  };

  const handlePrev = () => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
    }, 150);
  };

  const handleShuffle = () => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      const shuffled = [...deck].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setCurrentIndex(0);
    }, 200);
  };

  const handleStarToggle = () => {
    if (!currentCard) return;
    const nextState = toggleStarElement(userStats, currentCard.kana);
    setUserStats(nextState);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto py-4">
      {/* Deck Selector Header */}
      <div className="flex p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] justify-between items-center shadow-sm">
        <div className="flex gap-1 flex-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'hiragana', label: 'Hiragana' },
            { id: 'katakana', label: 'Katakana' },
            { id: 'starred', label: 'Đã Chọn ⭐' },
            { id: 'srs', label: 'Ôn Smart' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAlphabet(tab.id)}
              className={`flex-1 min-w-[75px] py-2 px-1 rounded-lg text-xs font-black transition-all duration-300 ${
                alphabet === tab.id
                  ? 'bg-[var(--bg-accent)] text-[var(--text-inverse)] shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Flashcard display */}
      {deck.length === 0 ? (
        <div className="text-center p-12 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl shadow-inner">
          <p className="text-[var(--text-secondary)] font-bold">
            {alphabet === 'starred' 
              ? 'Không có chữ cái nào trong danh sách đã chọn học. Hãy nhấn biểu tượng Trái Tim (Chọn học) ở Bảng chữ cái trước nhé ní!' 
              : 'Không có chữ cái nào trong ngăn xếp ôn tập.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Card perspective wrapper */}
          <div className="perspective w-full h-80 sm:h-96 relative cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`w-full h-full preserve-3d absolute rounded-3xl duration-700 shadow-xl border border-[var(--border-color)] ${
              isFlipped ? 'rotate-y-180 bg-[var(--bg-secondary)]' : 'bg-[var(--bg-secondary)]'
            }`}>
              
              {/* --- FRONT SIDE --- */}
              <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center p-8">
                {/* Row Type Indicator */}
                <div className="absolute top-6 left-6 text-[10px] font-black uppercase tracking-wider text-[var(--bg-accent)] px-2.5 py-1 rounded-md bg-[var(--bg-accent)]/10">
                  {currentCard.row}
                </div>

                {/* Star icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStarToggle();
                  }}
                  className={`absolute top-6 right-6 p-2 rounded-xl transition-all duration-200 hover:bg-[var(--bg-primary)] ${
                    userStats.starred[currentCard.kana] 
                      ? 'text-yellow-500 scale-110' 
                      : 'text-[var(--text-secondary)] opacity-30 hover:opacity-100'
                  }`}
                >
                  <Heart size={20} className={userStats.starred[currentCard.kana] ? "fill-yellow-500 text-yellow-500" : ""} />
                </button>

                {/* Big Kana character */}
                <div className="text-8xl sm:text-9xl font-black text-[var(--text-primary)] select-none">
                  {currentCard.kana}
                </div>

                <div className="absolute bottom-6 text-[10px] font-bold text-[var(--text-secondary)] opacity-60 flex items-center gap-1.5 uppercase tracking-widest">
                  <Eye size={12} /> Bấm để lật xem đáp án
                </div>
              </div>

              {/* --- BACK SIDE --- */}
              <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center p-8 bg-[var(--bg-secondary)]">
                {/* Audio quick button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(currentCard.kana);
                  }}
                  className="absolute top-6 left-6 p-2.5 rounded-xl text-[var(--bg-accent)] hover:text-[var(--bg-accent-hover)] hover:bg-[var(--bg-primary)] transition-all border border-[var(--border-color)]"
                >
                  <Volume2 size={20} className="animate-bounce" />
                </button>

                <div className="text-center space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
                    Cách đọc (Romaji)
                  </div>
                  <div className="text-6xl font-black uppercase tracking-tight text-[var(--bg-accent)] leading-none">
                    {currentCard.romaji}
                  </div>
                  
                  {/* Vocabulary example */}
                  <div className="w-64 max-w-full p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-1.5 mt-2">
                    <div className="text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Từ vựng mẫu</div>
                    <div className="font-extrabold text-base text-[var(--text-primary)]">{currentCard.example}</div>
                    <div className="text-xs text-[var(--text-secondary)] font-semibold leading-relaxed">{currentCard.meaning}</div>
                  </div>
                </div>

                <div className="absolute bottom-6 text-[10px] font-bold text-[var(--text-secondary)] opacity-60 flex items-center gap-1.5 uppercase tracking-widest">
                  <RotateCw size={12} /> Bấm để lật lại mặt trước
                </div>
              </div>

            </div>
          </div>

          {/* Flashcard Nav controls */}
          <div className="flex justify-between items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-2xl shadow-sm">
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="p-3.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
                title="Lùi lại"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex flex-col items-center justify-center px-4 font-black text-sm text-[var(--text-primary)] min-w-[70px] select-none">
                {currentIndex + 1} / {deck.length}
              </div>
              <button
                onClick={handleNext}
                className="p-3.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
                title="Kế tiếp"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex gap-2">
              {/* Shuffle button */}
              <button
                onClick={handleShuffle}
                className="p-3.5 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
                title="Tráo thẻ ngẫu nhiên"
              >
                <Shuffle size={20} />
              </button>

              {/* Autoplay toggle */}
              <button
                onClick={() => setAutoplay(!autoplay)}
                className={`py-3 px-5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  autoplay 
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                    : 'border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                }`}
              >
                {autoplay ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Đang chạy...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Auto Play
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
