import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, signInWithGoogle, /* signInWithApple, */ signInGuest } from '../lib/firebase';
import { trackSignUp } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("AuthContext: Auth State Changed", user ? user.uid : 'No User');
      // If we have a user from Firebase, use it.
      if (user) {
        setCurrentUser(user);
        // Clear local guest if we have a real user
        localStorage.removeItem('localGuest');
        
        // Track new user sign-up (only on first sign-in)
        const isNewUser = user.metadata?.creationTime === user.metadata?.lastSignInTime;
        if (isNewUser) {
          const method = user.isAnonymous ? 'guest' : 'google';
          trackSignUp(method);
        }
      } else {
        // If Firebase has no user, check for local guest
        const localGuest = localStorage.getItem('localGuest');
        console.log("AuthContext: Checking local guest", localGuest);
        if (localGuest) {
          try {
            setCurrentUser(JSON.parse(localGuest));
          } catch (e) {
            console.error("Failed to parse local guest", e);
            localStorage.removeItem('localGuest');
            setCurrentUser(null);
          }
        } else {
           setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Safety fallback: if Firebase doesn't respond in 3 seconds, stop loading
  useEffect(() => {
    const timer = setTimeout(() => {
        if (loading) {
            console.warn("AuthContext: Firebase auth timed out, forcing load completion.");
            setLoading(false);
        }
    }, 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  const signInLocalGuest = (name) => {
    const localUser = {
      uid: 'local-guest-' + Date.now(), // Unique-ish ID
      displayName: name,
      isAnonymous: true,
      isLocal: true
    };
    setCurrentUser(localUser);
    localStorage.setItem('localGuest', JSON.stringify(localUser));
    
    // Track local guest sign-up
    trackSignUp('local_guest');
  };

  const logOut = async () => {
    if (currentUser?.isLocal) {
      setCurrentUser(null);
      localStorage.removeItem('localGuest');
    } else {
      await firebaseSignOut(auth);
      // Ensure local guest is also cleared just in case
      localStorage.removeItem('localGuest');
    }
  };

  const value = {
    currentUser,
    signInWithGoogle,
    // signInWithApple,
    signInGuest,
    signInLocalGuest,
    logOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
