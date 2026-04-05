import { initializeApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBY9pUyfpMWCMEHzy17JPODfbfAQgwoI4c",
  authDomain: "app-source-code-ff37f.firebaseapp.com",
  projectId: "app-source-code-ff37f",
  storageBucket: "app-source-code-ff37f.firebasestorage.app",
  messagingSenderId: "607341129152",
  appId: "1:607341129152:web:bd155cc5fe9d7505fe6c25",
  measurementId: "G-GW1RRQM8R9",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

let analytics: Analytics | undefined;

if (typeof window !== "undefined" && typeof window.navigator !== "undefined") {
  analytics = getAnalytics(app);
}
const db = getFirestore(app);

export { app, auth, analytics, db };
