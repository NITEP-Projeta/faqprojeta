import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBnAkfzRqk4Xno4ManD5Gh6gj_U1oC6GAI",
  authDomain: "projeta-adm.firebaseapp.com",
  projectId: "projeta-adm",
  storageBucket: "projeta-adm.firebasestorage.app",
  messagingSenderId: "997385076217",
  appId: "1:997385076217:web:20592bae92177f5cf21128"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };