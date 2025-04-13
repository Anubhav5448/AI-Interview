import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMp6EiSYz9OCLcgvKZJ5kGriRINuszYzI",
  authDomain: "prepwise-275f3.firebaseapp.com",
  projectId: "prepwise-275f3",
  storageBucket: "prepwise-275f3.firebasestorage.app",
  messagingSenderId: "1066024584350",
  appId: "1:1066024584350:web:2cf675799920812aa1a78f",
  measurementId: "G-SVRXBCS8H3"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
