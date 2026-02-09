import React from 'react';
import Fennec from './Fennec';

/**
 * FennecFeedback - A feedback component featuring the animated Fennec mascot
 * Shows encouraging messages with appropriate animations
 */
const FennecFeedback = ({ type = 'correct', message, onClose }) => {
  const config = {
    correct: {
      mood: 'celebrating',
      bgColor: 'var(--color-success)',
      textColor: 'white',
      defaultMessage: 'رائع! (Amazing!)',
      icon: '🎉'
    },
    incorrect: {
      mood: 'sad',
      bgColor: 'var(--color-warning)',
      textColor: 'var(--color-text)',
      defaultMessage: 'لا بأس، حاول مرة أخرى! (No worries, try again!)',
      icon: '💪'
    },
    encouragement: {
      mood: 'happy',
      bgColor: 'var(--color-secondary)',
      textColor: 'white',
      defaultMessage: 'يلا! (Let\'s go!)',
      icon: '🌟'
    },
    celebration: {
      mood: 'celebrating',
      bgColor: 'var(--color-primary)',
      textColor: 'white',
      defaultMessage: 'مبروك! (Congratulations!)',
      icon: '🏆'
    }
  };

  const current = config[type] || config.encouragement;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: current.bgColor,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-8)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-4)',
          maxWidth: '300px',
          animation: 'slideUp 0.3s ease-out',
          border: '3px solid white'
        }}
      >
        {/* Fennec with bounce animation */}
        <div style={{ animation: 'bounce 1s ease-in-out infinite' }}>
          <Fennec mood={current.mood} size={80} />
        </div>

        {/* Message */}
        <div style={{
          textAlign: 'center',
          color: current.textColor,
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'bold',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-2)'
        }}>
          <div style={{ fontSize: 'var(--font-size-2xl)' }}>
            {current.icon}
          </div>
          <div>{message || current.defaultMessage}</div>
        </div>

        {/* Tap to continue hint */}
        <div style={{
          fontSize: 'var(--font-size-sm)',
          color: current.textColor,
          opacity: 0.8,
          marginTop: 'var(--spacing-2)'
        }}>
          Tap anywhere to continue
        </div>
      </div>
    </div>
  );
};

export default FennecFeedback;
