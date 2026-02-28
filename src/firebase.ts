import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ضروري للـ usePersistence

const firebaseConfig = {
  apiKey: "AIzaSyC0c3B26bYXRbivPteHUOWdesQ1lx44BQI",
  authDomain: "aimen-eec8a.firebaseapp.com",
  projectId: "aimen-eec8a",
  storageBucket: "aimen-eec8a.firebasestorage.app",
  messagingSenderId: "10081341285",
  appId: "1:10081341285:web:33050f0340584a75a2db8c",
  measurementId: "G-8DR4K0WSMM"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// تصدير قاعدة البيانات لحل مشكلة الـ Build
export const db = getFirestore(app); 

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("تم تسجيل الدخول:", result.user.displayName);
    return result.user;
  } catch (error) {
    console.error("حدث خطأ أثناء تسجيل الدخول:", error);
  }
};
