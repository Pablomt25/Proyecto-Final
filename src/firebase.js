// firebase.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDWUlRjUl7xG3SlV8f1knLNO0zTzY1AOz4",
  authDomain: "proyecto-final-4311d.firebaseapp.com",
  projectId: "proyecto-final-4311d",
  storageBucket: "proyecto-final-4311d.appspot.com",
  messagingSenderId: "482848001343",
  appId: "1:482848001343:web:686cf4765335049a3a178a"
};

// Inicializar la aplicación Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Inicializar servicios Firebase
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Exportar instancias para uso en otros archivos
export { auth, db };

// Exportar referencias reutilizables de la base de datos
export const rankingRef = collection(db, 'ranking');
