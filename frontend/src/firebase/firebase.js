import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAH25lXVxOIVKL_wdZ0eGFmdhkT-kNP93c",
  authDomain: "evalai-bc473.firebaseapp.com",
  projectId: "evalai-bc473",
  storageBucket: "evalai-bc473.firebasestorage.app",
  messagingSenderId: "149356729453",
  appId: "1:149356729453:web:a00f4ca90e62c640f6db64"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);


export const db = getFirestore(app);


export const storage = getStorage(app);

export default app;