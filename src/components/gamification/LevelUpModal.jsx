import React, { useEffect, useState } from 'react';
import { getTitleForLevel } from '../../utils/gamificationEngine';

export const LevelUpModal = ({ newLevel, onClose }) => {
  const [phase, setPhase] = useState(0); // 0: hidden, 1: burst, 2: content, 3: exit

  const titleInfo = getTitleForLevel(newLevel);

  useEffect(() => {
    // Phase sequence
    requestAnimationFrame(() => setPhase(1));
    
    const t1 = setTimeout(() => setPhase(2), 400);
    const t2 = setTimeout(() => handleClose(), 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleClose = () => {
    setPhase(3);
    setTimeout(() => onClose(), 500);
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-500 ${
        phase >= 1 ? 'bg-black/60 backdrop-blur-md' : 'bg-transparent'
      } ${phase === 3 ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleClose}
    >
      {/* Particle Burst */}
      {phase >= 1 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="levelup-particle"
              style={{
                '--angle': `${(360 / 30) * i}deg`,
                '--distance': `${100 + Math.random() * 200}px`,
                '--size': `${4 + Math.random() * 8}px`,
                '--delay': `${Math.random() * 0.3}s`,
                '--hue': `${Math.random() * 360}`,
                left: '50%',
                top: '50%',
              }}
            />
          ))}
        </div>
      )}

      {/* Content Card */}
      <div
        className={`relative transition-all duration-700 ease-out ${
          phase >= 2 ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-8'
        } ${phase === 3 ? 'scale-75 opacity-0 -translate-y-8' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="levelup-card p-8 sm:p-10 text-center max-w-sm mx-4">
          {/* Glow ring */}
          <div className="levelup-glow-ring">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/40 mx-auto">
              <span className="text-4xl font-black text-white levelup-number">
                {newLevel}
              </span>
            </div>
          </div>

          {/* Text */}
          <div className="mt-6 space-y-2">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 levelup-label">
              ⬆️ LEVEL UP!
            </div>
            <h2 className="text-3xl font-black text-[var(--text-primary)]">
              Level {newLevel}
            </h2>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border mt-2"
              style={{
                borderColor: titleInfo.color + '40',
                backgroundColor: titleInfo.color + '15',
                color: titleInfo.color,
              }}
            >
              <span className="text-lg">{titleInfo.icon}</span>
              <span>{titleInfo.title}</span>
            </div>
          </div>

          {/* Close hint */}
          <p className="text-[10px] text-[var(--text-secondary)] mt-6 opacity-60 font-medium">
            Nhấn bất kỳ đâu để tiếp tục
          </p>
        </div>
      </div>
    </div>
  );
};
