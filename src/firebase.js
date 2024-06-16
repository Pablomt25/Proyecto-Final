import { initializeApp } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC9kR9dgCwggvaShNa7UGKRvwk0C_-cer4",
  authDomain: "proyecto-final-6e3e3.firebaseapp.com",
  projectId: "proyecto-final-6e3e3",
  storageBucket: "proyecto-final-6e3e3.appspot.com",
  messagingSenderId: "838268033765",
  appId: "1:838268033765:web:397973ff2666378306920c"
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export { auth, db };

export const rankingRef = collection(db, 'ranking');
