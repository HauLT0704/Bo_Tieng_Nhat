import React from 'react';
import { Crown, Medal, Award, TrendingUp } from 'lucide-react';
import { TOP_FRAMES } from '../../utils/gamificationEngine';

export const TopPlayerCard = ({ player, rank }) => {
  const frame = TOP_FRAMES[rank];
  if (!frame) return null;

  const sizeClass = rank === 1 ? 'w-24 h-24' : 'w-20 h-20';
  const cardClass = rank === 1 ? 'pt-8 pb-5' : 'pt-6 pb-4';

  return (
    <div className={`relative text-center ${rank === 1 ? 'order-2 -mt-4 z-10' : rank === 2 ? 'order-1' : 'order-3'}`}>
      <div
        className={`top-player-card ${cardClass} px-4 rounded-2xl border relative overflow-hidden`}
        style={{
          borderColor: frame.color + '30',
          background: `linear-gradient(180deg, ${frame.color}08 0%, transparent 60%)`,
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${frame.color}40, transparent 70%)`,
          }}
        />

        {/* Rank Badge */}
        <div
          className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg z-10"
          style={{ background: frame.gradient, boxShadow: `0 4px 15px ${frame.glow}` }}
        >
          {rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}
        </div>

        {/* Avatar */}
        <div className="relative mx-auto mt-2">
          <div
            className={`${sizeClass} rounded-full border-[3px] overflow-hidden mx-auto transition-all`}
            style={{
              borderColor: frame.color,
              boxShadow: `0 0 20px ${frame.glow}, 0 0 40px ${frame.glow}`,
            }}
          >
            {player.avatar ? (
              <img src={player.avatar} alt={player.displayName} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xl font-black text-white"
                style={{ background: frame.gradient }}
              >
                {(player.displayName || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 relative">
          <div className="font-black text-sm text-[var(--text-primary)] truncate">
            {player.displayName || player.username}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] font-medium truncate">
            @{player.username}
          </div>

          {/* Stats */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-center gap-1 text-xs font-bold" style={{ color: frame.color }}>
              <TrendingUp size={12} />
              <span>{player.weeklyExp || 0} EXP</span>
            </div>
            <div className="text-[10px] text-[var(--text-secondary)]">
              Level {player.level || 1} • {player.titleIcon || '🌱'} {player.title || 'Người mới'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
