import React, { useEffect } from 'react';
import '../styles/Flashcard.css';
import { useAudio } from '../hooks/useAudio';

const Flashcard = ({ cardData, isFlipped, onFlip }) => {
  const { arabic, transliteration, english, type } = cardData;
  const { playFlip, playPronunciation } = useAudio();

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
          <span className="front-hint">How do you say...</span>
          <h2 className="front-word">{english}</h2>
          <span className="front-hint" style={{ marginTop: 'auto', fontSize: '0.8rem' }}>
            ({type})
          </span>
        </div>

        {/* BACK - Arabic Answer */}
        <div className="flashcard-back">
          <h2 className="back-arabic">{arabic}</h2>
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
