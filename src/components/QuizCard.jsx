import React, { useState, useEffect, useMemo } from 'react';
import { useAudio } from '../hooks/useAudio';

const QuizCard = ({ cardData, allCards, onRate }) => {
  const { arabic, english, type } = cardData;
  const { playCorrect, playIncorrect, playPronunciation } = useAudio();
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Generate options (1 correct + 3 distractors)
  const options = useMemo(() => {
    // Filter out the current card to get potential distractors
    const potentialDistractors = allCards.filter(c => c.id !== cardData.id);
    
    // Shuffle and pick 3
    const distractors = potentialDistractors
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
      
    // Combine with correct answer
    const allOptions = [
      { id: cardData.id, text: arabic, isCorrect: true },
      ...distractors.map(d => ({ id: d.id, text: d.arabic, isCorrect: false }))
    ];

    // Shuffle options so correct answer isn't always first
    return allOptions.sort(() => 0.5 - Math.random());
  }, [cardData.id, allCards]); // Re-run when card changes

  const handleOptionClick = (option) => {
    if (isAnswered) return; // Prevent multiple clicks

    setSelectedAnswer(option);
    setIsAnswered(true);

    if (option.isCorrect) {
      playCorrect();
      playPronunciation(cardData.arabic);
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
          Translate this
        </span>
        <h2 style={{ 
          fontSize: '2.5rem', 
          color: 'var(--color-text)', 
          margin: 'var(--spacing-4) 0',
          fontFamily: 'var(--font-family-english)'
        }}>
          {english}
        </h2>
        <span style={{ fontSize: '0.8rem', color: '#999' }}>({type})</span>
      </div>

      {/* Options Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        {options.map((option) => {
          let style = {
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid #eee',
            background: 'white',
            fontSize: '1.25rem',
            fontFamily: 'var(--font-family-arabic)',
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
