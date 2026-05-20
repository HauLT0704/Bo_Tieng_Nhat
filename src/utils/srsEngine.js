// Spaced Repetition System (SRS) & Gamification Engine for Nihongo Hub
// Persists stats, streak, XP, levels, and progress weights in localStorage.

const STORAGE_KEY = 'nihongohub_v1_progress';

const DEFAULT_STATE = {
  xp: 0,
  level: 1,
  streak: 0,
  lastStudyDate: null, // 'YYYY-MM-DD'
  totalQuestionsAnswered: 0,
  correctAnswersCount: 0,
  starred: {}, // { 'あ': true }
  srsData: {},  // { 'あ': { box: 1, lastReviewed: timestamp, incorrectCount: 0, correctCount: 0 } }
};

// Calculate XP required to reach NEXT level
// Level 1: 0 - 200 XP (200 XP to level up)
// Level 2: 200 - 500 XP (300 XP to level up)
// Level 3: 500 - 900 XP (400 XP to level up)
export const getXpForNextLevel = (level) => {
  return 100 + level * 100;
};

// Calculate progress percentage inside current level
export const getLevelProgressPercentage = (xp, level) => {
  let tempXp = xp;
  let currentLevel = 1;
  let req = getXpForNextLevel(currentLevel);
  
  while (tempXp >= req) {
    tempXp -= req;
    currentLevel++;
    req = getXpForNextLevel(currentLevel);
  }
  
  if (currentLevel !== level) return 0;
  return Math.min(100, Math.floor((tempXp / req) * 100));
};

// Get current Level based on XP
export const calculateLevel = (xp) => {
  let tempXp = xp;
  let lvl = 1;
  while (tempXp >= getXpForNextLevel(lvl)) {
    tempXp -= getXpForNextLevel(lvl);
    lvl++;
  }
  return lvl;
};

// Initialize State
export const initStorage = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
    return DEFAULT_STATE;
  }
  try {
    const parsed = JSON.parse(data);
    // Auto-migrate streak if too long ago
    return validateAndUpdateStreak(parsed);
  } catch (e) {
    return DEFAULT_STATE;
  }
};

// Save State
export const saveStorage = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// Validate and update streak
const validateAndUpdateStreak = (state) => {
  if (!state.lastStudyDate) return state;

  const todayStr = getTodayString();
  const lastDate = new Date(state.lastStudyDate);
  const today = new Date(todayStr);

  const diffTime = Math.abs(today - lastDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If last study was more than 1 day ago (e.g. 2 days), streak is lost!
  if (diffDays > 1 && state.lastStudyDate !== todayStr) {
    state.streak = 0;
    saveStorage(state);
  }
  return state;
};

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Register a study activity (updates streak and last studied date)
export const registerStudySession = (state) => {
  const todayStr = getTodayString();
  const lastStudy = state.lastStudyDate;

  let newState = { ...state };

  if (!lastStudy) {
    // First time studying
    newState.streak = 1;
  } else if (lastStudy === todayStr) {
    // Already studied today, keep streak as is
  } else {
    // Studied on a previous day
    const lastDate = new Date(lastStudy);
    const today = new Date(todayStr);
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Studied yesterday, increment streak!
      newState.streak += 1;
    } else {
      // Break in streak, restart from 1
      newState.streak = 1;
    }
  }

  newState.lastStudyDate = todayStr;
  saveStorage(newState);
  return newState;
};

// Reward XP & update accuracy
export const rewardXP = (state, xpGained, isCorrect = true) => {
  let newState = { ...state };
  newState.xp += xpGained;
  newState.totalQuestionsAnswered += 1;
  if (isCorrect) {
    newState.correctAnswersCount += 1;
  }

  // Recalculate level
  const oldLevel = newState.level;
  const newLevel = calculateLevel(newState.xp);
  if (newLevel > oldLevel) {
    newState.level = newLevel;
    // Play visual level up if triggered in UI!
  }

  // Update streak on any correct answer
  if (isCorrect) {
    newState = registerStudySession(newState);
  }

  saveStorage(newState);
  return newState;
};

// Update SRS state for a specific character
export const updateSRSElement = (state, charKey, isCorrect) => {
  const newState = { ...state };
  const srs = newState.srsData[charKey] || { box: 1, lastReviewed: 0, incorrectCount: 0, correctCount: 0 };

  if (isCorrect) {
    srs.correctCount += 1;
    // Progress box up to 5
    srs.box = Math.min(5, srs.box + 1);
  } else {
    srs.incorrectCount += 1;
    // Reset box or drop it by 1
    srs.box = Math.max(1, srs.box - 1);
  }

  srs.lastReviewed = Date.now();
  newState.srsData[charKey] = srs;
  saveStorage(newState);
  return newState;
};

// Toggle Star/Difficulty state
export const toggleStarElement = (state, charKey) => {
  const newState = { ...state };
  newState.starred[charKey] = !newState.starred[charKey];
  saveStorage(newState);
  return newState;
};

// SRS Select Scheduler
// Selects a batch of characters based on SRS scheduling weights
// Characters in box 1 are highly likely to appear, box 5 characters are rare.
export const getScheduledQueue = (kanaList, state, limit = 10) => {
  // Sort or weight all elements
  const weighted = kanaList.map(item => {
    const srs = state.srsData[item.kana] || { box: 1 };
    
    // Calculate weight:
    // Box 1 (New / Hard): Weight 100
    // Box 2: Weight 70
    // Box 3: Weight 40
    // Box 4: Weight 15
    // Box 5 (Mastered): Weight 5
    let baseWeight = 100;
    if (srs.box === 2) baseWeight = 70;
    else if (srs.box === 3) baseWeight = 40;
    else if (srs.box === 4) baseWeight = 15;
    else if (srs.box === 5) baseWeight = 5;

    // Boost weight if starred
    if (state.starred[item.kana]) {
      baseWeight += 50;
    }

    // Boost if review is overdue (e.g. reviewed long time ago)
    const reviewAge = Date.now() - (srs.lastReviewed || 0);
    const ageBonus = Math.min(50, Math.floor(reviewAge / (1000 * 60 * 60))); // Up to 50 pts for hours elapsed

    return {
      item,
      score: Math.random() * (baseWeight + ageBonus)
    };
  });

  // Sort descending and slice
  weighted.sort((a, b) => b.score - a.score);
  return weighted.slice(0, limit).map(w => w.item);
};
