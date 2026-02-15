import React, { useEffect } from 'react';
import { useAudio } from '../hooks/useAudio';
import Confetti from 'react-confetti';

const LocationUnlockModal = ({ location, onContinue }) => {
  const { playCorrect } = useAudio();

  useEffect(() => {
    playCorrect();
  }, [playCorrect]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(5px)',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <Confetti 
        width={window.innerWidth} 
        height={window.innerHeight} 
        recycle={false} 
        numberOfPieces={500}
        gravity={0.2}
      />
      
      <div style={{
        background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
        padding: '3px', // Border gradient effect
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        width: '90%',
        maxWidth: '450px',
        transform: 'scale(1)',
        animation: 'slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '21px',
          padding: '40px 30px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          
          {/* Icon / Image */}
          <div style={{
            fontSize: '5rem',
            marginBottom: '10px',
            animation: 'bounce 1s infinite alternate'
          }}>
            🔓
          </div>

          <h2 style={{
            margin: 0,
            fontSize: '2rem',
            background: 'linear-gradient(to right, #FF9966, #FF5E62)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            New Location!
          </h2>

          <div style={{
             height: '2px',
             width: '50px',
             background: '#ddd',
             margin: '0 auto'
          }} />

          <p style={{
            margin: 0,
            fontSize: '1.2rem',
            color: '#555',
            lineHeight: '1.5'
          }}>
            You've unlocked:
          </p>

          <h3 style={{
            margin: 0,
            fontSize: '2.5rem',
            color: '#333',
            fontFamily: 'var(--font-family-english)', // Ensure sleek font
            fontWeight: '800'
          }}>
            {location.name}
          </h3>

          <p style={{
             fontSize: '1rem',
             color: '#888',
             fontStyle: 'italic',
             margin: 0
          }}>
             Qualified! (50% Mastery of Previous Topic)
          </p>

          <button
            onClick={onContinue}
            style={{
              marginTop: '20px',
              background: 'linear-gradient(to right, #FF9966, #FF5E62)',
              color: 'white',
              border: 'none',
              padding: '16px 40px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(255, 94, 98, 0.3)',
              transition: 'transform 0.2s',
              width: '100%'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Let's Go! 🚀
          </button>

        </div>
      </div>
      
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default LocationUnlockModal;
