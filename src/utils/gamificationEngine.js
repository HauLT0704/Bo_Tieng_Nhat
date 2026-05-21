// Gamification Engine for Nihongo Hub
// Manages titles, achievements, streak lives, daily rewards, and level-up celebrations

// ===== TITLE SYSTEM =====

export const TITLES = [
  { level: 1,  title: 'Người mới',              icon: '🌱', color: '#6B7280' },
  { level: 3,  title: 'Khám phá',               icon: '🔍', color: '#8B5CF6' },
  { level: 5,  title: 'Học viên',                icon: '📚', color: '#3B82F6' },
  { level: 8,  title: 'Siêng năng',              icon: '✏️', color: '#10B981' },
  { level: 10, title: 'Chuyên cần',              icon: '💪', color: '#F59E0B' },
  { level: 15, title: 'Tập sự',                  icon: '🎯', color: '#EF4444' },
  { level: 20, title: 'Chiến binh Kana',         icon: '🗡️', color: '#EC4899' },
  { level: 25, title: 'Samurai',                  icon: '⚔️', color: '#DC2626' },
  { level: 30, title: 'Ninja Nhật ngữ',          icon: '🥷', color: '#7C3AED' },
  { level: 40, title: 'Cao thủ Kana',            icon: '🏯', color: '#B45309' },
  { level: 50, title: 'Đại sư',                  icon: '🐲', color: '#059669' },
  { level: 60, title: 'Huyền thoại Nhật ngữ',    icon: '🐉', color: '#FFD700' },
  { level: 80, title: 'Thần thoại',              icon: '👑', color: '#FF6B35' },
  { level: 100,title: 'Bậc thầy vĩnh cửu',      icon: '🌟', color: '#E11D48' },
];

/**
 * Get title for a given level
 */
export const getTitleForLevel = (level) => {
  let currentTitle = TITLES[0];
  for (const t of TITLES) {
    if (level >= t.level) {
      currentTitle = t;
    } else {
      break;
    }
  }
  return currentTitle;
};

/**
 * Get next title milestone
 */
export const getNextTitle = (level) => {
  for (const t of TITLES) {
    if (t.level > level) {
      return t;
    }
  }
  return null; // Max title reached
};

// ===== ACHIEVEMENT SYSTEM =====

export const ACHIEVEMENTS = [
  // Learning milestones
  { id: 'first_word',     name: 'Bước đầu tiên',         desc: 'Học từ đầu tiên',                icon: '👶', category: 'learning' },
  { id: 'words_50',       name: 'Nửa trăm chữ',          desc: 'Học 50 từ',                      icon: '📝', category: 'learning' },
  { id: 'words_100',      name: 'Trăm chữ vạn ý',        desc: 'Học 100 từ',                     icon: '💯', category: 'learning' },
  { id: 'words_500',      name: 'Nửa ngàn tri thức',      desc: 'Học 500 từ',                     icon: '📖', category: 'learning' },
  { id: 'words_1000',     name: 'Nghìn chữ ngàn duyên',   desc: 'Học 1000 từ',                    icon: '🎊', category: 'learning' },

  // Streak milestones
  { id: 'streak_3',       name: 'Khởi đầu bền bỉ',        desc: 'Streak 3 ngày',                  icon: '🔥', category: 'streak' },
  { id: 'streak_7',       name: 'Kiên trì 7 ngày',        desc: 'Streak 7 ngày liên tiếp',        icon: '🔥', category: 'streak' },
  { id: 'streak_14',      name: '2 tuần không nghỉ',      desc: 'Streak 14 ngày liên tiếp',       icon: '💪', category: 'streak' },
  { id: 'streak_30',      name: 'Chiến binh 30 ngày',     desc: 'Streak 30 ngày liên tiếp',       icon: '💎', category: 'streak' },
  { id: 'streak_100',     name: 'Huyền thoại 100 ngày',   desc: 'Streak 100 ngày liên tiếp',      icon: '🏆', category: 'streak' },

  // Quiz performance
  { id: 'perfect_quiz',   name: 'Hoàn hảo',               desc: 'Đạt 100% trong 1 bài quiz',     icon: '⭐', category: 'quiz' },
  { id: 'quiz_master',    name: 'Bậc thầy trắc nghiệm',   desc: 'Hoàn thành 50 bài quiz',         icon: '🧠', category: 'quiz' },
  { id: 'speed_demon',    name: 'Tốc độ ánh sáng',        desc: 'Trả lời đúng trong 2 giây',     icon: '⚡', category: 'quiz' },

  // Level milestones
  { id: 'level_5',        name: 'Lên cấp 5',              desc: 'Đạt Level 5',                    icon: '🎖️', category: 'level' },
  { id: 'level_10',       name: 'Hai chữ số',             desc: 'Đạt Level 10',                   icon: '🏅', category: 'level' },
  { id: 'level_25',       name: 'Samurai thực thụ',       desc: 'Đạt Level 25',                   icon: '⚔️', category: 'level' },
  { id: 'level_50',       name: 'Nửa thế kỷ',            desc: 'Đạt Level 50',                   icon: '🐲', category: 'level' },

  // Competitive
  { id: 'top_1_weekly',   name: 'Vô địch tuần',           desc: 'Đạt TOP 1 BXH tuần',            icon: '👑', category: 'competitive' },
  { id: 'top_3_weekly',   name: 'Podium tuần',            desc: 'Đạt TOP 3 BXH tuần',            icon: '🥇', category: 'competitive' },

  // Special
  { id: 'night_owl',      name: 'Cú đêm',                desc: 'Học sau 23:00',                   icon: '🦉', category: 'special' },
  { id: 'early_bird',     name: 'Chim sớm',               desc: 'Học trước 6:00 sáng',            icon: '🐦', category: 'special' },
  { id: 'comeback',       name: 'Trở lại mạnh mẽ',       desc: 'Dùng mạng hồi sinh streak',     icon: '💚', category: 'special' },
];

/**
 * Check and return newly unlocked achievements
 */
export const checkAchievements = (userStats, existingAchievements = []) => {
  const newAchievements = [];
  const totalWords = Object.keys(userStats.srsData || {}).length;
  const hour = new Date().getHours();
  
  const checks = [
    { id: 'first_word',    condition: totalWords >= 1 },
    { id: 'words_50',      condition: totalWords >= 50 },
    { id: 'words_100',     condition: totalWords >= 100 },
    { id: 'words_500',     condition: totalWords >= 500 },
    { id: 'words_1000',    condition: totalWords >= 1000 },
    { id: 'streak_3',      condition: userStats.streak >= 3 },
    { id: 'streak_7',      condition: userStats.streak >= 7 },
    { id: 'streak_14',     condition: userStats.streak >= 14 },
    { id: 'streak_30',     condition: userStats.streak >= 30 },
    { id: 'streak_100',    condition: userStats.streak >= 100 },
    { id: 'level_5',       condition: userStats.level >= 5 },
    { id: 'level_10',      condition: userStats.level >= 10 },
    { id: 'level_25',      condition: userStats.level >= 25 },
    { id: 'level_50',      condition: userStats.level >= 50 },
    { id: 'night_owl',     condition: hour >= 23 || hour < 4 },
    { id: 'early_bird',    condition: hour >= 4 && hour < 6 },
    { id: 'comeback',      condition: userStats._usedStreakLife },
  ];
  
  for (const check of checks) {
    if (check.condition && !existingAchievements.includes(check.id)) {
      const achievement = ACHIEVEMENTS.find(a => a.id === check.id);
      if (achievement) {
        newAchievements.push(achievement);
      }
    }
  }
  
  return newAchievements;
};

// ===== STREAK LIVES SYSTEM =====

const STREAK_LIVES_MAX = 3;
const DAILY_WORDS_REQUIRED = 15;

/**
 * Check and update streak with lives system
 * Called at app load or study session
 */
export const processStreakWithLives = (state) => {
  const newState = { ...state };
  const todayStr = getTodayString();
  
  // Reset words learned counter if it's a new day
  if (newState.wordsLearnedDate !== todayStr) {
    newState.wordsLearnedToday = 0;
    newState.wordsLearnedDate = todayStr;
  }
  
  // Monthly reset of streak lives
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (newState.streakLivesResetDate !== currentMonth) {
    newState.streakLives = STREAK_LIVES_MAX;
    newState.streakLivesResetDate = currentMonth;
  }
  
  // Check if streak should be processed (on new day)
  if (!newState.lastStudyDate || newState.lastStudyDate === todayStr) {
    return newState; // Same day or first time, no streak check needed
  }
  
  const lastDate = new Date(newState.lastStudyDate);
  const today = new Date(todayStr);
  const diffTime = Math.abs(today - lastDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) {
    // Missed day(s)! Check if previous day had enough words
    // Use streak lives to save
    if (newState.streakLives > 0) {
      newState.streakLives--;
      newState._usedStreakLife = true; // Flag for achievement check
    } else {
      newState.streak = 0;
      newState._usedStreakLife = false;
    }
  }
  
  return newState;
};

/**
 * Register study session with the new 15-words-per-day requirement
 */
export const registerStudyWithStreak = (state, wordsStudied = 1) => {
  const newState = { ...state };
  const todayStr = getTodayString();
  
  // Reset daily counter if new day
  if (newState.wordsLearnedDate !== todayStr) {
    newState.wordsLearnedToday = 0;
    newState.wordsLearnedDate = todayStr;
  }
  
  // Increment words learned today
  newState.wordsLearnedToday = (newState.wordsLearnedToday || 0) + wordsStudied;
  
  // Check if met daily requirement for streak
  if (newState.wordsLearnedToday >= DAILY_WORDS_REQUIRED) {
    if (!newState.lastStudyDate || newState.lastStudyDate !== todayStr) {
      // First time meeting requirement today
      const lastStudy = newState.lastStudyDate;
      
      if (!lastStudy) {
        newState.streak = 1;
      } else {
        const lastDate = new Date(lastStudy);
        const today = new Date(todayStr);
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newState.streak += 1;
        } else if (diffDays === 0) {
          // Same day, keep streak
        } else {
          // Already handled by processStreakWithLives at load
          // If we still have streak (lives saved it), increment
          if (newState.streak > 0) {
            newState.streak += 1;
          } else {
            newState.streak = 1;
          }
        }
      }
      
      newState.lastStudyDate = todayStr;
    }
  }
  
  return newState;
};

// ===== DAILY REWARDS =====

/**
 * Check if user deserves a daily reward bonus
 * 7-day streak bonus: +50 EXP
 */
export const checkDailyReward = (streak) => {
  if (streak > 0 && streak % 7 === 0) {
    return {
      type: 'streak_bonus',
      exp: 50,
      message: `🎉 Bonus +50 EXP cho ${streak} ngày streak liên tiếp!`,
    };
  }
  return null;
};

// ===== EXP FORMULA =====

/**
 * New EXP formula: requiredExp = level * level * 100
 * As requested in the spec
 */
export const getRequiredExp = (level) => {
  return level * level * 100;
};

/**
 * Calculate level from total EXP using new formula
 */
export const calculateLevelFromExp = (totalExp) => {
  let exp = totalExp;
  let level = 1;
  while (exp >= getRequiredExp(level)) {
    exp -= getRequiredExp(level);
    level++;
  }
  return level;
};

/**
 * Get progress percentage within current level
 */
export const getLevelProgress = (totalExp, level) => {
  let exp = totalExp;
  for (let i = 1; i < level; i++) {
    exp -= getRequiredExp(i);
  }
  const required = getRequiredExp(level);
  return Math.min(100, Math.floor((exp / required) * 100));
};

/**
 * Get remaining EXP in current level
 */
export const getRemainingExpInLevel = (totalExp, level) => {
  let exp = totalExp;
  for (let i = 1; i < level; i++) {
    exp -= getRequiredExp(i);
  }
  return exp;
};

// ===== TOP PLAYER FRAMES =====

export const TOP_FRAMES = {
  1: { color: '#FFD700', gradient: 'linear-gradient(135deg, #FFD700, #FFA500)', label: 'TOP 1', glow: 'rgba(255, 215, 0, 0.5)' },
  2: { color: '#C0C0C0', gradient: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', label: 'TOP 2', glow: 'rgba(192, 192, 192, 0.5)' },
  3: { color: '#CD7F32', gradient: 'linear-gradient(135deg, #CD7F32, #B5651D)', label: 'TOP 3', glow: 'rgba(205, 127, 50, 0.5)' },
};

// ===== UTILITY =====

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
