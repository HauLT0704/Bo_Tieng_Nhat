import React, { useState, useEffect, useRef } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Volume2, 
  HelpCircle, 
  Award, 
  ArrowRight,
  RefreshCw,
  Sparkles,
  Grid
} from 'lucide-react';
import { hiraganaData, katakanaData } from '../data/kanaData';
import { rewardXP, updateSRSElement } from '../utils/srsEngine';

export const TracingCanvas = ({ userStats, setUserStats, soundEnabled, preloadedChar, setPreloadedChar, playAudio }) => {
  const [alphabet, setAlphabet] = useState('hiragana');
  const [studyScope, setStudyScope] = useState('all'); // 'basic', 'starred', 'all'
  const [selectedChar, setSelectedChar] = useState(hiraganaData[0]);
  const [showGuide, setShowGuide] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [brushColor, setBrushColor] = useState('var(--bg-accent)');
  const [brushSize, setBrushSize] = useState(8);
  const [drawingStats, setDrawingStats] = useState({ draws: 0, xp: 0 });
  const [errorMessage, setErrorMessage] = useState('');

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const strokesRef = useRef([]); // Store strokes coordinates for undo feature
  const currentStrokeRef = useRef([]);

  const dataset = alphabet === 'hiragana' ? hiraganaData : katakanaData;

  const filteredList = dataset.filter((item) => {
    if (studyScope === 'basic') return item.type === 'basic';
    if (studyScope === 'starred') return userStats.starred[item.kana] === true;
    return true; // 'all'
  });

  // Auto-select first character in scope if current one falls out of scope
  useEffect(() => {
    const list = dataset.filter((item) => {
      if (studyScope === 'basic') return item.type === 'basic';
      if (studyScope === 'starred') return userStats.starred[item.kana] === true;
      return true;
    });
    if (list.length > 0 && !list.some(item => item.kana === selectedChar.kana)) {
      setSelectedChar(list[0]);
    }
  }, [studyScope, alphabet, userStats.starred, dataset, selectedChar.kana]);

  // Handle preloaded character passed from Dictionary Chart
  useEffect(() => {
    if (preloadedChar) {
      setSelectedChar(preloadedChar);
      setAlphabet(preloadedChar.type === 'katakana' || katakanaData.some(x => x.kana === preloadedChar.kana) ? 'katakana' : 'hiragana');
      // Consume preload
      setPreloadedChar(null);
    }
  }, [preloadedChar]);

  // Clean canvas on changing character selection
  useEffect(() => {
    clearCanvas();
  }, [selectedChar]);

  // Canvas drawing callbacks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      // Create a square canvas matching its visible parent size
      const size = Math.min(canvas.parentElement.clientWidth, 400);
      canvas.width = size;
      canvas.height = size;
      drawBackgroundGrid();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [showGrid, selectedChar]);

  // Draw traditional Japanese writing grid helper
  const drawBackgroundGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Clear previous drawing
    ctx.clearRect(0, 0, w, h);

    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'var(--border-color)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);

      // Vertical middle dashed line
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();

      // Horizontal middle dashed line
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Outer border
      ctx.restore();
    }

    // Redraw any active strokes in history
    redrawStrokes();
  };

  const redrawStrokes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    strokesRef.current.forEach((stroke) => {
      if (stroke.length === 0) return;
      ctx.save();
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
      ctx.restore();
    });
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    isDrawingRef.current = true;
    const coords = getEventCoords(e);
    lastXRef.current = coords.x;
    lastYRef.current = coords.y;

    currentStrokeRef.current = [{ x: coords.x, y: coords.y }];
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getEventCoords(e);

    ctx.save();
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastXRef.current, lastYRef.current);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    ctx.restore();

    lastXRef.current = coords.x;
    lastYRef.current = coords.y;
    currentStrokeRef.current.push({ x: coords.x, y: coords.y });
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    
    // Save active stroke to history array
    if (currentStrokeRef.current.length > 0) {
      strokesRef.current.push(currentStrokeRef.current);
      currentStrokeRef.current = [];
    }
  };

  const getEventCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Handle Touch vs Mouse
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const clearCanvas = () => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    drawBackgroundGrid();
  };

  const undoLastStroke = () => {
    strokesRef.current.pop();
    drawBackgroundGrid();
  };

  // Auto-pronounce when character is selected/loaded
  useEffect(() => {
    if (selectedChar && soundEnabled) {
      playAudio(selectedChar.kana, false);
    }
  }, [selectedChar, playAudio, soundEnabled]);

  // Self assessment score trigger
  const handleScoreResponse = (level) => {
    if (level === 'perfect') {
      const expectedStrokes = selectedChar.strokes || 1;
      const actualStrokes = strokesRef.current.length;
      
      if (actualStrokes === 0) {
        setErrorMessage('Ní chưa viết nét nào cả! Hãy tập viết theo chữ mẫu nhé.');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      // Allow slight variations (e.g. joined strokes or slight extra correction strokes)
      if (actualStrokes < expectedStrokes - 1 || actualStrokes > expectedStrokes + 3) {
        setErrorMessage(`Chữ này có ${expectedStrokes} nét. Ní đang vẽ ${actualStrokes} nét. Hãy thử lại cho đúng số nét chuẩn nha!`);
        setTimeout(() => setErrorMessage(''), 4000);
        return;
      }
    }

    // Award XP
    // Perfect: +30 XP, Need Practice: +10 XP
    const xpGained = level === 'perfect' ? 30 : 10;
    const isCorrect = level === 'perfect';

    let updated = updateSRSElement(userStats, selectedChar.kana, isCorrect);
    updated = rewardXP(updated, xpGained, true); // Stated drawing session correct
    setUserStats(updated);

    setDrawingStats((prev) => ({
      draws: prev.draws + 1,
      xp: prev.xp + xpGained
    }));

    clearCanvas();

    // Auto pick next character in filtered list
    if (filteredList.length > 0) {
      const currentIndex = filteredList.findIndex((x) => x.kana === selectedChar.kana);
      const nextIndex = (currentIndex + 1) % filteredList.length;
      setSelectedChar(filteredList[nextIndex]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-2 space-y-6">
      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Drawing Board & Controls */}
        <div className="lg:col-span-7 flex flex-col items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm">
          
          {/* Top Panel toggles */}
          <div className="w-full flex justify-between items-center text-xs font-semibold">
            <div className="flex gap-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl border transition-all ${
                  showGrid 
                    ? 'bg-[var(--bg-accent)]/10 border-[var(--bg-accent)]/30 text-[var(--bg-accent)]' 
                    : 'border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-primary)]'
                }`}
              >
                <Grid size={14} />
                Lưới kẻ ô
              </button>
              <button
                onClick={() => setShowGuide(!showGuide)}
                className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl border transition-all ${
                  showGuide 
                    ? 'bg-[var(--bg-accent)]/10 border-[var(--bg-accent)]/30 text-[var(--bg-accent)]' 
                    : 'border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-primary)]'
                }`}
              >
                {showGuide ? <Eye size={14} /> : <EyeOff size={14} />}
                Chữ mẫu
              </button>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={undoLastStroke}
                className="p-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                title="Lùi lại 1 nét vẽ"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={clearCanvas}
                className="p-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 transition-colors"
                title="Xóa toàn bộ"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Interactive Tracing Canvas Box */}
          <div className="w-full max-w-[400px] aspect-square relative rounded-2xl border-2 border-[var(--border-color)] overflow-hidden bg-[var(--bg-primary)] shadow-inner">
            
            {/* 1. FAINT GRAY BACKEND TRACE TEXT */}
            {showGuide && (
              <div 
                className="absolute inset-0 flex items-center justify-center text-[var(--text-primary)] opacity-[0.075] select-none pointer-events-none text-center"
                style={{ 
                  fontFamily: "'Noto Sans JP', sans-serif", 
                  fontSize: 'min(70vw, 240px)',
                  fontWeight: '300'
                }}
              >
                {selectedChar.kana}
              </div>
            )}

            {/* 2. MAIN HTML5 DRAWING CANVAS */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            />
          </div>

          {/* User Self-assessment controls */}
          <div className="w-full space-y-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-center text-[var(--text-secondary)]">
              Tự đánh giá nét vẽ của bạn
            </div>
            
            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold p-3 rounded-xl text-center animate-bounce">
                {errorMessage}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleScoreResponse('practice')}
                className="py-4.5 rounded-2xl font-bold border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors text-xs"
              >
                Thử lại (Cần luyện thêm)
              </button>
              <button
                onClick={() => handleScoreResponse('perfect')}
                className="py-4.5 rounded-2xl font-black bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} className="animate-spin" />
                Hoàn hảo (Tuyệt vời)
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Character detail stats and Carousel picker */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Character showcase */}
          <div className="premium-card p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] flex gap-4 items-center">
            <div className="text-5xl font-black text-[var(--text-primary)] w-16 h-16 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center select-none shadow-sm">
              {selectedChar.kana}
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-[10px] font-black tracking-widest text-[var(--text-secondary)] uppercase">Âm tiết đang chọn</div>
              <div className="text-xl font-black uppercase text-[var(--bg-accent)] tracking-wide">{selectedChar.romaji}</div>
              <div className="text-[10px] font-bold text-[var(--text-secondary)] opacity-70">
                Gợi ý nét vẽ chuẩn: {selectedChar.strokes || 1} nét chính.
              </div>
            </div>
            <button
              onClick={() => playAudio(selectedChar.kana, false)}
              className="p-3.5 rounded-xl border border-[var(--border-color)] text-[var(--bg-accent)] hover:bg-[var(--bg-primary)] shadow-sm transition-all"
              title="Phát âm"
            >
              <Volume2 size={20} className="animate-pulse" />
            </button>
          </div>

          {/* Dynamic Carousel list character selector */}
          <div className="premium-card p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
              <span>Danh sách chữ cái ({alphabet})</span>
              <select
                value={alphabet}
                onChange={(e) => {
                  setAlphabet(e.target.value);
                  setSelectedChar(e.target.value === 'hiragana' ? hiraganaData[0] : katakanaData[0]);
                }}
                className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg py-1 px-2 text-[10px] font-bold tracking-normal uppercase animate-pulse-subtle"
              >
                <option value="hiragana">Bảng Hiragana</option>
                <option value="katakana">Bảng Katakana</option>
              </select>
            </div>

            {/* Scope segment selector */}
            <div className="flex gap-1 p-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
              {[
                { id: 'basic', label: 'Cơ bản' },
                { id: 'starred', label: 'Chọn học ⭐' },
                { id: 'all', label: 'Tất cả' }
              ].map((scope) => (
                <button
                  key={scope.id}
                  onClick={() => setStudyScope(scope.id)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black tracking-wider transition-all ${
                    studyScope === scope.id
                      ? 'bg-[var(--bg-accent)] text-[var(--text-inverse)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/30'
                  }`}
                >
                  {scope.label}
                </button>
              ))}
            </div>

            {/* Scrollable list character grid */}
            {filteredList.length > 0 ? (
              <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredList.map((item) => {
                  const isActive = item.kana === selectedChar.kana;
                  return (
                    <button
                      key={item.kana}
                      onClick={() => setSelectedChar(item)}
                      className={`
                        py-2 px-1 rounded-xl text-center border font-bold text-sm select-none transition-all
                        ${isActive 
                          ? 'bg-[var(--bg-accent)] text-[var(--text-inverse)] border-[var(--bg-accent)] shadow-md shadow-[var(--glow-color)] scale-105' 
                          : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }
                      `}
                    >
                      <div className="text-base font-black">{item.kana}</div>
                      <div className="text-[9px] uppercase tracking-normal opacity-85">{item.romaji}</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 px-4 text-xs text-[var(--text-secondary)] font-bold bg-[var(--bg-primary)] border border-dashed border-[var(--border-color)] rounded-2xl">
                Chưa có chữ cái nào trong phạm vi ôn tập đã chọn. Hãy đánh dấu sao (thêm ⭐) ở Bảng chữ cái hoặc đổi phạm vi nhé ní!
              </div>
            )}
          </div>

          {/* Session Statistics details */}
          <div className="premium-card p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3.5">
            <h4 className="font-extrabold text-sm text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wide">
              <Award size={16} className="text-amber-500 animate-pulse" />
              Thống kê viết tay
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl space-y-1">
                <div className="text-[9px] font-black uppercase text-[var(--text-secondary)]">Đã vẽ (Session)</div>
                <div className="text-xl font-black text-[var(--text-primary)]">{drawingStats.draws} chữ</div>
              </div>
              <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl space-y-1">
                <div className="text-[9px] font-black uppercase text-[var(--text-secondary)]">XP Nhận (Session)</div>
                <div className="text-xl font-black text-emerald-500">+{drawingStats.xp} XP</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
