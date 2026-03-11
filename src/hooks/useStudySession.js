import { useState } from 'react';
import { calculateSrs, getDueCards } from '../utils/srs';
import { trackSessionStart, trackSessionComplete } from '../lib/firebase';
import { clozePhrases } from '../data/curriculum/index';

const SESSION_LENGTH = 10;

export const useStudySession = ({ 
  allCards, 
  userLevel, 
  locations, 
  settings, 
  completeLesson, 
  playCorrect, 
  playIncorrect,
  onSessionComplete 
}) => {
  const [sessionQueue, setSessionQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [xpGainedSession, setXpGainedSession] = useState(0);
  const [introducedIds, setIntroducedIds] = useState(new Set());
  const [showFeedback, setShowFeedback] = useState(null);
  const [isStudyMode, setIsStudyMode] = useState(false);

  const startNewSession = (levelId = null) => {
    // Sanitize input
    if (levelId && (typeof levelId === 'object' || typeof levelId === 'function')) {
      levelId = null;
    }

    setIsStudyMode(false);

    let availableCards = allCards;
    if (levelId) {
      if (typeof levelId === 'string') {
        availableCards = allCards.filter(c => c.locationId === levelId);
      } else if (typeof levelId === 'number') {
        availableCards = allCards.filter(c => c.level === levelId);
      }
    } else {
      const unlockedIds = locations.filter(l => l.isUnlocked).map(l => l.id);
      availableCards = allCards.filter(c => {
        if (c.locationId) {
          return unlockedIds.includes(c.locationId);
        }
        return (c.level || 1) <= userLevel;
      });
    }

    const due = getDueCards(availableCards);
    const newCards = availableCards.filter(c => c.srs.repetition === 0 && !due.includes(c) && (c.level || 1) <= userLevel);
    let pool = [...due, ...newCards].sort(() => 0.5 - Math.random()).slice(0, SESSION_LENGTH);

    if (pool.length === 0 && availableCards.length > 0) {
      pool = [...availableCards].sort(() => 0.5 - Math.random()).slice(0, SESSION_LENGTH);
    }

    const isAdvanced = userLevel >= 2;

    const conjugationCards = [];
    const sessionVerbs = availableCards.filter(c => c.type === 'verb');

    if (sessionVerbs.length > 0) {
      const pronounOptions = ['ana', 'inte', 'inti', 'huwwe', 'hiyye', 'ihna', 'intu', 'humme'];
      const pronounDisplayMap = {
        'ana': 'أنا (I)',
        'inte': 'إنت (You-m)',
        'inti': 'إنتِ (You-f)',
        'huwwe': 'هوّ (He)',
        'hiyye': 'هيّ (She)',
        'ihna': 'إحنا (We)',
        'intu': 'إنتו (You-pl)',
        'humme': 'هُمّ (They)'
      };

      const availableVerbs = sessionVerbs;
      const numConjugationQuizzes = Math.min(2, availableVerbs.length);
      if (availableVerbs.length > 0) {
        for (let i = 0; i < numConjugationQuizzes; i++) {
          const verb = availableVerbs[Math.floor(Math.random() * availableVerbs.length)];
          if (!verb || !verb.conjugations) continue;

          const pronoun = pronounOptions[Math.floor(Math.random() * pronounOptions.length)];
          const correctConjugationObj = verb.conjugations[pronoun] || { arabic: '', transliteration: '' };
          const correctConjugation = correctConjugationObj.arabic;

          const otherConjugations = Object.keys(verb.conjugations)
            .filter(p => p !== pronoun)
            .map(p => ({
              arabic: verb.conjugations[p].arabic,
              transliteration: verb.conjugations[p].transliteration
            }))
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

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
            options,
            arabic: correctConjugation,
            type: 'verb',
            srs: { repetition: 1, interval: 1, easeFactor: 2.5, nextReview: new Date() }
          });
        }
      }
    }

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
          type: 'phrase',
          srs: { repetition: 1, interval: 1, easeFactor: 2.5, nextReview: new Date() }
        });
      }
    }

    const quizTypes = ['en-to-ar', 'ar-to-en', 'en-to-trans'];
    const poolWithQuizTypes = pool.map(card => ({
      ...card,
      quizType: quizTypes[Math.floor(Math.random() * quizTypes.length)]
    }));

    const finalPool = [...poolWithQuizTypes, ...conjugationCards, ...clozeCards]
      .sort(() => 0.5 - Math.random())
      .slice(0, SESSION_LENGTH);

    if (finalPool.length === 0) {
      console.error("Session Start Failed: No cards available.", { levelId, availableCount: availableCards.length });
      alert(`No content available for this session! (Available: ${availableCards.length}). Please try refreshing.`);
      return false; // Error flag
    }

    setSessionQueue(finalPool);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStats({ correct: 0, incorrect: 0 });
    setXpGainedSession(0);
    setIntroducedIds(new Set());

    const hasNewItems = finalPool.some(c => c.srs.repetition === 0 && !c.id.startsWith('conj') && !c.id.startsWith('cloze'));

    trackSessionStart();

    return hasNewItems ? 'intro' : 'session';
  };

  const handleRate = (result) => {
    const currentCard = sessionQueue[currentIndex];

    let grade = 0;
    let xpGain = 0;
    let feedbackType = 'correct';
    let feedbackBaseMessage = 'Correct!';

    const isHebrew = settings.nativeLanguage === 'hebrew';

    if (result === 'correct') {
      playCorrect();
      grade = 4;
      xpGain = 10;
      feedbackType = 'correct';
      feedbackBaseMessage = isHebrew ? 'נכון!' : 'Correct!';
    } else if (result === 'incorrect') {
      playIncorrect();
      grade = 1;
      xpGain = 2;
      feedbackType = 'incorrect';
      feedbackBaseMessage = isHebrew ? 'לא נכון' : 'Incorrect';
    } else if (result === 'again') {
      playIncorrect();
      grade = 1;
      xpGain = 2;
      feedbackType = 'again';
      feedbackBaseMessage = isHebrew ? 'שוב' : 'Again';
    } else if (result === 'hard') {
      playCorrect();
      grade = 3;
      xpGain = 5;
      feedbackType = 'hard';
      feedbackBaseMessage = isHebrew ? 'קשה' : 'Hard';
    } else if (result === 'good') {
      playCorrect();
      grade = 4;
      xpGain = 10;
      feedbackType = 'good';
      feedbackBaseMessage = isHebrew ? 'טוב' : 'Good';
    } else if (result === 'easy') {
      playCorrect();
      grade = 5;
      xpGain = 15;
      feedbackType = 'easy';
      feedbackBaseMessage = isHebrew ? 'קל!' : 'Easy!';
    }

    const explanation = isHebrew ? (currentCard.hebrewExplanation || currentCard.explanation) : currentCard.explanation;
    let fullMessage = feedbackBaseMessage;

    if (explanation && (result === 'correct' || result === 'incorrect')) {
      fullMessage += '\n\n' + explanation;
    }

    setShowFeedback({ type: feedbackType, message: fullMessage });

    const newSrs = calculateSrs(currentCard.srs, grade);
    completeLesson(currentCard.id, { score: xpGain, stars: result === 'correct' ? 3 : 0 }, newSrs);

    setXpGainedSession(prev => prev + xpGain);
    const newStats = { ...stats, [result]: stats[result] + 1 };
    setStats(newStats);

    const delay = explanation ? 3500 : 1500;

    setTimeout(() => {
      setShowFeedback(null);

      if (currentIndex < sessionQueue.length - 1) {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(prev => prev + 1), 100);
      } else {
        trackSessionComplete(newStats);
        if (onSessionComplete) onSessionComplete();
      }
    }, delay);
  };

  const handleStudyModeStart = (levelId) => {
    setIsStudyMode(true);
    let availableCards = allCards;
    if (levelId) {
      availableCards = allCards.filter(c => c.level === levelId || c.locationId === levelId);
    }
    const guideContent = availableCards.filter(c => ['word', 'phrase'].includes(c.type));
    setSessionQueue(guideContent);
    return 'intro';
  };

  const handleIntroNext = () => {
    const currentCard = sessionQueue[currentIndex];
    setIntroducedIds(prev => new Set(prev).add(currentCard.id));
    setSessionQueue(prev => [...prev, currentCard]);
    setCurrentIndex(prev => prev + 1);
  };

  return {
    sessionQueue,
    setSessionQueue,
    currentIndex,
    setCurrentIndex,
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
  };
};
