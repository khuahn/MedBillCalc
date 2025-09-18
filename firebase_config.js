// firebase-config.js (CDN version)
// Load Firebase using script tags in HTML instead of imports

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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Make db available globally
window.db = db;
