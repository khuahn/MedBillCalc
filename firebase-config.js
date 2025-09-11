// firebase-config.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSDx9lm723jQhYSTZGnItXisPrdf2zDTM",
  authDomain: "medbillcalc-analytics.firebaseapp.com",
  projectId: "medbillcalc-analytics",
  storageBucket: "medbillcalc-analytics.firebasestorage.app",
  messagingSenderId: "844810228926",
  appId: "1:844810228926:web:42d3d33f5bd772ac847aef",
  measurementId: "G-FCLEBTRM75"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Make db available globally
window.db = db;
