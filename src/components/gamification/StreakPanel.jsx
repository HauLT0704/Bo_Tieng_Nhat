import React from 'react';
import { Flame, Shield, Calendar, Check, Minus } from 'lucide-react';

export const StreakPanel = ({ streak, streakLives, wordsLearnedToday, lastStudyDate }) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const studiedToday = lastStudyDate === todayStr && wordsLearnedToday >= 15;

  // Generate last 7 days for mini calendar
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    last7Days.push({
      date: dateStr,
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      isToday: i === 0,
      // Approximate: if streak >= (days ago), that day was studied
      completed: i === 0 ? studiedToday : (streak > i),
    });
  }

  return (
    <div className="premium-card p-5 space-y-4" id="streak-panel">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            streak > 0 ? 'bg-orange-500/15' : 'bg-[var(--bg-primary)]'
          }`}>
            <Flame
              size={22}
              className={`${streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-[var(--text-secondary)]'} ${streak >= 7 ? 'animate-pulse' : ''}`}
            />
          </div>
          <div>
            <div className="font-black text-xl text-[var(--text-primary)]">{streak}</div>
            <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ngày liên tiếp</div>
          </div>
        </div>

        {/* Streak Lives */}
        <div className="flex items-center gap-1.5">
          <Shield size={14} className="text-[var(--text-secondary)]" />
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <span key={i} className={`text-sm ${i <= streakLives ? '' : 'opacity-20'}`}>
                {i <= streakLives ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Calendar */}
      <div className="grid grid-cols-7 gap-1.5">
        {last7Days.map(day => (
          <div key={day.date} className="text-center">
            <div className="text-[9px] font-bold text-[var(--text-secondary)] mb-1">{day.dayName}</div>
            <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
              day.isToday
                ? day.completed
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-600 border-2 border-amber-500/40 border-dashed'
                : day.completed
                  ? 'bg-emerald-500/20 text-emerald-600'
                  : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] opacity-40'
            }`}>
              {day.completed ? (
                <Check size={14} className={day.isToday ? 'text-white' : 'text-emerald-500'} />
              ) : day.isToday ? (
                <span className="text-[10px]">{day.dayNum}</span>
              ) : (
                <Minus size={12} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Today's Status */}
      <div className={`p-3 rounded-xl border text-center ${
        studiedToday
          ? 'bg-emerald-500/10 border-emerald-500/20'
          : 'bg-amber-500/10 border-amber-500/20'
      }`}>
        {studiedToday ? (
          <p className="text-xs font-bold text-emerald-600">
            ✅ Đã đạt mục tiêu hôm nay! Streak được giữ 🔥
          </p>
        ) : (
          <p className="text-xs font-bold text-amber-600">
            ⏳ Cần học thêm {Math.max(0, 15 - (wordsLearnedToday || 0))} từ để giữ streak hôm nay
          </p>
        )}
      </div>
    </div>
  );
};
