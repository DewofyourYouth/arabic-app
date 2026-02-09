import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Flashcard from './components/Flashcard';
import LevantMap from './components/LevantMap';
import Library from './components/Library';
import WelcomeScreen from './components/WelcomeScreen';
import QuizCard from './components/QuizCard';
import IntroCard from './components/IntroCard';
import FennecFeedback from './components/FennecFeedback';
import curriculumData from './data/curriculum/index';
import { useAudio } from './hooks/useAudio';
import { calculateSrs, getDueCards, INITIAL_SRS_STATE } from './utils/srs';

const SESSION_LENGTH = 10;
const STORAGE_KEY = 'haki_user_progress_v1';
const XP_KEY = 'haki_user_xp_v1';
const USER_NAME_KEY = 'haki_user_name_v1';

function App() {
  // --- STATE: DATA ---
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem(USER_NAME_KEY) || null;
  });

  const [allCards, setAllCards] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initialData = curriculumData.map((card, index) => ({
      ...card,
      id: card.id || `card-${index}`,
      srs: INITIAL_SRS_STATE
    }));

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return initialData.map(card => {
          const savedCard = parsed.find(p => p.id === card.id);
          return savedCard ? { ...card, srs: savedCard.srs } : card;
        });
      } catch (e) {
        return initialData;
      }
    }
    return initialData;
  });

  const [userXp, setUserXp] = useState(() => {
    return parseInt(localStorage.getItem(XP_KEY) || '0', 10);
  });

  // --- STATE: UI ---
  const [view, setView] = useState('map'); // 'map', 'session', 'summary'
  const [sessionQueue, setSessionQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [xpGainedSession, setXpGainedSession] = useState(0);
  const [introducedIds, setIntroducedIds] = useState(new Set()); // Track IDs shown in Intro
  const [showFeedback, setShowFeedback] = useState(null); // { type: 'correct' | 'incorrect', message: '...' }
  
  const { playCorrect, playIncorrect } = useAudio();

  // Derived State
  const userLevel = Math.floor(userXp / 100) + 1; // Simple Leveling: 100 XP per level

  // Save Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allCards.map(c => ({ id: c.id, srs: c.srs }))));
  }, [allCards]);

  useEffect(() => {
    localStorage.setItem(XP_KEY, userXp.toString());
  }, [userXp]);

  useEffect(() => {
    if (userName) {
      localStorage.setItem(USER_NAME_KEY, userName);
    }
  }, [userName]);


  // --- ACTIONS ---
  const handleOnboardingComplete = (name) => {
    setUserName(name);
  };

  const addDevXp = () => {
    setUserXp(prev => prev + 100);
  };

  const startNewSession = () => {
    const due = getDueCards(allCards);
    const newCards = allCards.filter(c => c.srs.repetition === 0 && !due.includes(c));
    let pool = [...due, ...newCards].sort(() => 0.5 - Math.random()).slice(0, SESSION_LENGTH);

    if (pool.length === 0) {
      pool = [...allCards].sort(() => 0.5 - Math.random()).slice(0, SESSION_LENGTH);
    }

    // Assign random quiz types to cards that will use QuizCard
    const quizTypes = ['en-to-ar', 'ar-to-en', 'en-to-trans'];
    const poolWithQuizTypes = pool.map(card => ({
      ...card,
      quizType: quizTypes[Math.floor(Math.random() * quizTypes.length)]
    }));

    setSessionQueue(poolWithQuizTypes);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStats({ correct: 0, incorrect: 0 });
    setXpGainedSession(0);
    setIntroducedIds(new Set()); // Reset for new session
    setView('session');
  };

  const handleIntroNext = () => {
    const currentCard = sessionQueue[currentIndex];
    
    // Mark as introduced
    setIntroducedIds(prev => new Set(prev).add(currentCard.id));

    // Re-queue logic: Insert copy of this card later in the session
    // For simplicity, just appending to end, or shuffling in.
    // Let's just create a new queue with this card added to the end for now.
    setSessionQueue(prev => [...prev, currentCard]);

    // Move to next card immediately (which might be the re-queued one if queue was empty, but it won't be empty)
    // Actually, we want to show the NEXT card in the queue.
    // We do NOT increment currentIndex here because we want to advance naturally.
    // But since we are viewing the SAME index, if we don't increment, we see the same card again immediately if we just re-rendered.
    // BUT we want to see the NEXT card.
    
    setCurrentIndex(prev => prev + 1);
  };

  const handleRate = (result) => {
    const currentCard = sessionQueue[currentIndex];
    
    let grade = 0;
    let xpGain = 0;

    if (result === 'correct') {
      playCorrect();
      grade = 4;
      xpGain = 10;
      setShowFeedback({ type: 'correct', message: 'رائع! (Amazing!)' });
    } else {
      playIncorrect();
      grade = 1;
      xpGain = 2; // Small pity XP
      setShowFeedback({ type: 'incorrect', message: 'لا بأس! (No worries!)' });
    }

    // Update Data
    const newSrs = calculateSrs(currentCard.srs, grade);
    setAllCards(prev => prev.map(c => c.id === currentCard.id ? { ...c, srs: newSrs } : c));
    setUserXp(prev => prev + xpGain);
    setXpGainedSession(prev => prev + xpGain);

    // Update Session Stats
    setStats(prev => ({ ...prev, [result]: prev[result] + 1 }));

    // Delay navigation to show feedback
    setTimeout(() => {
      setShowFeedback(null);
      
      // Navigation
      if (currentIndex < sessionQueue.length - 1) {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => prev + 1), 100);
      } else {
        setView('summary');
      }
    }, 1500);
  };

  const handleNavigation = (targetView) => {
    if (targetView === 'session') {
      startNewSession();
    } else {
      setView(targetView);
    }
  };

  if (!userName) {
    return <WelcomeScreen onComplete={handleOnboardingComplete} />;
  }

  // --- VIEWS ---

  if (view === 'map') {
    return (
      <Layout activeView="map" onNavigate={handleNavigation}>
        <div style={{ padding: 'var(--spacing-4)' }}>
           {/* Header with XP Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 'var(--spacing-4)',
            background: 'white',
            padding: 'var(--spacing-3)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Level {userLevel}</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{userName}</span>
              </div>
              <div 
                style={{ fontSize: '0.8rem', color: '#888', cursor: 'pointer' }}
                title="Click to cheat +100 XP (Dev Mode)"
                onClick={addDevXp}
              >
                {userXp} XP 🔧
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
          </div>

          <LevantMap userLevel={userLevel} onCitySelect={startNewSession} />
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
              Total XP: {userXp} <br/>
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
          {currentCard.srs.repetition === 0 && !introducedIds.has(currentCard.id) ? (
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
                height: '80px', display: 'flex', justifyContent: 'center', gap: 'var(--spacing-4)',
                opacity: isFlipped ? 1 : 0, pointerEvents: isFlipped ? 'auto' : 'none',
                transition: 'opacity 0.2s', transform: isFlipped ? 'translateY(0)' : 'translateY(10px)'
              }}>
                <button 
                  onClick={() => handleRate('incorrect')}
                  style={{
                    flex: 1, background: 'white', border: '2px solid var(--color-error)', color: 'var(--color-error)',
                    borderRadius: 'var(--radius-lg)', fontWeight: 'bold', fontSize: 'var(--font-size-lg)', boxShadow: '0 4px 0 #ffcdd2', cursor: 'pointer'
                  }}
                >
                  Hard 😓
                </button>
                
                <button 
                  onClick={() => handleRate('correct')}
                  style={{
                    flex: 1, background: 'var(--color-success)', border: 'none', color: 'white',
                    borderRadius: 'var(--radius-lg)', fontWeight: 'bold', fontSize: 'var(--font-size-lg)', boxShadow: '0 4px 0 var(--color-accent-dark)', cursor: 'pointer'
                  }}
                >
                  Easy! 🤩
                </button>
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
    </>
  );
}

export default App;
