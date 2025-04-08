import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Suas configurações do Firebase aqui
const firebaseConfig = {
  apiKey: "AIzaSyCVY3o5A8tUNX6lZ8ravRaRsSC1c1oBB5w",
  authDomain: "taskup-bd.firebaseapp.com",
  projectId: "taskup-bd",
  storageBucket: "taskup-bd.firebasestorage.app",
  messagingSenderId: "536103398154",
  appId: "1:536103398154:web:96053d53c495deaba0e8f3",
  measurementId: "G-HJXV8CY5PS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
export default { db, storage }; 