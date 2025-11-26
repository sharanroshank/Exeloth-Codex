// assets/js/firebase-config.js (template - akan di-inject)
const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY_PLACEHOLDER", // Akan diganti build time
  authDomain: "exeloth-codex-885f2.firebaseapp.com",
  projectId: "exeloth-codex-885f2",
  storageBucket: "exeloth-codex-885f2.firebasestorage.app",
  messagingSenderId: "157897094964",
  appId: "1:157897094964:web:907fc2e5b1a0d4ace4d761",
  measurementId: "G-DZLKRQD8F5"
};

// Initialize Firebase
if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();