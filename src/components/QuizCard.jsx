import React, { useState, useEffect, useMemo } from 'react';
import { useAudio } from '../hooks/useAudio';
import { useSettings } from '../contexts/SettingsContext';

const QuizCard = ({ cardData, allCards, onRate, quizType = 'en-to-ar' }) => {
  const { arabic, transliteration, english, type } = cardData;
  const { playCorrect, playIncorrect, playPronunciation } = useAudio();
  const { settings } = useSettings();
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Determine question and answer based on quiz type
  const questionConfig = useMemo(() => {
    switch (quizType) {
      case 'ar-to-en':
        return {
          prompt: settings.showArabicScript ? arabic : transliteration,
          promptLabel: settings.showArabicScript ? 'Translate this' : 'Translate this (transliteration)',
          correctAnswer: english,
          getDistractorText: (card) => card.english,
          promptStyle: { 
            fontFamily: settings.showArabicScript ? 'var(--font-family-arabic)' : 'var(--font-family-english)', 
            fontSize: settings.showArabicScript ? '2.5rem' : '2rem',
            fontStyle: settings.showArabicScript ? 'normal' : 'italic'
          },
          optionStyle: { fontFamily: 'var(--font-family-english)', fontSize: '1.1rem' }
        };
      case 'en-to-trans':
        return {
          prompt: english,
          promptLabel: 'How do you pronounce this?',
          correctAnswer: transliteration,
          getDistractorText: (card) => card.transliteration,
          promptStyle: { fontFamily: 'var(--font-family-english)', fontSize: '2rem' },
          optionStyle: { fontFamily: 'var(--font-family-english)', fontSize: '1.1rem', fontStyle: 'italic' }
        };
      case 'conjugation':
        // For verb conjugation quizzes
        const pronoun = cardData.pronoun || 'ana';
        const verb = cardData.verb || {};
        return {
          prompt: `${cardData.pronounDisplay || pronoun} + ${verb.translation || ''}`,
          promptLabel: 'Conjugate the verb',
          correctAnswer: cardData.correctConjugation || '',
          getDistractorText: () => '', // Distractors provided in cardData
          promptStyle: { fontFamily: 'var(--font-family-english)', fontSize: '1.5rem' },
          optionStyle: { 
            fontFamily: settings.showArabicScript ? 'var(--font-family-arabic)' : 'var(--font-family-english)',
            fontSize: '1.25rem',
            fontStyle: settings.showArabicScript ? 'normal' : 'italic'
          },
          useProvidedOptions: true,
          showTransliteration: !settings.showArabicScript
        };
      case 'cloze':
        // For fill-in-blank quizzes
        return {
          prompt: cardData.sentence || '',
          promptLabel: 'Fill in the blank',
          correctAnswer: cardData.correctAnswer || '',
          getDistractorText: () => '', // Distractors provided in cardData
          promptStyle: { 
            fontFamily: settings.showArabicScript ? 'var(--font-family-arabic)' : 'var(--font-family-english)',
            fontSize: settings.showArabicScript ? '1.8rem' : '1.5rem',
            lineHeight: '1.8',
            fontStyle: settings.showArabicScript ? 'normal' : 'italic'
          },
          optionStyle: { 
            fontFamily: settings.showArabicScript ? 'var(--font-family-arabic)' : 'var(--font-family-english)',
            fontSize: '1.25rem',
            fontStyle: settings.showArabicScript ? 'normal' : 'italic'
          },
          useProvidedOptions: true,
          showTransliteration: !settings.showArabicScript
        };
      case 'en-to-ar':
      default:
        return {
          prompt: english,
          promptLabel: 'Translate this',
          correctAnswer: settings.showArabicScript ? arabic : transliteration,
          getDistractorText: (card) => settings.showArabicScript ? card.arabic : card.transliteration,
          promptStyle: { fontFamily: 'var(--font-family-english)', fontSize: '2rem' },
          optionStyle: { 
            fontFamily: settings.showArabicScript ? 'var(--font-family-arabic)' : 'var(--font-family-english)',
            fontSize: '1.25rem',
            fontStyle: settings.showArabicScript ? 'normal' : 'italic'
          }
        };
    }
  }, [quizType, arabic, transliteration, english, cardData, settings.showArabicScript]);

  // Generate options (1 correct + 3 distractors)
  const options = useMemo(() => {
    // For quiz types with provided options (conjugation, cloze)
    if (questionConfig.useProvidedOptions && cardData.options) {
      return cardData.options.map((opt, idx) => ({
        id: `opt-${idx}`,
        text: opt,
        isCorrect: opt === questionConfig.correctAnswer
      }));
    }

    // For standard quiz types, generate distractors
    const potentialDistractors = allCards.filter(c => c.id !== cardData.id);
    
    // Shuffle and pick 3
    const distractors = potentialDistractors
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
      
    // Combine with correct answer
    const allOptions = [
      { id: cardData.id, text: questionConfig.correctAnswer, isCorrect: true },
      ...distractors.map(d => ({ id: d.id, text: questionConfig.getDistractorText(d), isCorrect: false }))
    ];

    // Shuffle options so correct answer isn't always first
    return allOptions.sort(() => 0.5 - Math.random());
  }, [cardData, allCards, questionConfig]); // Re-run when card or quiz type changes

  const handleOptionClick = (option) => {
    if (isAnswered) return; // Prevent multiple clicks

    setSelectedAnswer(option);
    setIsAnswered(true);

    if (option.isCorrect) {
      playCorrect();
      if (cardData.arabic) {
        playPronunciation(cardData.arabic);
      }
      // Delay before moving on to let user see feedback
      setTimeout(() => {
        onRate('correct'); // Maps to SRS Grade 4-5
      }, 1500);
    } else {
      playIncorrect();
      // Show failure feedback, then move on
       setTimeout(() => {
        onRate('incorrect'); // Maps to SRS Grade 1
      }, 2000);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-4)'
    }}>
      {/* Question Card */}
      <div style={{
        background: 'white',
        padding: 'var(--spacing-8)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        textAlign: 'center',
        border: '2px solid var(--color-primary-light)'
      }}>
        <span style={{ 
          fontSize: '0.9rem', 
          color: 'var(--color-text-light)', 
          textTransform: 'uppercase', 
          letterSpacing: '1px' 
        }}>
          {questionConfig.promptLabel}
        </span>
        <h2 style={{ 
          ...questionConfig.promptStyle,
          color: 'var(--color-text)', 
          margin: 'var(--spacing-4) 0',
        }}>
          {questionConfig.prompt}
        </h2>
        {type && <span style={{ fontSize: '0.8rem', color: '#999' }}>({type})</span>}
      </div>

      {/* Options Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        {options.map((option) => {
          let style = {
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid #eee',
            background: 'white',
            ...questionConfig.optionStyle,
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'center',
            fontWeight: 'bold'
          };

          // Feedback Styles
          if (isAnswered) {
             if (option.isCorrect) {
               style.background = 'var(--color-success)';
               style.color = 'white';
               style.borderColor = 'var(--color-success)';
             } else if (selectedAnswer === option && !option.isCorrect) {
               style.background = 'var(--color-error)';
               style.color = 'white';
               style.borderColor = 'var(--color-error)';
             } else {
               style.opacity = 0.5; // Dim others
             }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              disabled={isAnswered}
              style={style}
            >
              {option.text}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizCard;
