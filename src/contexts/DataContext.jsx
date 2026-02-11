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
  const [curriculum, setCurriculum] = useState(null); 
  const [levelsData, setLevelsData] = useState(null); // Store structured levels
  const [loading, setLoading] = useState(true);

  // Helper to flatten levels back into combined array for old components
  const combinedCurriculumFromLevels = (levelsArr) => {
    if (!levelsArr) return [];
    return levelsArr.flatMap(l => l.content || []);
  };

  // Load Curriculum (Stale-While-Revalidate Strategy)
  useEffect(() => {
    async function fetchCurriculum() {
      try {
        console.log("DataContext: Fetching curriculum...");
        // 1. Load from Local Storage first (fast render)
        const localData = localStorage.getItem('curriculum_cache');
        const localMetadata = localStorage.getItem('curriculum_metadata');
        
        console.log("DataContext: staticLevels available:", !!staticLevels);

        let currentLevels = staticLevels || []; // Default to static JSON
        let localVersion = 0;

        if (localData) {
          try {
            currentLevels = JSON.parse(localData);
          } catch (e) {
            console.error("Error parsing local curriculum cache:", e);
          }
        }
        
        // Initialize state with best available data (Static or Cache)
        setLevelsData(currentLevels);
        setCurriculum(combinedCurriculumFromLevels(currentLevels));

        if (localMetadata) {
          try {
            localVersion = JSON.parse(localMetadata).version || 0;
          } catch (e) {
            console.error("Error parsing local metadata:", e);
          }
        }

        // 2. Check Remote Version
        const metadataRef = doc(db, 'published_curriculum', 'metadata');
        const metadataSnap = await getDoc(metadataRef);

        if (metadataSnap.exists()) {
          const remoteMetadata = metadataSnap.data();
          const remoteVersion = remoteMetadata.version || 0;

          if (remoteVersion > localVersion || !localData) {
            console.log("New curriculum version found. Fetching updates...");
            
            // 3. Fetch published bundles
            const supportedLevels = remoteMetadata.supportedLevels || [1];
            const newLevels = [];
            
            // Fetch all level bundles in parallel
            const promises = supportedLevels.map(lvl => getDoc(doc(db, 'published_curriculum', `level_${lvl}`)));
            const levelSnaps = await Promise.all(promises);
            
            // Process bundles
            // We need to merge this data into the structured 'levels' object (titles/descriptions)
            // For now, we are recreating the 'level objects' based on the file data?
            // Actually, we should pull the base structure from staticLevels and just update content.
            
            const fetchedContentByLevel = {}; // { 1: [items], 2: [items] }
            
            levelSnaps.forEach(snap => {
                if (snap.exists()) {
                    const data = snap.data();
                    fetchedContentByLevel[data.level] = data.items || [];
                }
            });

            // Construct the full levels array (merging static config with dynamic content)
            const reconstructedLevels = staticLevels.map(staticLvl => ({
                ...staticLvl,
                content: fetchedContentByLevel[staticLvl.id] || staticLvl.content // Fallback to static if missing
            }));

            // 4. Update State & Cache
            setLevelsData(reconstructedLevels);
            setCurriculum(combinedCurriculumFromLevels(reconstructedLevels));
            
            localStorage.setItem('curriculum_cache', JSON.stringify(reconstructedLevels));
            localStorage.setItem('curriculum_metadata', JSON.stringify(remoteMetadata));
            console.log("Curriculum updated.");
          } else {
            console.log("Curriculum is up to date.");
          }
        }
      } catch (error) {
        console.error("Error fetching curriculum:", error);
      }
    }
    fetchCurriculum();
  }, []);

  // Sync User Data
  useEffect(() => {
    async function syncUser() {
      console.log("DataContext: userData available:", !!userData);
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
    // Determine which source of levels to use
    // If we have fetched levels (from Firestore or Cache) which we likely haven't stored in a separate state yet...
    // Actually, let's reconstruct levels from the flat `curriculum` if possible, OR better, let's just use the staticLevels as a base 
    // IF we assume structure doesn't change much. 
    // BUT the goal is dynamic updates.
    
    // To support dynamic levels properly, I should have stored the levels array in state.
    // Since I didn't add a new state variable in the previous step, I'll rely on `curriculum` (flat) to populate the content, 
    // but I need the Level Title/Descriptions.
    
    // RETROACTIVE FIX: The best way without adding more state complexity right now is to 
    // map the staticLevels but REPLACE their content with what's in `curriculum` matching that level ID.
    // This assumes level metadata (titles) don't change often, or accept that they are static for now 
    // UNLESS I parse the local storage again here which is bad.
    
    // ALTERNATIVE: I will add `levelsData` state in a separate edit blocks.
    // For now, let's assume `levelsData` exists in scope (I will add it).
    
    const baseLevels = levelsData || staticLevels;

    if (!baseLevels) return [];

    return baseLevels.map(level => {
      // If we are using dynamic data, 'level.content' is already updated.
      // If we are using staticLevels, we might want to check if 'curriculum' has updates?
      // Actually, if I update `levelsData` in the effect, then `baseLevels` will be the new data.
      
      const content = level.content || [];
      const totalItems = content.length;
      let learnedItems = 0;
      let masterItems = 0;

      content.forEach(item => {
        const itemProgress = userData?.progress?.[item.id];
        if (itemProgress?.srs?.repetition > 0) learnedItems++;
        if (itemProgress?.srs?.repetition >= 5) masterItems++; 
      });

      const progress = totalItems > 0 ? Math.round((learnedItems / totalItems) * 100) : 0;
      
      return {
        ...level,
        stats: {
          total: totalItems,
          learned: learnedItems,
          master: masterItems,
          progress: progress
        },
        isUnlocked: true 
      };
    });
  }, [userData, levelsData]);

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
