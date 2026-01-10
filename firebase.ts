
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// @google/genai guidelines: Use environment variables for API keys when needed.
// Firebase configuration for the application.
const firebaseConfig = {
  apiKey: "AIzaSyARMNduuHSFEAnAQJOsjkfJhLhm4Ol9U9M",
  authDomain: "my-shop-f64d1.firebaseapp.com",
  projectId: "my-shop-f64d1",
  storageBucket: "my-shop-f64d1.firebasestorage.app",
  messagingSenderId: "993864918356",
  appId: "1:993864918356:web:e95378a68984177fbe14c1",
  measurementId: "G-TM5GG0X03M"
};

// Initialize Firebase using the modern modular SDK (v9+).
const app = initializeApp(firebaseConfig);

// Initialize and export services using modular patterns.
export const auth = getAuth(app);
export const db = getFirestore(app);
