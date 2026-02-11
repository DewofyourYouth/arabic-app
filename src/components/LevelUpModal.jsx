
import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

const LevelUpModal = ({ level, onContinue }) => {
  
  useEffect(() => {
    // Fire confetti when mounted
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500', '#FF4500']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500', '#FF4500']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'white',
        padding: 'var(--spacing-8)',
        borderRadius: 'var(--radius-xl)',
        textAlign: 'center',
        maxWidth: '90%',
        width: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>
          🎉
        </div>
        
        <h2 style={{ 
          fontSize: '2.5rem', 
          color: 'var(--color-primary)',
          marginBottom: 'var(--spacing-2)',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Level Up!
        </h2>
        
        <div style={{ 
          fontSize: '5rem', 
          fontWeight: '900', 
          color: 'var(--color-accent)',
          marginBottom: 'var(--spacing-4)',
          textShadow: '2px 2px 0px #00000020'
        }}>
          {level}
        </div>
        
        <p style={{ 
          fontSize: '1.2rem', 
          color: 'var(--color-text)',
          marginBottom: 'var(--spacing-6)'
        }}>
          You've reached Level {level}! <br/>
          <span style={{ fontSize: '1rem', color: 'var(--color-text-light)' }}>
            New verbs have been unlocked for your conjugation practice.
          </span>
        </p>
        
        <button
          onClick={onContinue}
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            padding: 'var(--spacing-3) var(--spacing-8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'transform 0.1s',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Awesome!
        </button>
      </div>
      
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LevelUpModal;
