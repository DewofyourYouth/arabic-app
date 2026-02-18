import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Flashcard from './components/Flashcard';
import LevantMap from './components/LevantMap';
import Library from './components/Library';
import CurriculumPath from './components/CurriculumPath';
import WelcomeScreen from './components/WelcomeScreen';
import QuizCard from './components/QuizCard';
import IntroCard from './components/IntroCard';
import LessonIntro from './components/LessonIntro';
import OnboardingTour from './components/OnboardingTour';
import FennecFeedback from './components/FennecFeedback';
import LevelUpModal from './components/LevelUpModal';
import AdminMigration from './components/AdminMigration';
import AdminDashboard from './components/AdminDashboard';
import LocationUnlockModal from './components/LocationUnlockModal';
import curriculumData, { verbsData, clozePhrases } from './data/curriculum/index';
import { useAudio } from './hooks/useAudio';
import { calculateSrs, getDueCards, INITIAL_SRS_STATE } from './utils/srs';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { trackSessionStart, trackSessionComplete, trackLevelUp } from './lib/firebase';

import { useData } from './contexts/DataContext';
import KofiWidget from './components/KofiWidget';

const SESSION_LENGTH = 10;

function AppContent() {
  const { currentUser, logOut } = useAuth(); // removed loading from here as we use DataContext loading
  const { settings, setNativeLanguage } = useSettings();
  const { allCards, userData, loading: dataLoading, updateUserXP, completeLesson, completeOnboarding } = useData();

  // --- STATE: UI ---
  const [view, setView] = useState('map'); // 'path', 'map', 'session', 'summary', 'library'
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [sessionQueue, setSessionQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [xpGainedSession, setXpGainedSession] = useState(0);
  const [introducedIds, setIntroducedIds] = useState(new Set()); // Track IDs shown in Intro
  const [showFeedback, setShowFeedback] = useState(null); // { type: 'correct' | 'incorrect', message: '...' }
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  const { playCorrect, playIncorrect } = useAudio();

  // Derived State
  const userXp = userData?.stats?.totalXP || 0;
  const userLevel = Math.floor(userXp / 100) + 1; // Simple Leveling: 100 XP per level
  const xpTowardsNextLevel = userXp % 100;
  const userName = currentUser?.displayName || 'Guest';
  const [previousLevel, setPreviousLevel] = useState(userLevel);

  // Track Unlocked Locations for Notifications
  const { locations } = useData(); // Get locations from context
  const [unlockedLocationIds, setUnlockedLocationIds] = useState(new Set());
  const [newlyUnlockedLocation, setNewlyUnlockedLocation] = useState(null);

  // Initialize unlocked state
  useEffect(() => {
    if (locations && locations.length > 0) {
      const currentlyUnlocked = new Set(locations.filter(l => l.isUnlocked).map(l => l.id));

      // Initial load (don't notify, just set)
      if (unlockedLocationIds.size === 0 && currentlyUnlocked.size > 0) {
        setUnlockedLocationIds(currentlyUnlocked);
      }
      // Subsequent updates (check for diff)
      else if (currentlyUnlocked.size > unlockedLocationIds.size) {
        // Find the new one
        const newId = [...currentlyUnlocked].find(id => !unlockedLocationIds.has(id));
        if (newId) {
          const newLocation = locations.find(l => l.id === newId);
          setNewlyUnlockedLocation(newLocation);
          setUnlockedLocationIds(currentlyUnlocked);
        }
      }
    }
  }, [locations]); // Relying on locations reference changing from DataContext

  // Track level ups
  useEffect(() => {
    if (userLevel > previousLevel && previousLevel > 0) {
      trackLevelUp(userLevel);
      // user requested NOT to show this generic level up modal
      // setShowLevelUpModal(true); 
    }
    setPreviousLevel(userLevel);
  }, [userLevel]);

  // --- ACTIONS ---

  const startNewSession = (levelId = null) => {
    // Sanitize input: If called from onClick, levelId is an Event object. Treat as null (Global).
    if (levelId && (typeof levelId === 'object' || typeof levelId === 'function')) {
      levelId = null;
    }

    // Reset study mode whenever a regular session starts
    setIsStudyMode(false);

    // If levelId is provided, filter cards to that level/location only
    let availableCards = allCards;
    if (levelId) {
      if (typeof levelId === 'string') {
        // It's a specific Level/Location
        availableCards = allCards.filter(c => c.locationId === levelId);
      } else if (typeof levelId === 'number') {
        availableCards = allCards.filter(c => c.level === levelId);
      }
    } else {
      // Global Practice: ONLY from unlocked locations
      const unlockedIds = locations.filter(l => l.isUnlocked).map(l => l.id);
      availableCards = allCards.filter(c => {
        // If card has a locationId, it must be in the unlocked list
        if (c.locationId) {
          return unlockedIds.includes(c.locationId);
        }
        // Fallback for legacy items without locationId (allow them if level matches)
        return (c.level || 1) <= userLevel;
      });
    }

    const due = getDueCards(availableCards);
    const newCards = availableCards.filter(c => c.srs.repetition === 0 && !due.includes(c) && (c.level || 1) <= userLevel);
    let pool = [...due, ...newCards].sort(() => 0.5 - Math.random()).slice(0, SESSION_LENGTH);

    // Fallback: If pool is empty (everything learned, nothing due), review random items from AVAILABLE cards (locked content excluded)
    if (pool.length === 0 && availableCards.length > 0) {
      pool = [...availableCards].sort(() => 0.5 - Math.random()).slice(0, SESSION_LENGTH);
    }

    // Determine if we should include advanced quizzes (conjugations/cloze)
    // Only include if:
    // 1. It's a general session (levelId is null)
    // 2. OR the current location/level actually contains verbs (for conjugations)
    // 3. OR the current location is advanced enough (for cloze)

    const hasVerbs = availableCards.some(c => c.type === 'verb');
    const isAdvanced = userLevel >= 2;

    // Generate verb conjugation quiz cards (2-3 per session)
    // Generate verb conjugation quiz cards (2-3 per session)
    const conjugationCards = [];
    const sessionVerbs = availableCards.filter(c => c.type === 'verb');

    // Strict Mode: ONLY generate conjugation cards if the CURRENT filtered cards contain verbs.
    if (sessionVerbs.length > 0) {
      const pronounOptions = ['ana', 'inte', 'inti', 'huwwe', 'hiyye', 'ihna', 'intu', 'humme'];
      const pronounDisplayMap = {
        'ana': 'أنا (I)',
        'inte': 'إنت (You-m)',
        'inti': 'إنتِ (You-f)',
        'huwwe': 'هوّ (He)',
        'hiyye': 'هيّ (She)',
        'ihna': 'إحنا (We)',
        'intu': 'إنتو (You-pl)',
        'humme': 'هُمّ (They)'
      };

      const availableVerbs = sessionVerbs;

      const numConjugationQuizzes = Math.min(2, availableVerbs.length);
      if (availableVerbs.length > 0) {
        for (let i = 0; i < numConjugationQuizzes; i++) {
          const verb = availableVerbs[Math.floor(Math.random() * availableVerbs.length)];
          // Safety check if verb structure matches expectations
          if (!verb || !verb.conjugations) continue;

          const pronoun = pronounOptions[Math.floor(Math.random() * pronounOptions.length)];
          const correctConjugationObj = verb.conjugations[pronoun] || { arabic: '', transliteration: '' };
          const correctConjugation = correctConjugationObj.arabic;

          // Get 3 other conjugations as distractors
          const otherConjugations = Object.keys(verb.conjugations)
            .filter(p => p !== pronoun)
            .map(p => ({
              arabic: verb.conjugations[p].arabic,
              transliteration: verb.conjugations[p].transliteration
            }))
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

          // Options now contain objects with both scripts
          const options = [
            { arabic: correctConjugation, transliteration: correctConjugationObj.transliteration },
            ...otherConjugations
          ].sort(() => 0.5 - Math.random());

          conjugationCards.push({
            id: `conj-${verb.id}-${pronoun}-${i}`,
            quizType: 'conjugation',
            pronoun,
            pronounDisplay: pronounDisplayMap[pronoun],
            verb,
            correctConjugation,
            options, // Array of { arabic, transliteration }
            arabic: correctConjugation,  // For audio playback
            type: 'verb',                 // For display consistency
            srs: { repetition: 1, interval: 1, easeFactor: 2.5, nextReview: new Date() }
          });
        }
      }
    }

    // Generate cloze quiz cards (2-3 per session)
    // Only if general session OR if user is advanced and we aren't strict on location
    // User complaint: "It's the beginning".
    // So if levelId is present (Location Context), DISABLE Cloze unless card explicitly says so (future feature)
    // For now: Only General Session or High Levels
    const clozeCards = [];
    if (!levelId && isAdvanced) {
      const numClozeQuizzes = Math.min(3, clozePhrases.length);
      for (let i = 0; i < numClozeQuizzes; i++) {
        const cloze = clozePhrases[Math.floor(Math.random() * clozePhrases.length)];
        const options = [cloze.correctAnswer, ...cloze.distractors].sort(() => 0.5 - Math.random());

        clozeCards.push({
          id: `cloze-${cloze.id}-${i}`,
          quizType: 'cloze',
          sentence: cloze.sentence,
          sentenceEnglish: cloze.sentenceEnglish,
          correctAnswer: cloze.correctAnswer,
          options,
          explanation: cloze.explanation,
          hebrewExplanation: cloze.hebrewExplanation,
          type: 'phrase',               // For display consistency
          srs: { repetition: 1, interval: 1, easeFactor: 2.5, nextReview: new Date() }
        });
      }
    }

    // Assign random quiz types to regular cards
    const quizTypes = ['en-to-ar', 'ar-to-en', 'en-to-trans'];
    const poolWithQuizTypes = pool.map(card => ({
      ...card,
      quizType: quizTypes[Math.floor(Math.random() * quizTypes.length)]
    }));

    // Mix everything together
    const finalPool = [...poolWithQuizTypes, ...conjugationCards, ...clozeCards]
      .sort(() => 0.5 - Math.random())
      .slice(0, SESSION_LENGTH);

    // CRITICAL FIX: Prevent "Loading..." freeze if pool is empty
    if (finalPool.length === 0) {
      console.error("Session Start Failed: No cards available.", { levelId, availableCount: availableCards.length, allCount: allCards.length });
      alert(`No content available for this session! (Available: ${availableCards.length}, Total: ${allCards.length}). Please try refreshing.`);
      return;
    }

    setSessionQueue(finalPool);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStats({ correct: 0, incorrect: 0 });
    setXpGainedSession(0);
    setIntroducedIds(new Set()); // Reset for new session

    // Check if there are new items to introduce
    const hasNewItems = finalPool.some(c => c.srs.repetition === 0 && !c.id.startsWith('conj') && !c.id.startsWith('cloze'));

    if (hasNewItems) {
      setView('intro');
    } else {
      setView('session');
    }

    // Track session start
    trackSessionStart();
  };

  const handleIntroNext = () => {
    const currentCard = sessionQueue[currentIndex];

    // Mark as introduced
    setIntroducedIds(prev => new Set(prev).add(currentCard.id));

    setSessionQueue(prev => [...prev, currentCard]);
    setCurrentIndex(prev => prev + 1);
  };

  // --- ONBOARDING ---
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Only check if data is loaded and we have user data
    if (!dataLoading && userData && !userData.hasCompletedOnboarding && view === 'map') {
      // Small delay to let simple animations finish
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, [view, dataLoading, userData]);

  const handleTourComplete = () => {
    completeOnboarding();
    setShowOnboarding(false);
  };

  const handleRate = (result) => {
    const currentCard = sessionQueue[currentIndex];

    let grade = 0;
    let xpGain = 0;

    let feedbackType = 'correct';
    let feedbackBaseMessage = 'Correct!';

    const isHebrew = settings.nativeLanguage === 'hebrew';

    if (result === 'correct') { // From Quiz
      playCorrect();
      grade = 4;
      xpGain = 10;
      feedbackType = 'correct';
      feedbackBaseMessage = isHebrew ? 'נכון!' : 'Correct!';
    } else if (result === 'incorrect') { // From Quiz
      playIncorrect();
      grade = 1;
      xpGain = 2;
      feedbackType = 'incorrect';
      feedbackBaseMessage = isHebrew ? 'לא נכון' : 'Incorrect';
    } else if (result === 'again') {
      playIncorrect();
      grade = 1; // Fail / Reset
      xpGain = 2;
      feedbackType = 'again';
      feedbackBaseMessage = isHebrew ? 'שוב' : 'Again';
    } else if (result === 'hard') {
      playCorrect();
      grade = 3; // Hard
      xpGain = 5;
      feedbackType = 'hard';
      feedbackBaseMessage = isHebrew ? 'קשה' : 'Hard';
    } else if (result === 'good') {
      playCorrect();
      grade = 4; // Good
      xpGain = 10;
      feedbackType = 'good';
      feedbackBaseMessage = isHebrew ? 'טוב' : 'Good';
    } else if (result === 'easy') {
      playCorrect();
      grade = 5; // Easy
      xpGain = 15;
      feedbackType = 'easy';
      feedbackBaseMessage = isHebrew ? 'קל!' : 'Easy!';
    }

    // Determine Explanation
    const explanation = isHebrew ? (currentCard.hebrewExplanation || currentCard.explanation) : currentCard.explanation;
    let fullMessage = feedbackBaseMessage;

    if (explanation && (result === 'correct' || result === 'incorrect')) {
      fullMessage += '\n\n' + explanation;
    }

    setShowFeedback({ type: feedbackType, message: fullMessage });

    // Update Data
    const newSrs = calculateSrs(currentCard.srs, grade);

    // Call DataContext action
    completeLesson(currentCard.id, { score: xpGain, stars: result === 'correct' ? 3 : 0 }, newSrs);

    setXpGainedSession(prev => prev + xpGain);

    // Update Session Stats
    setStats(prev => ({ ...prev, [result]: prev[result] + 1 }));

    // Delay navigation to show feedback
    // Increase delay if there is an explanation to read
    const delay = explanation ? 3500 : 1500;

    setTimeout(() => {
      setShowFeedback(null);

      // Navigation
      if (currentIndex < sessionQueue.length - 1) {
        setIsFlipped(false);
        // Pre-flip back to front (instant)
        // Then move to next card
        setTimeout(() => setCurrentIndex(prev => prev + 1), 100);
      } else {
        // Track session completion
        trackSessionComplete(stats);
        setView('summary');
      }
    }, delay);
  };

  const handleNavigation = (targetView) => {
    if (targetView === 'session') {
      startNewSession();
    } else {
      setView(targetView);
    }
  };

  // State for study mode
  const [isStudyMode, setIsStudyMode] = useState(false);

  const handleStartLevel = (levelId, studyMode = false) => {
    setSelectedLevelId(levelId);

    if (studyMode) {
      setIsStudyMode(true);
      // Load all cards for this location to review
      // Logic similar to startNewSession but we need ALL content for this location
      // learningPath has the mapping, but we don't have direct access to it easily here without mapping ID back to content
      // BUT startNewSession filters by levelId...

      // Actually, let's just use startNewSession logic but grab everything for the intro view
      let availableCards = allCards;
      if (levelId) {
        availableCards = allCards.filter(c => c.level === levelId || c.locationId === levelId);
      }

      // Filter out quizzes/conjugations for the guide view if possible, or keep them if they are content
      // We probably want just 'phrase' and 'word' types
      const guideContent = availableCards.filter(c => ['word', 'phrase'].includes(c.type));

      setSessionQueue(guideContent);
      setView('intro');
    } else {
      setIsStudyMode(false);
      startNewSession(levelId);
    }
  };

  if (dataLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!currentUser) {
    return (
      <WelcomeScreen />
    );
  }

  // --- VIEWS ---

  if (view === 'path') {
    return (
      <Layout activeView="path" onNavigate={handleNavigation}>
        <CurriculumPath onStartLevel={handleStartLevel} />
      </Layout>
    );
  }

  if (view === 'map') {
    return (
      <Layout activeView="map" onNavigate={handleNavigation}>
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-4)'
        }}>
          {/* Header with XP Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'white',
            padding: 'var(--spacing-3)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            flexShrink: 0
          }}>
            <div style={{ flex: 1, marginRight: 'var(--spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Level {userLevel}</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{userName}</span>
                <button
                  onClick={() => logOut()}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.8rem',
                    color: '#888',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginLeft: '8px'
                  }}
                >
                  (Sign Out)
                </button>
                <button
                  onClick={() => setView('admin-dashboard')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.8rem',
                    color: '#ddd',
                    cursor: 'pointer',
                    marginLeft: '8px'
                  }}
                >
                  π
                </button>
              </div>

              {/* Progress Bar */}
              <div style={{
                height: '8px',
                background: '#eee',
                borderRadius: '4px',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '200px'
              }}>
                <div style={{
                  height: '100%',
                  width: `${xpTowardsNextLevel}%`,
                  background: 'var(--color-accent)',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '2px' }}>
                {xpTowardsNextLevel} / 100 XP to next level
              </div>
            </div>

            <button
              onClick={startNewSession}
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 0 var(--color-primary-dark)',
              }}
            >
              Start Practice ▶
            </button>
            <button
              onClick={() => setNativeLanguage(settings.nativeLanguage === 'english' ? 'hebrew' : 'english')}
              style={{
                background: 'none',
                border: '1px solid #ddd',
                borderRadius: 'var(--radius-md)',
                padding: '4px 8px',
                marginLeft: '8px',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
              title="Switch Language"
            >
              {settings.nativeLanguage === 'english' ? '🇺🇸' : '🇮🇱'}
            </button>
          </div>

          <LevantMap
            userLevel={userLevel}
            onCitySelect={handleStartLevel}
            onViewPath={() => setView('path')}
          />

          {showOnboarding && <OnboardingTour onComplete={handleTourComplete} />}
        </div>
      </Layout>
    );
  }

  if (view === 'library') {
    return (
      <Layout activeView="library" onNavigate={handleNavigation}>
        <Library cards={allCards} />
      </Layout>
    );
  }

  if (view === 'summary') {
    return (
      <Layout activeView="session" onNavigate={handleNavigation}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 'var(--spacing-6)'
        }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-primary)' }}>Session Complete! 🎉</h2>

          <div style={{
            background: 'white',
            padding: 'var(--spacing-8)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
            width: '100%',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: 'var(--spacing-4)' }}>+{xpGainedSession} XP</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 'var(--spacing-4)' }}>
              <div>
                <p style={{ color: 'var(--color-success)', fontSize: '2rem', fontWeight: 'bold' }}>{stats.correct}</p>
                <p>Retained</p>
              </div>
              <div>
                <p style={{ color: 'var(--color-error)', fontSize: '2rem', fontWeight: 'bold' }}>{stats.incorrect}</p>
                <p>Needs Work</p>
              </div>
            </div>
            <p style={{ color: 'var(--color-text-light)' }}>
              Total XP: {userXp} <br />
              (Level {userLevel})
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
            <button
              onClick={() => setView('map')}
              style={{
                background: 'white',
                color: 'var(--color-text)',
                border: '2px solid #eee',
                padding: 'var(--spacing-4) var(--spacing-8)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Map 🌍
            </button>
            <button
              onClick={startNewSession}
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                padding: 'var(--spacing-4) var(--spacing-8)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 0 var(--color-primary-dark)',
              }}
            >
              Again ➜
            </button>
          </div>
        </div>
      </Layout>
    );
  }


  const ADMIN_UIDS = [
    import.meta.env.VITE_ADMIN_UID // Jacob Shore (from .env)
  ];

  if (view === 'admin-migrate') {
    if (!currentUser || !ADMIN_UIDS.includes(currentUser.uid)) {
      return (
        <Layout activeView="map" onNavigate={handleNavigation}>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>You do not have permission to view this page.</p>
            <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '20px' }}>Your UID: {currentUser?.uid}</p>
            <button onClick={() => setView('map')} style={{ marginTop: '20px', padding: '10px 20px' }}>Back to Map</button>
          </div>
        </Layout>
      );
    }
    return (
      <Layout activeView="admin-migrate" onNavigate={handleNavigation}>
        <AdminMigration onBack={() => setView('map')} />
      </Layout>
    );
  }

  if (view === 'admin-dashboard') {
    // Re-use same security check or move it to a wrapper? 
    // For now, simple check.
    if (!currentUser || !ADMIN_UIDS.includes(currentUser.uid)) return <Layout activeView="map" onNavigate={handleNavigation}>Access Denied</Layout>;

    return (
      <Layout activeView="admin-dashboard" onNavigate={handleNavigation}>
        <AdminDashboard onNavigate={setView} />
      </Layout>
    );
  }

  // Session View
  const currentCard = sessionQueue[currentIndex];

  const progress = sessionQueue.length > 0 ? ((currentIndex) / sessionQueue.length) * 100 : 0;

  if (!currentCard) return <Layout activeView="session" onNavigate={handleNavigation}><div>Loading...</div></Layout>;

  return (
    <>
      <Layout activeView="session" onNavigate={handleNavigation}>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', height: '100%', justifyContent: 'center', padding: '0 var(--spacing-4)'
        }}>
          {/* Header / Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-light)' }}>
              <button onClick={() => setView('map')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>← Exit</button>
              <span>{currentIndex + 1} / {sessionQueue.length}</span>
            </div>
            <div style={{ height: '8px', background: '#E0E0E0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-primary)', transition: 'all 0.3s' }} />
            </div>
          </div>

          {/* Card Area (Intro, Flashcard, or Quiz) */}
          {/* Intro View for New Items Batch */}
          {view === 'intro' ? (
            <LessonIntro
              newCards={isStudyMode ? sessionQueue : sessionQueue.filter(c => c.srs.repetition === 0 && !c.id.startsWith('conj') && !c.id.startsWith('cloze'))}
              onStartSession={() => isStudyMode ? startNewSession(selectedLevelId) : setView('session')}
              onCancel={() => setView('map')}
              isReviewMode={isStudyMode}
            />
          ) : (
            /* Regular Session View */
            currentCard.srs.repetition === 0 && !introducedIds.has(currentCard.id) && !currentCard.id.startsWith('conj') && !currentCard.id.startsWith('cloze') ? (
              <IntroCard
                key={currentCard.id || currentIndex}
                cardData={currentCard}
                onNext={handleIntroNext}
              />
            ) : currentCard.srs.repetition === 0 ? (
              <>
                <Flashcard
                  key={currentCard.id || currentIndex}
                  cardData={currentCard}
                  isFlipped={isFlipped}
                  onFlip={() => setIsFlipped(true)}
                />

                {/* Controls (Only for Flashcard) */}
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)',
                  opacity: isFlipped ? 1 : 0, pointerEvents: isFlipped ? 'auto' : 'none',
                  transition: 'opacity 0.2s', transform: isFlipped ? 'translateY(0)' : 'translateY(10px)'
                }}>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                    <button
                      onClick={() => handleRate('again')}
                      style={{
                        flex: 1, background: 'white', border: '2px solid var(--color-error)', color: 'var(--color-error)',
                        borderRadius: 'var(--radius-lg)', fontWeight: 'bold', padding: '12px 0', cursor: 'pointer'
                      }}
                    >
                      Again
                      <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>&lt; 1m</div>
                    </button>

                    <button
                      onClick={() => handleRate('hard')}
                      style={{
                        flex: 1, background: 'white', border: '2px solid var(--color-warning)', color: 'var(--color-warning)',
                        borderRadius: 'var(--radius-lg)', fontWeight: 'bold', padding: '12px 0', cursor: 'pointer'
                      }}
                    >
                      Hard
                      <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>2d</div>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                    <button
                      onClick={() => handleRate('good')}
                      style={{
                        flex: 1, background: 'white', border: '2px solid var(--color-success)', color: 'var(--color-success)',
                        borderRadius: 'var(--radius-lg)', fontWeight: 'bold', padding: '12px 0', cursor: 'pointer'
                      }}
                    >
                      Good
                      <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>3d</div>
                    </button>

                    <button
                      onClick={() => handleRate('easy')}
                      style={{
                        flex: 1, background: 'white', border: '2px solid var(--color-primary)', color: 'var(--color-primary)',
                        borderRadius: 'var(--radius-lg)', fontWeight: 'bold', padding: '12px 0', cursor: 'pointer'
                      }}
                    >
                      Easy
                      <div style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>4d</div>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <QuizCard
                key={currentCard.id || currentIndex}
                cardData={currentCard}
                allCards={allCards}
                onRate={handleRate}
                quizType={currentCard.quizType}
              />
            )
          )}
        </div>
      </Layout>

      {/* Global Feedback Overlay */}
      {showFeedback && (
        <FennecFeedback
          type={showFeedback.type}
          message={showFeedback.message}
          onClose={() => setShowFeedback(null)}
        />
      )}

      {/* Location Unlock Modal */}
      {newlyUnlockedLocation && (
        <LocationUnlockModal
          location={newlyUnlockedLocation}
          onContinue={() => setNewlyUnlockedLocation(null)}
        />
      )}

      {/* Level Up Modal */}
      {showLevelUpModal && (
        <LevelUpModal
          level={userLevel}
          onContinue={() => setShowLevelUpModal(false)}
        />
      )}

      {/* Ko-fi Widget (Web Only) */}
      <KofiWidget />
    </>
  );
}

import { Component } from 'react';
import { DataProvider } from './contexts/DataContext';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1>Something went wrong.</h1>
          <p style={{ color: 'red' }}>{this.state.error?.toString()}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px' }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <SettingsProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </SettingsProvider>
      </DataProvider>
    </AuthProvider>
  );
}
