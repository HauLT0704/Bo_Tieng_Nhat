// Firebase Configuration for Nihongo Hub
// ⚠️ THAY THẾ các giá trị bên dưới bằng config từ Firebase Console của bạn:
// 1. Vào https://console.firebase.google.com
// 2. Tạo project mới hoặc chọn project có sẵn
// 3. Vào Project Settings → General → Your apps → Web app
// 4. Copy config object và paste vào đây

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBNsoTwsVHLfzvtTwvPR44AVt_fXekvaNc",
  authDomain: "bo-tieng-nhat.firebaseapp.com",
  projectId: "bo-tieng-nhat",
  storageBucket: "bo-tieng-nhat.firebasestorage.app",
  messagingSenderId: "825460813755",
  appId: "1:825460813755:web:244cfce310e27e03ca1e9e",
  measurementId: "G-JR8VLZMTH6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore Database
export const db = getFirestore(app);

// Storage (for avatar uploads)
export const storage = getStorage(app);

export default app;
