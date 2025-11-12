import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAU-meaR5MZQDIa-wVqaKhE8-SQWkE0Lv8",
  authDomain: "civicgpt-37e2b.firebaseapp.com",
  projectId: "civicgpt-37e2b",
  storageBucket: "civicgpt-37e2b.firebasestorage.app",
  messagingSenderId: "376178763239",
  appId: "1:376178763239:web:a74441fa848a88472bc942"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);


export const db = getFirestore(app);


export const storage = getStorage(app);

export default app;