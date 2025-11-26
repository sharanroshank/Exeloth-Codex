// assets/js/firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyC54Roaz8Eu9Oe4XnXMnGu3bbIfCH4vPrg",
  authDomain: "exeloth-codex-885f2.firebaseapp.com",
  projectId: "exeloth-codex-885f2",
  storageBucket: "exeloth-codex-885f2.firebasestorage.app",
  messagingSenderId: "157897094964",
  appId: "1:157897094964:web:907fc2e5b1a0d4ace4d761",
  measurementId: "G-DZLKRQD8F5"
};

// Initialize Firebase dengan COMPAT version
if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase services - COMPAT version
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();