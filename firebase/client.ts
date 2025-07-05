// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUne_oIZPj6F48fIdEqyVCbtqyDrADGF8",
  authDomain: "prepared-1d9b3.firebaseapp.com",
  projectId: "prepared-1d9b3",
  storageBucket: "prepared-1d9b3.firebasestorage.app",
  messagingSenderId: "383090776382",
  appId: "1:383090776382:web:a0a6670900a246015b346f",
  measurementId: "G-GYQ15KRL26"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app) 
export const db = getFirestore(app)