// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0c3B26bYXRbivPteHUOWdesQl1x44BQI",
  authDomain: "aimen-eec8a.firebaseapp.com",
  projectId: "aimen-eec8a",
  storageBucket: "aimen-eec8a.firebasestorage.app",
  messagingSenderId: "10081341285",
  appId: "1:10081341285:web:33050f0340584a75a2db8c",
  measurementId: "G-8DR4K0WSMM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
