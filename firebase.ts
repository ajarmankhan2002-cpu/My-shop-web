import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Firebase configuration for the application
const firebaseConfig = {
  apiKey: "AIzaSyARMNduuH5FEAnAQJOvjkfJhLhm4D19U9M",
  authDomain: "my-shop-f64d1.firebaseapp.com",
  projectId: "my-shop-f64d1",
  storageBucket: "my-shop-f64d1.firebasestorage.com",
  messagingSenderId: "993864918356",
  appId: "1:993864918356:web:e95378a68984177fbe14c1",
  measurementId: "G-TMSSGOX03W"
};

// Initialize Firebase using the singleton pattern
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export initialized services
export const auth = getAuth(app);
export const db = getFirestore(app);
