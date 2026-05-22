// Authentication Context for Nihongo Hub
// Provides auth state and methods across the entire app

import React, { createContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebaseConfig';
import {
  createUserDocument,
  getUserDocument,
  updateUserDocument,
  isUsernameTaken,
  loadProgressFromFirestore,
  syncProgressToFirestore,
  checkWeeklyReset,
} from '../firebase/firestoreService';

export const AuthContext = createContext(null);

// Rate limit tracker
const loginAttempts = { count: 0, lastAttempt: 0 };
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Try to load from cache first for instant UI
          const cachedProfile = localStorage.getItem(`profile_${user.uid}`);
          if (cachedProfile) {
            setUserProfile(JSON.parse(cachedProfile));
            setLoading(false); // Stop loading immediately if we have cache
          }

          // Load user profile from Firestore
          let profile = await getUserDocument(user.uid);
          
          if (!profile) {
            // First time — create user document
            const providerData = user.providerData[0];
            let authProvider = 'email';
            if (providerData?.providerId === 'google.com') authProvider = 'google';

            profile = await createUserDocument(user.uid, {
              username: user.displayName?.toLowerCase().replace(/\s+/g, '_') || `user_${user.uid.slice(0, 8)}`,
              displayName: user.displayName || 'Người học mới',
              email: user.email || '',
              avatar: user.photoURL || '',
              authProvider,
              emailVerified: user.emailVerified
            });
          } else {
             // Update emailVerified status if it changed
             if (profile.emailVerified !== user.emailVerified) {
                await updateUserDocument(user.uid, { emailVerified: user.emailVerified });
                profile.emailVerified = user.emailVerified;
             }
          }
          
          // Check weekly reset
          await checkWeeklyReset(user.uid, profile);
          
          setUserProfile(profile);
          localStorage.setItem(`profile_${user.uid}`, JSON.stringify(profile));
        } catch (err) {
          console.error('Error loading user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ===== AUTH METHODS =====

  const checkRateLimit = () => {
    const now = Date.now();
    if (now - loginAttempts.lastAttempt > LOCKOUT_MS) {
      loginAttempts.count = 0;
    }
    
    if (loginAttempts.count >= MAX_LOGIN_ATTEMPTS) {
      const remaining = Math.ceil((LOCKOUT_MS - (now - loginAttempts.lastAttempt)) / 1000 / 60);
      throw new Error(`Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau ${remaining} phút.`);
    }
    
    loginAttempts.count++;
    loginAttempts.lastAttempt = now;
  };

  const signup = async (email, password, userData) => {
    setAuthError(null);
    
    try {
      if (userData.username) {
        const taken = await isUsernameTaken(userData.username);
        if (taken) {
          throw new Error('Tên tài khoản đã được sử dụng bởi người khác');
        }
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userData.displayName) {
        await fbUpdateProfile(result.user, { displayName: userData.displayName });
      }

      // Send verification email
      await sendEmailVerification(result.user);
      
      const profile = await createUserDocument(result.user.uid, {
        ...userData,
        email: result.user.email,
        authProvider: 'email',
        emailVerified: false
      });
      
      setUserProfile(profile);
      localStorage.setItem(`profile_${result.user.uid}`, JSON.stringify(profile));
      loginAttempts.count = 0;
      
      return result.user;
    } catch (err) {
      const message = getVietnameseError(err.code || err.message);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const login = async (email, password) => {
    setAuthError(null);
    
    try {
      checkRateLimit();
      const result = await signInWithEmailAndPassword(auth, email, password);
      loginAttempts.count = 0;
      return result.user;
    } catch (err) {
      const message = getVietnameseError(err.code || err.message);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      let profile = await getUserDocument(result.user.uid);
      
      if (!profile) {
        profile = await createUserDocument(result.user.uid, {
          username: (result.user.displayName?.toLowerCase().replace(/\s+/g, '_') || '') + '_' + Math.random().toString(36).slice(2, 6),
          displayName: result.user.displayName || 'Người học mới',
          email: result.user.email || '',
          avatar: result.user.photoURL || '',
          authProvider: 'google',
          emailVerified: true // Google accounts are implicitly verified
        });
      }
      
      setUserProfile(profile);
      localStorage.setItem(`profile_${result.user.uid}`, JSON.stringify(profile));
      loginAttempts.count = 0;
      
      return result.user;
    } catch (err) {
      const message = getVietnameseError(err.code || err.message);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      if (currentUser) {
         localStorage.removeItem(`profile_${currentUser.uid}`);
      }
      await signOut(auth);
      setUserProfile(null);
      setAuthError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return;
    
    try {
      await updateUserDocument(currentUser.uid, updates);
      setUserProfile(prev => {
        const newProfile = { ...prev, ...updates };
        localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(newProfile));
        return newProfile;
      });
    } catch (err) {
      console.error('Update profile error:', err);
      throw err;
    }
  };

  const syncProgress = async (progressData) => {
    if (!currentUser) return;
    try {
      await syncProgressToFirestore(currentUser.uid, progressData);
    } catch (err) {
      console.error('Sync progress error:', err);
    }
  };

  const loadProgress = async () => {
    if (!currentUser) return null;
    try {
      return await loadProgressFromFirestore(currentUser.uid);
    } catch (err) {
      console.error('Load progress error:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    try {
      const profile = await getUserDocument(currentUser.uid);
      if (profile) {
        setUserProfile(profile);
        localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(profile));
      }
    } catch (err) {
      console.error('Refresh profile error:', err);
    }
  };

  const resendVerificationEmail = async () => {
    if (currentUser && !currentUser.emailVerified) {
       await sendEmailVerification(currentUser);
       return true;
    }
    return false;
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    authError,
    setAuthError,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateProfile,
    syncProgress,
    loadProgress,
    refreshProfile,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ===== HELPER: Vietnamese Error Messages =====
function getVietnameseError(code) {
  const errors = {
    'auth/email-already-in-use': 'Email này đã được đăng ký. Hãy thử đăng nhập.',
    'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
    'auth/operation-not-allowed': 'Phương thức đăng nhập này chưa được bật.',
    'auth/weak-password': 'Mật khẩu quá yếu. Cần tối thiểu 8 ký tự.',
    'auth/user-disabled': 'Tài khoản đã bị khóa. Liên hệ admin.',
    'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
    'auth/wrong-password': 'Sai mật khẩu. Vui lòng thử lại.',
    'auth/invalid-credential': 'Thông tin đăng nhập không hợp lệ.',
    'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng đợi vài phút.',
    'auth/popup-closed-by-user': 'Cửa sổ đăng nhập Google đã bị đóng.',
    'auth/cancelled-popup-request': 'Đã hủy yêu cầu đăng nhập.',
    'auth/network-request-failed': 'Lỗi mạng. Kiểm tra kết nối internet.',
    'auth/configuration-not-found': 'Lỗi cấu hình Firebase Auth.',
    'auth/internal-error': 'Lỗi hệ thống Firebase.',
    'auth/unverified-email': 'Email chưa được xác minh.',
  };
  return errors[code] || code || 'Đã xảy ra lỗi. Vui lòng thử lại.';
}
