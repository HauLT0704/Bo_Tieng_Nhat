import React, { useState } from 'react';
import {
  Camera, Edit3, Award, Flame, Heart, Shield, Star, Trophy,
  Calendar, Target, BookOpen, Zap, Crown, LogOut, ChevronRight, Loader2, Check, X, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AvatarUpload } from './AvatarUpload';
import { updateUsername } from '../../firebase/firestoreService';
import {
  getTitleForLevel,
  getNextTitle,
  ACHIEVEMENTS,
  getRequiredExp,
  getLevelProgress,
  getRemainingExpInLevel,
  TOP_FRAMES,
} from '../../utils/gamificationEngine';

export const UserProfile = ({ userStats }) => {
  const { currentUser, userProfile, updateProfile, logout, refreshProfile } = useAuth();
  
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!userProfile) return null;

  const currentTitle = getTitleForLevel(userProfile.level || 1);
  const nextTitle = getNextTitle(userProfile.level || 1);
  const totalWords = Object.keys(userStats?.srsData || {}).length;
  const accuracy = userStats?.totalQuestionsAnswered > 0
    ? Math.round((userStats.correctAnswersCount / userStats.totalQuestionsAnswered) * 100)
    : 100;
  const level = userProfile.level || 1;
  const exp = userProfile.exp || 0;
  const requiredExp = getRequiredExp(level);
  const progressPct = getLevelProgress(exp, level);
  const remainingExp = getRemainingExpInLevel(exp, level);
  const streakLives = userProfile.streakLives ?? 3;

  // Calculate days since joined
  const joinDate = userProfile.createdAt?.toDate ? userProfile.createdAt.toDate() : new Date(userProfile.createdAt || Date.now());
  const daysSinceJoin = Math.max(1, Math.floor((Date.now() - joinDate) / (1000 * 60 * 60 * 24)));

  // Username change cooldown
  const lastChange = userProfile.lastUsernameChange?.toDate ? 
    userProfile.lastUsernameChange.toDate() : 
    userProfile.lastUsernameChange ? new Date(userProfile.lastUsernameChange) : null;
  const daysSinceNameChange = lastChange ? Math.floor((Date.now() - lastChange) / (1000 * 60 * 60 * 24)) : 999;
  const canChangeName = daysSinceNameChange >= 7;
  const daysUntilNameChange = Math.max(0, 7 - daysSinceNameChange);

  const handleAvatarChange = async (url) => {
    await updateProfile({ avatar: url });
    await refreshProfile();
  };

  const handleUsernameChange = async () => {
    if (!newUsername.trim()) {
      setNameError('Vui lòng nhập tên mới');
      return;
    }
    if (newUsername.trim().length < 3) {
      setNameError('Tối thiểu 3 ký tự');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername.trim())) {
      setNameError('Chỉ chữ cái, số và dấu gạch dưới');
      return;
    }

    setNameLoading(true);
    setNameError('');
    try {
      await updateUsername(currentUser.uid, newUsername.trim());
      setNameSuccess('Đổi tên thành công!');
      setEditingName(false);
      await refreshProfile();
      setTimeout(() => setNameSuccess(''), 3000);
    } catch (err) {
      setNameError(err.message);
    }
    setNameLoading(false);
  };

  const unlockedAchievements = userProfile.achievements || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8" id="profile-page">
      {/* Profile Header Card */}
      <div className="premium-card p-6 sm:p-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[var(--bg-accent)]/10 to-transparent rounded-bl-full" />
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative">
          {/* Avatar */}
          <div className="relative group">
            <div
              className="w-28 h-28 rounded-full border-4 overflow-hidden cursor-pointer transition-transform hover:scale-105"
              style={{
                borderColor: userProfile.weeklyRank && userProfile.weeklyRank <= 3
                  ? TOP_FRAMES[userProfile.weeklyRank]?.color
                  : 'var(--border-color)',
                boxShadow: userProfile.weeklyRank && userProfile.weeklyRank <= 3
                  ? `0 0 20px ${TOP_FRAMES[userProfile.weeklyRank]?.glow}`
                  : 'none',
              }}
              onClick={() => setShowAvatarUpload(true)}
            >
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-4xl text-white font-black">
                  {(userProfile.displayName || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            {/* Rank badge */}
            {userProfile.weeklyRank && userProfile.weeklyRank <= 3 && (
              <div
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg"
                style={{ background: TOP_FRAMES[userProfile.weeklyRank]?.gradient, color: '#fff' }}
              >
                {userProfile.weeklyRank === 1 ? '👑' : `#${userProfile.weeklyRank}`}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h2 className="text-2xl font-black text-[var(--text-primary)]">
                {userProfile.displayName}
              </h2>
              {/* Title badge */}
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border"
                style={{ borderColor: currentTitle.color + '40', backgroundColor: currentTitle.color + '15', color: currentTitle.color }}
              >
                <span>{currentTitle.icon}</span>
                <span>{currentTitle.title}</span>
              </span>
            </div>
            
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <span className="text-sm text-[var(--text-secondary)] font-medium">@{userProfile.username}</span>
              {nameSuccess && <span className="text-xs text-emerald-500 font-bold">{nameSuccess}</span>}
            </div>
            
            {/* Level + EXP bar */}
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-[var(--bg-accent)]">Level {level}</span>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                  {remainingExp} / {requiredExp} EXP
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[var(--border-color)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--bg-accent)] to-amber-500 transition-all duration-1000 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {nextTitle && (
                <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                  Danh hiệu tiếp: {nextTitle.icon} {nextTitle.title} (Level {nextTitle.level})
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Flame, label: 'Streak', value: `${userProfile.streak || 0} ngày`, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { icon: BookOpen, label: 'Từ đã học', value: totalWords, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { icon: Target, label: 'Độ chính xác', value: `${accuracy}%`, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { icon: Zap, label: 'EXP tuần', value: userProfile.weeklyExp || 0, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="premium-card p-4 text-center">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-2`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div className="text-lg font-black text-[var(--text-primary)]">{stat.value}</div>
            <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Streak Lives */}
      <div className="premium-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-red-500" />
            <span className="font-bold text-sm text-[var(--text-primary)]">Mạng Hồi Sinh Streak</span>
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-medium">Reset mỗi tháng</span>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                i <= streakLives
                  ? 'bg-red-500/15 border border-red-500/30 animate-pulse'
                  : 'bg-[var(--bg-primary)] border border-[var(--border-color)] opacity-30'
              }`}
            >
              {i <= streakLives ? '❤️' : '🖤'}
            </div>
          ))}
          <div className="ml-3 text-sm">
            <div className="font-bold text-[var(--text-primary)]">{streakLives}/3 mạng</div>
            <div className="text-[10px] text-[var(--text-secondary)]">
              {streakLives > 0 ? 'Bảo vệ streak khi quên học' : 'Hết mạng! Hãy giữ streak cẩn thận'}
            </div>
          </div>
        </div>
        {/* Today's words progress */}
        <div className="mt-4 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[var(--text-secondary)]">Từ học hôm nay</span>
            <span className="text-xs font-bold text-[var(--text-primary)]">{userStats?.wordsLearnedToday || 0}/15</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--border-color)] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (userStats?.wordsLearnedToday || 0) >= 15
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : 'bg-gradient-to-r from-amber-500 to-orange-400'
              }`}
              style={{ width: `${Math.min(100, ((userStats?.wordsLearnedToday || 0) / 15) * 100)}%` }}
            />
          </div>
          {(userStats?.wordsLearnedToday || 0) >= 15 ? (
            <p className="text-[10px] text-emerald-500 font-bold mt-1">✅ Đã đạt mục tiêu hôm nay!</p>
          ) : (
            <p className="text-[10px] text-amber-500 font-bold mt-1">
              ⚠️ Cần thêm {15 - (userStats?.wordsLearnedToday || 0)} từ để giữ streak
            </p>
          )}
        </div>
      </div>

      {/* Username Change */}
      <div className="premium-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 size={18} className="text-[var(--bg-accent)]" />
            <span className="font-bold text-sm text-[var(--text-primary)]">Tên tài khoản</span>
          </div>
          {!editingName && (
            <button
              onClick={() => { setEditingName(true); setNewUsername(userProfile.username); }}
              disabled={!canChangeName}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                canChangeName
                  ? 'text-[var(--bg-accent)] hover:bg-[var(--bg-accent)]/10 cursor-pointer'
                  : 'text-[var(--text-secondary)] opacity-50 cursor-not-allowed'
              }`}
            >
              {canChangeName ? 'Đổi tên' : `Chờ ${daysUntilNameChange} ngày`}
            </button>
          )}
        </div>

        {editingName && (
          <div className="mt-3 space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-bold">@</span>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => { setNewUsername(e.target.value.toLowerCase()); setNameError(''); }}
                className="auth-input pl-9"
                maxLength={20}
                placeholder="ten_moi"
              />
            </div>
            {nameError && <p className="text-xs text-red-500 font-medium">{nameError}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setEditingName(false); setNameError(''); }} className="auth-btn-secondary flex-1">
                Hủy
              </button>
              <button onClick={handleUsernameChange} disabled={nameLoading} className="auth-btn-primary flex-1">
                {nameLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                <span>Lưu</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="premium-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} className="text-amber-500" />
          <span className="font-bold text-sm text-[var(--text-primary)]">
            Thành Tích ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {ACHIEVEMENTS.map(achievement => {
            const unlocked = unlockedAchievements.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`relative p-3 rounded-xl border text-center transition-all ${
                  unlocked
                    ? 'bg-[var(--bg-accent)]/5 border-[var(--bg-accent)]/20 hover:border-[var(--bg-accent)]/40'
                    : 'bg-[var(--bg-primary)] border-[var(--border-color)] opacity-40'
                }`}
                title={`${achievement.name}: ${achievement.desc}`}
              >
                <div className={`text-2xl mb-1 ${unlocked ? '' : 'grayscale'}`}>{achievement.icon}</div>
                <div className="text-[9px] font-bold text-[var(--text-primary)] leading-tight truncate">{achievement.name}</div>
                {unlocked && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Info */}
      <div className="premium-card p-5 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={18} className="text-[var(--text-secondary)]" />
          <span className="font-bold text-sm text-[var(--text-primary)]">Thông Tin Tài Khoản</span>
        </div>
        
        {[
          { label: 'Email', value: userProfile.email || currentUser?.email || 'N/A' },
          { label: 'Xác minh Email', value: userProfile.emailVerified ? '✅ Đã xác minh' : '❌ Chưa xác minh' },
          { label: 'Loại tài khoản', value: userProfile.authProvider === 'google' ? '🔵 Google' : '📧 Email' },
          { label: 'Ngày tham gia', value: joinDate.toLocaleDateString('vi-VN') },
          { label: 'Số ngày tham gia', value: `${daysSinceJoin} ngày` },
        ].map(info => (
          <div key={info.label} className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0">
            <span className="text-xs text-[var(--text-secondary)] font-medium">{info.label}</span>
            <span className="text-xs text-[var(--text-primary)] font-bold">{info.value}</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="space-y-3">
        {showLogoutConfirm ? (
          <div className="premium-card p-5">
            <p className="text-sm font-bold text-[var(--text-primary)] mb-3">Bạn chắc chắn muốn đăng xuất?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="auth-btn-secondary flex-1">
                Hủy
              </button>
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all"
              >
                <LogOut size={16} />
                <span>Đăng Xuất</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold text-sm transition-all"
          >
            <LogOut size={16} />
            <span>Đăng Xuất</span>
          </button>
        )}
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <AvatarUpload
          currentAvatar={userProfile.avatar}
          onAvatarChange={handleAvatarChange}
          onClose={() => setShowAvatarUpload(false)}
        />
      )}
    </div>
  );
};
