import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, signInWithGoogle, /* signInWithApple, */ signInGuest, logOut } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If we have a user from Firebase, use it.
      if (user) {
        setCurrentUser(user);
        // Clear local guest if we have a real user
        localStorage.removeItem('localGuest');
      } else {
        // If Firebase has no user, check for local guest
        const localGuest = localStorage.getItem('localGuest');
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

  const signInLocalGuest = (name) => {
    const localUser = {
      uid: 'local-guest-' + Date.now(), // Unique-ish ID
      displayName: name,
      isAnonymous: true,
      isLocal: true
    };
    setCurrentUser(localUser);
    localStorage.setItem('localGuest', JSON.stringify(localUser));
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
