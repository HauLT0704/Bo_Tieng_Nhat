import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, BookOpen, Flame, RefreshCw, Loader2, Users } from 'lucide-react';
import { getLeaderboard, getCurrentSeasonWeek } from '../../firebase/leaderboardService';
import { TopPlayerCard } from './TopPlayerCard';
import { useAuth } from '../../hooks/useAuth';

const SORT_OPTIONS = [
  { id: 'weeklyExp', label: 'EXP Tuần', icon: TrendingUp },
  { id: 'exp', label: 'Tổng EXP', icon: Trophy },
  { id: 'streak', label: 'Streak', icon: Flame },
];

export const Leaderboard = () => {
  const { currentUser } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('weeklyExp');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const seasonWeek = getCurrentSeasonWeek();

  const fetchLeaderboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError('');
    try {
      const data = await getLeaderboard(sortBy, 50);
      setPlayers(data);
    } catch (err) {
      console.error('Leaderboard error:', err);
      setError('Không thể tải bảng xếp hạng. Vui lòng thử lại.');
    }
    
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const top3 = players.slice(0, 3);
  const rest = players.slice(3);
  const myRank = players.findIndex(p => p.uid === currentUser?.uid) + 1;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8" id="leaderboard-page">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/15 mb-3">
          <Trophy size={30} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-black text-[var(--text-primary)]">Bảng Xếp Hạng</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Mùa {seasonWeek} • Reset mỗi thứ 2
        </p>
      </div>

      {/* Sort Tabs */}
      <div className="flex gap-1.5 p-1 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
        {SORT_OPTIONS.map(opt => {
          const Icon = opt.icon;
          const active = sortBy === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                active
                  ? 'bg-[var(--bg-accent)] text-[var(--text-inverse)] shadow-lg'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => fetchLeaderboard(true)}
          disabled={refreshing}
          className="px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium text-center">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-[var(--bg-accent)]" />
        </div>
      )}

      {!loading && players.length === 0 && (
        <div className="text-center py-16">
          <Users size={48} className="mx-auto text-[var(--text-secondary)] opacity-30 mb-4" />
          <p className="font-bold text-[var(--text-secondary)]">Chưa có ai trên bảng xếp hạng</p>
          <p className="text-sm text-[var(--text-secondary)] opacity-60 mt-1">
            Hãy bắt đầu học để trở thành người đầu tiên!
          </p>
        </div>
      )}

      {!loading && players.length > 0 && (
        <>
          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 items-end">
              {top3.map((player, idx) => (
                <TopPlayerCard key={player.uid} player={player} rank={idx + 1} />
              ))}
            </div>
          )}

          {/* My Rank */}
          {myRank > 0 && (
            <div className="premium-card p-4 flex items-center gap-4 border-2 border-[var(--bg-accent)]/30">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-accent)]/15 flex items-center justify-center font-black text-sm text-[var(--bg-accent)]">
                #{myRank}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-[var(--text-primary)]">Vị trí của bạn</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {sortBy === 'weeklyExp' ? `${players[myRank - 1]?.weeklyExp || 0} EXP tuần này` :
                   sortBy === 'exp' ? `${players[myRank - 1]?.exp || 0} tổng EXP` :
                   `${players[myRank - 1]?.streak || 0} ngày streak`}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[var(--bg-accent)]">
                  Top {Math.round((myRank / players.length) * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Remaining Players List */}
          {rest.length > 0 && (
            <div className="premium-card overflow-hidden divide-y divide-[var(--border-color)]">
              {rest.map((player, idx) => {
                const rank = idx + 4;
                const isMe = player.uid === currentUser?.uid;
                
                return (
                  <div
                    key={player.uid}
                    className={`flex items-center gap-3 px-4 py-3 transition-all hover:bg-[var(--bg-primary)] ${
                      isMe ? 'bg-[var(--bg-accent)]/5' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center font-bold text-sm text-[var(--text-secondary)]">
                      {rank}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--border-color)] flex-shrink-0">
                      {player.avatar ? (
                        <img src={player.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-sm text-white font-bold">
                          {(player.displayName || 'U')[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-sm truncate ${isMe ? 'text-[var(--bg-accent)]' : 'text-[var(--text-primary)]'}`}>
                          {player.displayName || player.username}
                        </span>
                        {isMe && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--bg-accent)]/15 text-[var(--bg-accent)]">
                            BẠN
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)]">
                        Level {player.level || 1} • {player.titleIcon || '🌱'} {player.title || 'Người mới'}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      <div className="font-black text-sm text-[var(--text-primary)]">
                        {sortBy === 'weeklyExp' ? player.weeklyExp || 0 :
                         sortBy === 'exp' ? player.exp || 0 :
                         player.streak || 0}
                      </div>
                      <div className="text-[9px] text-[var(--text-secondary)] font-medium">
                        {sortBy === 'weeklyExp' ? 'EXP' : sortBy === 'exp' ? 'Total' : 'ngày'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
