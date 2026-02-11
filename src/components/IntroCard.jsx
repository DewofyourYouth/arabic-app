import React, { useEffect, useState } from 'react';
import { useAudio } from '../hooks/useAudio';
import { useSettings } from '../contexts/SettingsContext';

const IntroCard = ({ cardData, onNext }) => {
  const { arabic, english, transliteration, type } = cardData;
  const { playPronunciation } = useAudio();
  const { settings } = useSettings();

  // Auto-play audio on mount
  useEffect(() => {
    // Small delay for smoother UX
    const timer = setTimeout(() => {
        playPronunciation(arabic);
    }, 500);
    return () => clearTimeout(timer);
  }, [arabic, playPronunciation]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-6)',
      alignItems: 'center',
      animation: 'fadeIn 0.5s ease'
    }}>
      
      <div style={{
        background: 'white',
        padding: 'var(--spacing-8)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        textAlign: 'center',
        border: '2px solid var(--color-primary-light)',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* "New Word" Badge */}
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            background: 'var(--color-accent)',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            padding: '4px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textAlign: 'center'
        }}>
            New Word
        </div>

        {/* Vocabulary Image */}
        {cardData.image && (
          <div style={{ 
            marginTop: 'var(--spacing-6)',
            marginBottom: 'var(--spacing-2)',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <img 
              src={`/src/assets/vocab/${cardData.image}`}
              alt={english}
              style={{
                maxWidth: '200px',
                maxHeight: '200px',
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

        <div style={{ marginTop: 'var(--spacing-4)' }}>
           {english && <h3 style={{ 
            fontSize: '1.5rem', 
            color: 'var(--color-text)',
            fontFamily: 'var(--font-family-english)',
            marginBottom: 'var(--spacing-4)'
            }}>
            {english}
            </h3>}

            {settings.showArabicScript && (
              <h2 style={{ 
              fontSize: '3rem', 
              color: 'var(--color-primary)', 
              marginBottom: 'var(--spacing-2)',
              fontFamily: 'var(--font-family-arabic)',
              direction: 'rtl'
              }}>
              {arabic}
              </h2>
            )}
            <p style={{ 
            fontSize: '1.2rem', 
            color: 'var(--color-text-light)',
            marginBottom: 'var(--spacing-4)',
            fontStyle: 'italic'
            }}>
            {transliteration}
            </p>
            
            <hr style={{ border: 'none', borderTop: '2px dashed #eee', margin: 'var(--spacing-4) 0' }} />


            <span style={{ fontSize: '0.9rem', color: '#999' }}>({type})</span>
        </div>

        <button 
            onClick={() => playPronunciation(arabic)}
            style={{
                marginTop: 'var(--spacing-6)',
                background: 'var(--color-background)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                width: '50px',
                height: '50px',
                fontSize: '1.5rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                color: 'var(--color-primary)'
            }}
        >
            🔊
        </button>
      </div>

      <button 
        onClick={onNext}
        style={{
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          padding: '16px 48px',
          borderRadius: 'var(--radius-full)',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 0 var(--color-primary-dark)',
          transition: 'transform 0.1s',
          width: '100%'
        }}
      >
        Got it! 👍
      </button>

    </div>
  );
};

export default IntroCard;
