import React from 'react';
import { useAudio } from '../hooks/useAudio';
import { useSettings } from '../contexts/SettingsContext';

const LessonIntro = ({ levelId, newCards, onStartSession, onCancel, isReviewMode }) => {
  const { playAudio } = useAudio();
  const { settings } = useSettings();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      padding: 'var(--spacing-4)'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
          {isReviewMode ? 'Location Guide' : 'Lesson Preview'}
        </h2>
        <p style={{ color: '#666' }}>
          {isReviewMode
            ? 'Review all the phrases and words in this location.'
            : 'Here is what you will learn in this session. Review the items below, then start your practice!'}
        </p>
      </div>

      {/* List of New Items */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingBottom: '20px'
      }}>
        {newCards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888', fontStyle: 'italic' }}>
            No new items to introduce. This session will be a review!
          </div>
        ) : (
          newCards.map((card, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'white',
                padding: '16px',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-sm)',
                borderLeft: '4px solid var(--color-accent)'
              }}
            >
              {/* Audio Button */}
              <button
                onClick={() => playAudio(card.audio || card.arabic)}
                style={{
                  background: 'var(--color-primary-light)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  marginRight: '16px',
                  color: 'var(--color-primary)'
                }}
              >
                🔊
              </button>

              {/* Text Content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-family-arabic)',
                  marginBottom: '4px'
                }}>
                  {card.arabic}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#888',
                  marginBottom: '2px'
                }}>
                  {card.transliteration}
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: 'var(--color-secondary)',
                  fontWeight: '500',
                  direction: settings.nativeLanguage === 'hebrew' ? 'rtl' : 'ltr'
                }}>
                  {settings.nativeLanguage === 'hebrew' ? (card.hebrew || card.english) : card.english}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div style={{ marginTop: 'var(--spacing-4)', display: 'flex', gap: '16px' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '16px',
            background: 'white',
            border: '2px solid #eee',
            borderRadius: 'var(--radius-full)',
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#666',
            cursor: 'pointer'
          }}
        >
          {isReviewMode ? 'Back to Map' : 'Cancel'}
        </button>
        <button
          onClick={onStartSession}
          style={{
            flex: 2,
            padding: '16px',
            background: 'var(--color-primary)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}
        >
          {isReviewMode ? 'Start Practice' : 'Start Practice'}
        </button>
      </div>
    </div>
  );
};

export default LessonIntro;
