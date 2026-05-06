
// @ts-ignore - fix for exported member error
import { initializeApp } from "firebase/app";
// @ts-ignore - fix for exported member error
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyCyUYSsXMA8nWl_jaMUgbYvLHYGobJ_u5c",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "bis-smart-grader.firebaseapp.com",
  databaseURL: "https://bis-smart-grader-default-rtdb.firebaseio.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "bis-smart-grader",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "bis-smart-grader.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "340118520108",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:340118520108:web:67991844ab289111576c89",
  measurementId: "G-ZL5P4YPHJN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
