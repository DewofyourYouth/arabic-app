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
        const displayTransliteration = settings.nativeLanguage === 'hebrew'
          ? (cardData.hebrewTransliteration || transliteration)
          : transliteration;

        return {
          prompt: settings.showArabicScript ? arabic : displayTransliteration,
          promptLabel: settings.nativeLanguage === 'hebrew'
            ? (settings.showArabicScript ? 'תרגם את זה' : 'תרגם את זה (תעתיק)')
            : (settings.showArabicScript ? 'Translate this' : 'Translate this (transliteration)'),
          correctAnswer: settings.nativeLanguage === 'hebrew' ? (cardData.hebrew || english) : english,
          getDistractorText: (card) => settings.nativeLanguage === 'hebrew' ? (card.hebrew || card.english) : card.english,
          promptStyle: {
            fontFamily: settings.showArabicScript ? 'var(--font-family-arabic)' : 'inherit',
            fontSize: settings.showArabicScript ? '2.5rem' : '1.5rem',
            direction: settings.showArabicScript || (settings.nativeLanguage === 'hebrew' && !settings.showArabicScript) ? 'rtl' : 'ltr'
          },
          optionStyle: {
            direction: settings.nativeLanguage === 'hebrew' ? 'rtl' : 'ltr'
          }
        };
      case 'en-to-trans':
        // "How do you pronounce this?"
        return {
          prompt: settings.nativeLanguage === 'hebrew' ? (cardData.hebrew || english) : english,
          promptLabel: settings.nativeLanguage === 'hebrew' ? 'איך מבטאים את זה?' : 'How do you pronounce this?',
          correctAnswer: settings.nativeLanguage === 'hebrew' ? (cardData.hebrewTransliteration || transliteration) : transliteration,
          getDistractorText: (card) => settings.nativeLanguage === 'hebrew' ? (card.hebrewTransliteration || card.transliteration) : card.transliteration,
          promptStyle: {
            fontSize: '1.8rem',
            direction: settings.nativeLanguage === 'hebrew' ? 'rtl' : 'ltr'
          },
          optionStyle: {
            fontFamily: 'inherit',
            fontSize: '1.1rem',
            direction: settings.nativeLanguage === 'hebrew' ? 'rtl' : 'ltr'
          }
        };
      case 'conjugation':
        // For verb conjugation quizzes
        const pronoun = cardData.pronoun || 'ana';
        const verb = cardData.verb || {};
        return {
          prompt: `${cardData.pronounDisplay || pronoun} + ${verb.translation || ''}`,
          promptLabel: settings.nativeLanguage === 'hebrew' ? 'הטה את הפועל' : 'Conjugate the verb',
          correctAnswer: cardData.correctConjugation || '',
          getDistractorText: () => '', // Distractors provided in cardData
          promptStyle: { fontFamily: 'var(--font-family-english)', fontSize: '1.5rem' },
          optionStyle: {
            fontFamily: settings.showArabicScript ? 'var(--font-family-arabic)' : 'var(--font-family-english)',
            fontSize: '1.25rem',
            fontStyle: settings.showArabicScript ? 'normal' : 'italic',
            direction: settings.showArabicScript ? 'rtl' : 'ltr'
          },
          useProvidedOptions: true,
          showTransliteration: !settings.showArabicScript
        };
      case 'cloze':
        // For fill-in-blank quizzes
        return {
          prompt: cardData.sentence || '',
          promptLabel: settings.nativeLanguage === 'hebrew' ? 'השלם את החסר' : 'Fill in the blank',
          correctAnswer: cardData.correctAnswer || '',
          getDistractorText: () => '', // Distractors provided in cardData
          promptStyle: {
            fontFamily: 'var(--font-family-arabic)',
            fontSize: '1.8rem',
            lineHeight: '1.8',
            fontStyle: 'normal',
            direction: 'rtl'
          },
          optionStyle: {
            fontFamily: 'var(--font-family-arabic)',
            fontSize: '1.25rem',
            fontStyle: 'normal',
            direction: 'rtl'
          },
          useProvidedOptions: true,
          showTransliteration: !settings.showArabicScript,
          subtitle: settings.nativeLanguage === 'hebrew' ? (cardData.hebrewTranslation || cardData.sentenceEnglish) : cardData.sentenceEnglish
        };
      case 'en-to-ar':
      default:
        // "Native to Arabic"
        const sourceText = settings.nativeLanguage === 'hebrew' ? (cardData.hebrew || english) : english;
        const targetText = settings.showArabicScript
          ? arabic
          : (settings.nativeLanguage === 'hebrew' ? (cardData.hebrewTransliteration || transliteration) : transliteration);

        return {
          prompt: sourceText,
          promptLabel: settings.nativeLanguage === 'hebrew' ? 'תרגם את זה' : 'Translate this',
          correctAnswer: targetText,
          getDistractorText: (card) => settings.showArabicScript
            ? card.arabic
            : (settings.nativeLanguage === 'hebrew' ? (card.hebrewTransliteration || card.transliteration) : card.transliteration),
          promptStyle: {
            fontFamily: 'var(--font-family-english)',
            fontSize: '2rem',
            direction: settings.nativeLanguage === 'hebrew' ? 'rtl' : 'ltr'
          },
          optionStyle: {
            fontFamily: settings.showArabicScript ? 'var(--font-family-arabic)' : 'var(--font-family-english)',
            fontSize: '1.25rem',
            fontStyle: settings.showArabicScript ? 'normal' : 'italic',
            direction: settings.showArabicScript || (settings.nativeLanguage === 'hebrew' && !settings.showArabicScript) ? 'rtl' : 'ltr'
          }
        };
    }
  }, [quizType, arabic, transliteration, english, cardData, settings.showArabicScript]);

  // Generate options (1 correct + 3 distractors)
  // Generate options (1 correct + 3 distractors)
  const options = useMemo(() => {
    // For quiz types with provided options (conjugation, cloze)
    // If 'options' field exists (Conjugation), use it.
    // IF 'distractors' exists (Cloze), generate options from it.
    if (questionConfig.useProvidedOptions) {
      if (cardData.options) {
        return cardData.options.map((opt, idx) => {
          // Handle object options (Conjugation) vs string options (Cloze)
          const isObject = typeof opt === 'object' && opt !== null;
          const text = isObject ? (settings.showArabicScript ? opt.arabic : opt.transliteration) : opt;
          const valueToCheck = isObject ? opt.arabic : opt;

          return {
            id: `opt-${idx}`,
            text: text,
            isCorrect: valueToCheck === questionConfig.correctAnswer
          };
        });
      }

      // Handle Cloze type with 'distractors' list
      if (cardData.distractors) {
        const correctText = questionConfig.correctAnswer;

        // Choose distractors based on language setting if available
        let distractorsList = cardData.distractors;
        let correctDisplay = correctText;

        // If we are in Hebrew mode and strictly want to show Hebrew options?
        // Wait, for Cloze, the answer is usually in ARABIC (to fill the blank).
        // The prompt is "Fill in the blank".
        // The sentence has a blank.
        // The options should be in ARABIC usually.
        // Checking the JSON: correctAnswer is Arabic ("بدي").
        // Distractors are Arabic ("بنام", "باكل"...).
        // So options should remain Arabic regardless of UI language (Hebrew/English).
        // UNLESS the prompt implies translating the missing word?
        // "I _____ coffee" -> Options: want, sleep, eat?
        // The sentence is "أنا _____ قهوة".
        // So options MUST be Arabic.

        // However, the user provided 'hebrewDistractors'.
        // Maybe they want the options to be in Hebrew?
        // If the goal is "Select the correct Arabic word", options should be Arabic.
        // If the goal is "Select the meaning", options would be Hebrew/English.
        // In 'cloze', usually you fill the Arabic sentence with an Arabic word.
        // So 'hebrewDistractors' might be unused for the OPTIONS themselves, 
        // but maybe useful for "Translate this option" hints?
        // Or maybe the user WANTS Hebrew options?
        // Let's stick to Arabic options for now as per standard Cloze logic (filling Arabic blank).

        // BUT, if I look at 'hebrewTranslation' in the JSON, it is "רוצה" (want).
        // Maybe that's for the subtitle/translation of the sentence.

        // Let's stick to using 'distractors' (Arabic) for the options.
        // If the user INTENDED Hebrew options, I'd need to know.
        // Given the sentence is Arabic, the options should likely be Arabic.

        const distractors = distractorsList
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        const allOptions = [
          { id: 'correct', text: correctText, isCorrect: true },
          ...distractors.map((d, i) => ({ id: `dist-${i}`, text: d, isCorrect: false }))
        ];

        return allOptions.sort(() => 0.5 - Math.random());
      }
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
  }, [cardData, allCards, questionConfig, settings.showArabicScript]); // Re-run when card or quiz type changes

  const handleOptionClick = (option) => {
    if (isAnswered) return; // Prevent multiple clicks

    setSelectedAnswer(option);
    setIsAnswered(true);

    if (option.isCorrect) {
      playCorrect();
      if (cardData.arabic) {
        playPronunciation(cardData.arabic, cardData);
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

        {/* Vocabulary Image - Only show if the answer isn't English (spoiler!) */}
        {cardData.image &&
          (quizType === 'en-to-ar' || quizType === 'en-to-trans') &&
          questionConfig.correctAnswer !== cardData.english && (
            <div style={{
              margin: 'var(--spacing-4) 0',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <img
                src={`/src/assets/vocab/${cardData.image}`}
                alt={cardData.english}
                style={{
                  maxWidth: '180px',
                  maxHeight: '180px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

        <h2 style={{
          ...questionConfig.promptStyle,
          color: 'var(--color-text)',
          margin: 'var(--spacing-4) 0',
        }}>
          {questionConfig.prompt}
        </h2>

        {questionConfig.subtitle && (
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--color-text-light)',
            marginTop: 'var(--spacing-2)',
            fontStyle: 'italic'
          }}>
            {questionConfig.subtitle}
          </p>
        )}
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
