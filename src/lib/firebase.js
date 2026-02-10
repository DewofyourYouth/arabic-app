import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut
} from "firebase/auth";

// TODO: Replace with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
// export const appleProvider = new OAuthProvider('apple.com');
// Discord is usually handled via OIDC or custom provider, but for now we'll stick to Google/Apple/Anon
// If you want Discord, you'd add an OIDC provider or use a 3rd party extension. 
// For this implementation plan, we will stick to Google/Apple/Guest.

// Auth Helpers
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
// export const signInWithApple = () => signInWithPopup(auth, appleProvider);
export const signInGuest = () => signInAnonymously(auth);
export const logOut = () => firebaseSignOut(auth);
