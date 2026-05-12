import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Flashcard from './components/Flashcard';
import RegionMap from './components/RegionMap';
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
import { useAudio } from './hooks/useAudio';
import { useStudySession } from './hooks/useStudySession';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { trackLevelUp } from './lib/firebase';

import { useData } from './contexts/DataContext';
import KofiWidget from './components/KofiWidget';


function AppContent() {
  const { currentUser, logOut } = useAuth(); // removed loading from here as we use DataContext loading
  const { settings, setNativeLanguage } = useSettings();
  const { allCards, userData, loading: dataLoading, updateUserXP, completeLesson, completeOnboarding } = useData();

  // --- STATE: UI ---
  const [view, setView] = useState('map'); // 'path', 'map', 'session', 'summary', 'library'
  const [selectedLevelId, setSelectedLevelId] = useState(null);
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
  const {
    sessionQueue,
    currentIndex,
    isFlipped,
    setIsFlipped,
    stats,
    xpGainedSession,
    introducedIds,
    showFeedback,
    isStudyMode,
    startNewSession,
    handleRate,
    handleStudyModeStart,
    handleIntroNext
  } = useStudySession({
    allCards,
    userLevel,
    locations,
    settings,
    completeLesson,
    playCorrect,
    playIncorrect,
    onSessionComplete: () => setView('summary')
  });
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

  const handleNavigation = (targetView) => {
    if (targetView === 'session') {
      const viewState = startNewSession();
      if (viewState) setView(viewState);
    } else {
      setView(targetView);
    }
  };

  const handleStartLevel = (levelId, studyMode = false) => {
    setSelectedLevelId(levelId);
    if (studyMode) {
      const viewState = handleStudyModeStart(levelId);
      setView(viewState);
    } else {
      const viewState = startNewSession(levelId);
      if (viewState) setView(viewState);
    }
  };

  // --- ONBOARDING ---
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!dataLoading && userData && !userData.hasCompletedOnboarding && view === 'map') {
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, [view, dataLoading, userData]);

  const handleTourComplete = () => {
    completeOnboarding();
    setShowOnboarding(false);
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
                  className="btn-link"
                  style={{ marginLeft: '8px' }}
                >
                  (Sign Out)
                </button>
                <button
                  onClick={() => setView('admin-dashboard')}
                  className="btn-icon"
                  style={{ marginLeft: '8px' }}
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
              className="btn-primary"
            >
              Start Practice ▶
            </button>
            <button
              onClick={() => setNativeLanguage(settings.nativeLanguage === 'english' ? 'hebrew' : 'english')}
              className="btn-secondary"
              style={{ marginLeft: '8px' }}
              title="Switch Language"
            >
              {settings.nativeLanguage === 'english' ? '🇺🇸' : '🇮🇱'}
            </button>
          </div>

          <RegionMap
            mapId="levant"
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
              className="btn-outline"
            >
              Map 🌍
            </button>
            <button
              onClick={startNewSession}
              className="btn-primary-large"
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
