// Firestore Database Service for Nihongo Hub
// Handles all user data CRUD operations with Firestore

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// ===== USER DOCUMENT OPERATIONS =====

const USERS_COLLECTION = 'users';
const LEADERBOARD_COLLECTION = 'leaderboard';

/**
 * Default user document schema
 */
export const createDefaultUserDoc = (uid, data = {}) => ({
  uid,
  username: data.username || `user_${uid.slice(0, 8)}`,
  displayName: data.displayName || 'Người học mới',
  email: data.email || '',
  emailVerified: data.emailVerified || false,
  avatar: data.avatar || '',
  level: 1,
  exp: 0,
  streak: 0,
  streakLives: 3,
  lastStudyDate: null,
  title: 'Người mới',
  titleIcon: '🌱',
  weeklyExp: 0,
  weeklyRank: null,
  lastUsernameChange: null,
  createdAt: serverTimestamp(),
  totalQuestionsAnswered: 0,
  correctAnswersCount: 0,
  wordsLearnedToday: 0,
  wordsLearnedDate: null,  // track which day wordsLearnedToday belongs to
  srsData: {},
  starred: {},
  achievements: [],
  authProvider: data.authProvider || 'email',
  streakLivesResetDate: null, // track monthly reset
});

/**
 * Create a new user document in Firestore
 */
export const createUserDocument = async (uid, userData) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const userDoc = createDefaultUserDoc(uid, userData);
  await setDoc(userRef, userDoc);
  return userDoc;
};

/**
 * Get user document from Firestore
 */
export const getUserDocument = async (uid) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
};

/**
 * Update user document fields
 */
export const updateUserDocument = async (uid, updates) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    ...updates,
  });
};

/**
 * Check if username is already taken
 */
export const isUsernameTaken = async (username, excludeUid = null) => {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where('username', '==', username.toLowerCase().trim()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return false;
  
  // If excluding a specific uid (for own profile), check if the match is someone else
  if (excludeUid) {
    return snapshot.docs.some(doc => doc.id !== excludeUid);
  }
  
  return true;
};

/**
 * Update username with 7-day cooldown check
 */
export const updateUsername = async (uid, newUsername) => {
  const userDoc = await getUserDocument(uid);
  if (!userDoc) throw new Error('User not found');
  
  // Check cooldown
  if (userDoc.lastUsernameChange) {
    const lastChange = userDoc.lastUsernameChange.toDate ? 
      userDoc.lastUsernameChange.toDate() : 
      new Date(userDoc.lastUsernameChange);
    const now = new Date();
    const diffDays = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      const daysLeft = 7 - diffDays;
      throw new Error(`Bạn cần chờ thêm ${daysLeft} ngày nữa để đổi tên`);
    }
  }
  
  // Check uniqueness
  const taken = await isUsernameTaken(newUsername, uid);
  if (taken) throw new Error('Tên tài khoản đã được sử dụng');
  
  await updateUserDocument(uid, {
    username: newUsername.toLowerCase().trim(),
    lastUsernameChange: serverTimestamp(),
  });
};

/**
 * Sync full learning progress to Firestore
 */
export const syncProgressToFirestore = async (uid, progressData) => {
  await updateUserDocument(uid, {
    exp: progressData.xp || 0,
    level: progressData.level || 1,
    streak: progressData.streak || 0,
    streakLives: progressData.streakLives ?? 3,
    lastStudyDate: progressData.lastStudyDate || null,
    totalQuestionsAnswered: progressData.totalQuestionsAnswered || 0,
    correctAnswersCount: progressData.correctAnswersCount || 0,
    wordsLearnedToday: progressData.wordsLearnedToday || 0,
    wordsLearnedDate: progressData.wordsLearnedDate || null,
    srsData: progressData.srsData || {},
    starred: progressData.starred || {},
    weeklyExp: progressData.weeklyExp || 0,
    title: progressData.title || 'Người mới',
    titleIcon: progressData.titleIcon || '🌱',
    achievements: progressData.achievements || [],
  });
};

/**
 * Load progress from Firestore and merge with localStorage
 */
export const loadProgressFromFirestore = async (uid) => {
  const userDoc = await getUserDocument(uid);
  if (!userDoc) return null;
  
  return {
    xp: userDoc.exp || 0,
    level: userDoc.level || 1,
    streak: userDoc.streak || 0,
    streakLives: userDoc.streakLives ?? 3,
    lastStudyDate: userDoc.lastStudyDate || null,
    totalQuestionsAnswered: userDoc.totalQuestionsAnswered || 0,
    correctAnswersCount: userDoc.correctAnswersCount || 0,
    wordsLearnedToday: userDoc.wordsLearnedToday || 0,
    wordsLearnedDate: userDoc.wordsLearnedDate || null,
    srsData: userDoc.srsData || {},
    starred: userDoc.starred || {},
    weeklyExp: userDoc.weeklyExp || 0,
    title: userDoc.title || 'Người mới',
    titleIcon: userDoc.titleIcon || '🌱',
    achievements: userDoc.achievements || [],
  };
};

// ===== LEADERBOARD OPERATIONS =====

/**
 * Get current season/week string (e.g., '2026-W21')
 */
export const getCurrentSeasonWeek = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
};

/**
 * Get start of current week (Monday 00:00)
 */
export const getWeekStartDate = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

/**
 * Check if weekly reset is needed and perform it
 */
export const checkWeeklyReset = async (uid, userDoc) => {
  const currentWeek = getCurrentSeasonWeek();
  const lastWeek = userDoc.currentWeek || '';
  
  if (currentWeek !== lastWeek) {
    // New week — reset weekly EXP
    await updateUserDocument(uid, {
      weeklyExp: 0,
      weeklyRank: null,
      currentWeek: currentWeek,
    });
    return true;
  }
  return false;
};

/**
 * Get top players for leaderboard
 */
export const getLeaderboard = async (sortBy = 'weeklyExp', maxResults = 50) => {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(
    usersRef,
    orderBy(sortBy, 'desc'),
    limit(maxResults)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc, index) => ({
    ...doc.data(),
    uid: doc.id,
    rank: index + 1,
  }));
};

/**
 * Update user's weekly EXP (called after each study session)
 */
export const addWeeklyExp = async (uid, expGained) => {
  const userDoc = await getUserDocument(uid);
  if (!userDoc) return;
  
  const newWeeklyExp = (userDoc.weeklyExp || 0) + expGained;
  await updateUserDocument(uid, { weeklyExp: newWeeklyExp });
};
