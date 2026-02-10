import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, signInWithGoogle, signInWithApple, signInGuest, logOut } from '../lib/firebase';
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
      } else {
        // If Firebase has no user, only set to null if we aren't using a local guest
        setCurrentUser(prev => prev?.isLocal ? prev : null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInLocalGuest = (name) => {
    const localUser = {
      uid: 'local-guest',
      displayName: name,
      isAnonymous: true,
      isLocal: true
    };
    setCurrentUser(localUser);
  };

  const logOut = async () => {
    if (currentUser?.isLocal) {
      setCurrentUser(null);
    } else {
      await firebaseSignOut(auth);
    }
  };

  const value = {
    currentUser,
    signInWithGoogle,
    signInWithApple,
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
