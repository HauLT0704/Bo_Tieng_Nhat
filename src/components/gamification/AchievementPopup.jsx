import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export const AchievementPopup = ({ achievement, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Entrance animation
    requestAnimationFrame(() => setVisible(true));

    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onClose(), 400);
  };

  if (!achievement) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-[100] transition-all duration-500 ease-out ${
        visible && !exiting
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className="achievement-popup-card">
        {/* Confetti particles */}
        <div className="achievement-confetti">
          {[...Array(12)].map((_, i) => (
            <span key={i} className={`confetti-piece confetti-${i}`} />
          ))}
        </div>

        <div className="flex items-start gap-3 p-4 relative">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 flex-shrink-0 achievement-bounce">
            {achievement.icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-500 mb-0.5">
              🏆 Thành tích mới!
            </div>
            <div className="font-bold text-sm text-[var(--text-primary)] truncate">
              {achievement.name}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              {achievement.desc}
            </div>
          </div>

          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-[var(--bg-primary)] transition-colors text-[var(--text-secondary)]"
          >
            <X size={14} />
          </button>
        </div>

        {/* Progress bar auto-close indicator */}
        <div className="h-1 bg-[var(--border-color)] overflow-hidden rounded-b-2xl">
          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 achievement-progress-bar" />
        </div>
      </div>
    </div>
  );
};
