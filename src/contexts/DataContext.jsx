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
import combinedCurriculum, { levels as staticLevels, learningPath } from '../data/curriculum';
import { CITIES } from '../data/artifacts';
import { INITIAL_SRS_STATE } from '../utils/srs';

const DataContext = createContext();

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    console.error("useData must be used within a DataProvider");
    // We intentionally return undefined here to let it throw, or we could return null.
    // But logging helps us verify if context is missing.
    console.log("DataContext check:", DataContext);
  }
  return context;
}

export function DataProvider({ children }) {
  console.log("DataProvider: Mounting...");
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
        const CACHE_KEY = 'curriculum_cache_v2'; // Bumped version to force Hebrew updates
        const localData = localStorage.getItem(CACHE_KEY);
        const localMetadata = localStorage.getItem('curriculum_metadata');

        // Default to static JSON
        let currentLevels = staticLevels || [];
        let localVersion = 0;

        if (localData) {
          try {
            currentLevels = JSON.parse(localData);
          } catch (e) {
            console.error("Error parsing local curriculum cache:", e);
          }
        }

        // Initialize state with best available data
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

            // Fetch all level bundles in parallel
            const promises = supportedLevels.map(lvl => getDoc(doc(db, 'published_curriculum', `level_${lvl}`)));
            const levelSnaps = await Promise.all(promises);

            const fetchedContentByLevel = {}; // { 1: [items], 2: [items] }

            levelSnaps.forEach(snap => {
              if (snap.exists()) {
                const data = snap.data();
                fetchedContentByLevel[data.level] = data.items || [];
              }
            });

            // Reconstruct levels
            const reconstructedLevels = staticLevels.map(staticLvl => ({
              ...staticLvl,
              content: fetchedContentByLevel[staticLvl.id] || staticLvl.content
            }));

            // 4. Update State & Cache
            setLevelsData(reconstructedLevels);
            setCurriculum(combinedCurriculumFromLevels(reconstructedLevels));

            localStorage.setItem('curriculum_cache_v2', JSON.stringify(reconstructedLevels));
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
              progress: {},
              artifacts: []
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
              artifacts: [],
              hasCompletedOnboarding: false // Track onboarding status
            };

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
    if (!currentUser) return;

    const xpEarned = resultData.score || 0;

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
    // PREFER learningPath if available as it has the latest structure and locationIds
    if (learningPath) {
      return learningPath.flatMap(loc =>
        loc.content.map(card => {
          const cardId = card.id;
          const userProgress = userData?.progress?.[cardId];
          return {
            ...card,
            id: cardId,
            locationId: loc.id, // Ensure locationId is explicit
            srs: userProgress?.srs || INITIAL_SRS_STATE,
            mastery: userProgress?.masteryScore || 0
          };
        })
      );
    }

    if (!curriculum) return [];
    return curriculum.map((card, index) => {
      const cardId = card.id || `card-${index}`;
      const userProgress = userData?.progress?.[cardId];

      return {
        ...card,
        id: cardId,
        srs: userProgress?.srs || INITIAL_SRS_STATE,
        mastery: userProgress?.masteryScore || 0
      };
    });
  }, [curriculum, userData]);

  // Derived State: Locations (Themed Progression)
  const locations = useMemo(() => {
    if (!learningPath) return [];

    let previousLocationQualified = true; // First location is always unlocked

    return learningPath.map((location, index) => {
      const content = location.content || [];
      const totalItems = content.length;
      let learnedItems = 0;
      let masterItems = 0;

      content.forEach(item => {
        const itemProgress = userData?.progress?.[item.id];

        // "Learned" = User has seen it at least once (repetition > 0)
        if (itemProgress?.srs?.repetition > 0) learnedItems++;

        // "Mastered" = User has reviewed it a few times (repetition >= 3)
        if (itemProgress?.srs?.repetition >= 3) masterItems++;
      });

      const progress = totalItems > 0 ? Math.round((learnedItems / totalItems) * 100) : 0;
      const masteryPercentage = totalItems > 0 ? (masterItems / totalItems) : 0;

      const isMastered = totalItems > 0 && masterItems >= totalItems; // 100% Mastered (Gold Star)
      // Unlock Logic: 100% Learned (Seen/Practiced at least once)
      // This allows "binging" content without waiting for SRS days.
      const isQualified = totalItems > 0 && learnedItems >= totalItems;

      // Unlocking Logic: Current is unlocked if Previous was Qualified (50%+)
      const isUnlocked = previousLocationQualified && (userData?.stats?.totalXP || 0) >= (location.minXP || 0);

      // Pass qualification to next iteration
      previousLocationQualified = isQualified;

      // Merge with static artifact data
      const staticCityData = CITIES.find(c => c.id === location.id);

      return {
        ...location,
        ...staticCityData, // Merge artifact, coordinates, extra descriptions
        stats: {
          total: totalItems,
          learned: learnedItems,
          mastered: masterItems,
          progress: progress,
          masteryPercentage: Math.round(masteryPercentage * 100)
        },
        isUnlocked,
        isMastered
      };
    });
  }, [userData]);


  // Derived State: Levels with Progress (Legacy / Alternative View)
  const levels = useMemo(() => {
    const baseLevels = levelsData || staticLevels;
    if (!baseLevels) return [];

    return baseLevels.map(level => {
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

  // Sync unlocked artifacts
  useEffect(() => {
    if (!userData || !locations) return;

    const userArtifacts = userData.artifacts || [];
    const newArtifacts = [];

    locations.forEach(loc => {
      // If location is unlocked, they must have the artifact
      if (loc.isUnlocked) {
        if (!userArtifacts.includes(loc.id)) {
          newArtifacts.push(loc.id);
        }
      }
    });

    if (newArtifacts.length > 0) {
      console.log("Unlocking Copied Artifacts:", newArtifacts);

      // Optimistic Update
      setUserData(prev => ({
        ...prev,
        artifacts: [...(prev.artifacts || []), ...newArtifacts]
      }));

      // Persist
      if (currentUser) {
        if (currentUser.isLocal) {
          const key = `guest_data_${currentUser.uid}`;
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const currentArtifacts = data.artifacts || [];
          // Merge and dedupe
          const updatedArtifacts = [...new Set([...currentArtifacts, ...newArtifacts])];

          data.artifacts = updatedArtifacts;
          localStorage.setItem(key, JSON.stringify(data));
        } else {
          const userRef = doc(db, 'users', currentUser.uid);
          updateDoc(userRef, {
            artifacts: arrayUnion(...newArtifacts)
          });
        }
      }
    }
  }, [locations, currentUser]);

  const value = {
    userData,
    curriculum,
    levels,
    locations, // New: Themed Locations Path
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
