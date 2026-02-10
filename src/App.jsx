import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Flashcard from './components/Flashcard';
import LevantMap from './components/LevantMap';
import Library from './components/Library';
import WelcomeScreen from './components/WelcomeScreen';
import QuizCard from './components/QuizCard';
import IntroCard from './components/IntroCard';
import FennecFeedback from './components/FennecFeedback';
import curriculumData, { verbsData, clozePhrases } from './data/curriculum/index';
import { useAudio } from './hooks/useAudio';
import { calculateSrs, getDueCards, INITIAL_SRS_STATE } from './utils/srs';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const SESSION_LENGTH = 10;

function AppContent() {
  const { currentUser, loading, logOut } = useAuth();

  // --- STATE: DATA ---
  const [allCards, setAllCards] = useState([]);
  const [userXp, setUserXp] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

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
  const userName = currentUser?.displayName || 'Guest';

  // Load Data Effect
  useEffect(() => {
    if (!currentUser) return;

    const uid = currentUser.uid;
    const storageKey = `haki_user_progress_${uid}`;
    const xpKey = `haki_user_xp_${uid}`;

    // Load Cards
    const savedCards = localStorage.getItem(storageKey);
    const initialData = curriculumData.map((card, index) => ({
      ...card,
      id: card.id || `card-${index}`,
      srs: INITIAL_SRS_STATE
    }));

    if (savedCards) {
      try {
        const parsed = JSON.parse(savedCards);
        const merged = initialData.map(card => {
          const savedCard = parsed.find(p => p.id === card.id);
          return savedCard ? { ...card, srs: savedCard.srs } : card;
        });
        setAllCards(merged);
      } catch (e) {
        setAllCards(initialData);
      }
    } else {
      setAllCards(initialData);
    }

    // Load XP
    const savedXp = localStorage.getItem(xpKey);
    setUserXp(savedXp ? parseInt(savedXp, 10) : 0);

    setDataLoaded(true);
  }, [currentUser]);

  // Save Effects
  useEffect(() => {
    if (!currentUser || !dataLoaded) return;
    const uid = currentUser.uid;
    localStorage.setItem(`haki_user_progress_${uid}`, JSON.stringify(allCards.map(c => ({ id: c.id, srs: c.srs }))));
  }, [allCards, currentUser, dataLoaded]);

  useEffect(() => {
    if (!currentUser || !dataLoaded) return;
    const uid = currentUser.uid;
    localStorage.setItem(`haki_user_xp_${uid}`, userXp.toString());
  }, [userXp, currentUser, dataLoaded]);


  // --- ACTIONS ---
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

    // Generate verb conjugation quiz cards (2-3 per session)
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

    const conjugationCards = [];
    const numConjugationQuizzes = Math.min(2, verbsData.length);
    for (let i = 0; i < numConjugationQuizzes; i++) {
      const verb = verbsData[Math.floor(Math.random() * verbsData.length)];
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

    // Generate cloze quiz cards (2-3 per session)
    const clozeCards = [];
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
        type: 'phrase',               // For display consistency
        srs: { repetition: 1, interval: 1, easeFactor: 2.5, nextReview: new Date() }
      });
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

    setSessionQueue(finalPool);
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

    setSessionQueue(prev => [...prev, currentCard]);
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

  if (loading) {
     return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading...</div>;
  }

  if (!currentUser) {
    return (
      <SettingsProvider>
        <WelcomeScreen />
      </SettingsProvider>
    );
  }

  if (!dataLoaded) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading Data...</div>;
  }

  // --- VIEWS ---

  if (view === 'map') {
    return (
      <SettingsProvider>
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
      </SettingsProvider>
    );
  }

  if (view === 'library') {
    return (
      <SettingsProvider>
        <Layout activeView="library" onNavigate={handleNavigation}>
        <Library cards={allCards} />
      </Layout>
      </SettingsProvider>
    );
  }

  if (view === 'summary') {
    return (
      <SettingsProvider>
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
      </SettingsProvider>
    );
  }

  // Session View
  const currentCard = sessionQueue[currentIndex];
  const progress = sessionQueue.length > 0 ? ((currentIndex) / sessionQueue.length) * 100 : 0;

  if (!currentCard) return <Layout activeView="session" onNavigate={handleNavigation}><div>Loading...</div></Layout>;

  return (
    <SettingsProvider>
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
    </SettingsProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
