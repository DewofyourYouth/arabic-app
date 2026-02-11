import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  arrayUnion, 
  collection,
  getDocs 
} from 'firebase/firestore';
import combinedCurriculum, { levels as staticLevels } from '../data/curriculum';
import { INITIAL_SRS_STATE } from '../utils/srs';

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [curriculum, setCurriculum] = useState(null); // Should eventually load from DB
  const [loading, setLoading] = useState(true);

  // Load Curriculum (mixed approach for now: Local JSON + DB override possibility)
  useEffect(() => {
    async function fetchCurriculum() {
      // For now, we use the local JSON as the source of truth, 
      // but in the future we can fetch from 'curriculum' collection
      // TODO: Fetch from Firestore if needed
      setCurriculum(combinedCurriculum);
    }
    fetchCurriculum();
  }, []);

  // Sync User Data
  useEffect(() => {
    async function syncUser() {
      if (!currentUser) {
        setUserData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        if (currentUser.isLocal) {
          // Handle local guest data from localStorage
          const localData = localStorage.getItem(`guest_data_${currentUser.uid}`);
          if (localData) {
            setUserData(JSON.parse(localData));
          } else {
            // Initialize new guest data
            const newGuestData = {
              stats: { totalXP: 0, currentLevel: 1, currentStreak: 0 },
              progress: {}
            };
            setUserData(newGuestData);
            localStorage.setItem(`guest_data_${currentUser.uid}`, JSON.stringify(newGuestData));
          }
        } else {
          // Handle Firebase User
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            // Create new user document
            const newUserData = {
              profile: {
                displayName: currentUser.displayName,
                email: currentUser.email,
                photoURL: currentUser.photoURL,
                joinDate: new Date().toISOString()
              },
              stats: {
                totalXP: 0,
                currentLevel: 1,
                currentStreak: 0,
                lastPracticeDate: null
              },
              settings: {
                dailyGoal: 50,
                soundEnabled: true
              },
              progress: {}, // Map of nodeId -> { status, stars, masteryScore, srs }
              hasCompletedOnboarding: false // Track onboarding status
            };
            
            // Check for previous guest data to merge?
            const localGuest = localStorage.getItem('localGuest');
            if (localGuest) {
               // Logic to merge guest data could go here
               // For now we just create fresh
            }

            await setDoc(userRef, newUserData);
            setUserData(newUserData);
          }
        }
      } catch (err) {
        console.error("Error syncing user data:", err);
      } finally {
        setLoading(false);
      }
    }

    syncUser();
  }, [currentUser]);

  // Actions
  const updateUserXP = async (amount) => {
    if (!currentUser) return;
    
    // Optimistic Update
    setUserData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalXP: (prev.stats?.totalXP || 0) + amount
      }
    }));

    if (currentUser.isLocal) {
      const currentData = JSON.parse(localStorage.getItem(`guest_data_${currentUser.uid}`) || '{}');
      const newStats = {
        ...currentData.stats,
        totalXP: (currentData.stats?.totalXP || 0) + amount
      };
      const newData = { ...currentData, stats: newStats };
      localStorage.setItem(`guest_data_${currentUser.uid}`, JSON.stringify(newData));
    } else {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        'stats.totalXP': increment(amount)
      });
    }
  };

  const completeLesson = async (nodeId, resultData, srsData) => {
     // resultData: { stars, score }
     // srsData: { interval, repetition, ef, dueDate }
     if (!currentUser) return;
     
     // 1. Calculate XP based on stats (if not provided in resultData)
     const xpEarned = resultData.score || 0; 

     // 2. Update Progress
     const completionData = {
       status: 'completed',
       stars: resultData.stars || 0,
       masteryScore: resultData.score || 0,
       lastCompleted: new Date().toISOString(),
       srs: srsData // Store SRS state
     };

     // Optimistic
     setUserData(prev => ({
       ...prev,
       stats: {
          ...prev.stats,
          totalXP: (prev.stats?.totalXP || 0) + xpEarned
       },
       progress: {
         ...prev.progress,
         [nodeId]: completionData
       }
     }));

     if (currentUser.isLocal) {
       const key = `guest_data_${currentUser.uid}`;
       const data = JSON.parse(localStorage.getItem(key) || '{}');
       
       data.stats = { 
         ...data.stats, 
         totalXP: (data.stats?.totalXP || 0) + xpEarned 
       };
       data.progress = { 
         ...data.progress, 
         [nodeId]: completionData 
       };
       
       localStorage.setItem(key, JSON.stringify(data));
     } else {
       const userRef = doc(db, 'users', currentUser.uid);
       await updateDoc(userRef, {
         'stats.totalXP': increment(xpEarned),
         [`progress.${nodeId}`]: completionData
       });
     }
  };

  const completeOnboarding = async () => {
    if (!currentUser) return;
    
    // Optimistic Update
    setUserData(prev => ({ ...prev, hasCompletedOnboarding: true }));

    if (currentUser.isLocal) {
      const key = `guest_data_${currentUser.uid}`;
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      data.hasCompletedOnboarding = true;
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        hasCompletedOnboarding: true
      });
    }
  };

  // Derived State: All Cards with User Progress embedded
  const allCards = useMemo(() => {
    if (!curriculum) return [];
    return curriculum.map((card, index) => {
        // Ensure ID logic matches App.jsx for now
        const cardId = card.id || `card-${index}`;
        const userProgress = userData?.progress?.[cardId];
        
        return {
            ...card,
            id: cardId,
            srs: userProgress?.srs || INITIAL_SRS_STATE,
            // We can also attach mastery/stars here if needed for UI
            mastery: userProgress?.masteryScore || 0
        };
    });
  }, [curriculum, userData]);

  // Derived State: Levels with Progress
  const levels = useMemo(() => {
    // Import the static levels structure (we need to import it at the top, or access it from the module)
    // Since we can't easily change imports inside this function, we'll assume it's available or passed in.
    // Ideally, we imported { levels as staticLevels } from '../data/curriculum';
    
    // For now, let's access it from the imported module if possible, or just re-import it at top of file. 
    // Wait, I need to update the import statement first. 
    // Let's assume I updated the import to: import combinedCurriculum, { levels as staticLevels } from '../data/curriculum';
    
    if (!staticLevels) return [];

    return staticLevels.map(level => {
      const content = level.content || [];
      const totalItems = content.length;
      let learnedItems = 0;
      let masterItems = 0;

      content.forEach(item => {
        const itemProgress = userData?.progress?.[item.id];
        if (itemProgress?.srs?.repetition > 0) learnedItems++;
        if (itemProgress?.srs?.repetition >= 5) masterItems++; // Arbitrary "Master" threshold
      });

      const progress = totalItems > 0 ? Math.round((learnedItems / totalItems) * 100) : 0;
      const isUnlocked = level.id === 1 || (userData?.stats?.currentLevel >= level.id) || (userData?.levels?.[level.id - 1]?.isComplete); 
      // Simple unlock logic for now: Level 1 always open. 
      // Or maybe check if previous level is > 80% done?
      // Let's stick to simple logic: unlocked if previous level has > X% progress?
      // For now, let's just say everything is unlocked or use the userLevel prop.
      
      return {
        ...level,
        stats: {
          total: totalItems,
          learned: learnedItems,
          master: masterItems,
          progress: progress
        },
        isUnlocked: true // defaulting to true for now, can refine later
      };
    });
  }, [userData]);

  const value = {
    userData,
    curriculum,
    levels, // Export the levels with progress
    loading,
    updateUserXP,
    completeLesson,
    completeOnboarding,
    allCards
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
