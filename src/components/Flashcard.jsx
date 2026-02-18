import React, { useEffect } from 'react';
import '../styles/Flashcard.css';
import { useAudio } from '../hooks/useAudio';
import { useSettings } from '../contexts/SettingsContext';

const Flashcard = ({ cardData, isFlipped, onFlip }) => {
  const { arabic, transliteration, english, type } = cardData;
  const { playFlip, playPronunciation } = useAudio();
  const { settings } = useSettings();

  // Play pronunciation automatically when flipped? Optional.
  useEffect(() => {
    if (isFlipped) {
      playFlip();
      // setTimeout(() => playPronunciation(arabic), 600); // Auto-play after flip?
    }
  }, [isFlipped, playFlip]);

  const handleClick = () => {
    if (!isFlipped) {
      onFlip();
    }
  };

  const handleAudioClick = (e) => {
    e.stopPropagation();
    playPronunciation(arabic);
  };

  return (
    <div className="flashcard-container" onClick={handleClick}>
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>

        {/* FRONT - English Question */}
        <div className="flashcard-front">
          <span className="front-hint">
            {settings.nativeLanguage === 'hebrew' ? 'איך אומרים...' : 'How do you say...'}
          </span>

          {/* Vocabulary Image */}
          {cardData.image && (
            <div style={{
              margin: 'var(--spacing-4) 0',
              display: 'flex',
              justifyContent: 'center',
              flex: 1,
              alignItems: 'center'
            }}>
              <img
                src={`/src/assets/vocab/${cardData.image}`}
                alt={english}
                style={{
                  maxWidth: '150px',
                  maxHeight: '150px',
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

          <h2 className="front-word" style={{ direction: settings.nativeLanguage === 'hebrew' ? 'rtl' : 'ltr' }}>
            {settings.nativeLanguage === 'hebrew' ? (cardData.hebrew || english) : english}
          </h2>
          <span className="front-hint" style={{ marginTop: 'auto', fontSize: '0.8rem' }}>
            ({type})
          </span>
        </div>

        {/* BACK - Arabic & Details */}
        <div className="flashcard-back">
          {settings.showArabicScript && (
            <h2 className="back-arabic">{arabic}</h2>
          )}
          <p className="back-transliteration">{transliteration}</p>

          <button
            className="audio-btn"
            onClick={handleAudioClick}
          >
            <span>🔊</span> Play Audio
          </button>
        </div>

      </div>
    </div>
  );
};

export default Flashcard;
