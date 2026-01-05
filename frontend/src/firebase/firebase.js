import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAkHCIepZPdakIwJXKUh_UyppmP1Y62Qcc",
  authDomain: "civicgpt-b45f9.firebaseapp.com",
  projectId: "civicgpt-b45f9",
  storageBucket: "civicgpt-b45f9.firebasestorage.app",
  messagingSenderId: "108576384930",
  appId: "1:108576384930:web:fb4db1984ccaf7a4f234fb"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);


export const db = getFirestore(app);


export const storage = getStorage(app);

export default app;