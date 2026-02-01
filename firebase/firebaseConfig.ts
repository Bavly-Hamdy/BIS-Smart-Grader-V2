
// @ts-ignore - fix for exported member error
import { initializeApp } from "firebase/app";
// @ts-ignore - fix for exported member error
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCyUYSsXMA8nWl_jaMUgbYvLHYGobJ_u5c",
  authDomain: "bis-smart-grader.firebaseapp.com",
  databaseURL: "https://bis-smart-grader-default-rtdb.firebaseio.com",
  projectId: "bis-smart-grader",
  storageBucket: "bis-smart-grader.firebasestorage.app",
  messagingSenderId: "340118520108",
  appId: "1:340118520108:web:67991844ab289111576c89",
  measurementId: "G-ZL5P4YPHJN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
