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
            marginBottom: '10px',
            animation: 'bounce 1s infinite alternate'
          }}>
            {location.artifact ? (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '4px solid white',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                margin: '0 auto'
              }}>
                <img src={location.artifact.image} alt={location.artifact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ fontSize: '5rem' }}>🔓</div>
            )}
          </div>

          <h2 style={{
            margin: 0,
            fontSize: '1.8rem', // Slightly smaller to fit everything
            background: 'linear-gradient(to right, #FF9966, #FF5E62)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {location.artifact ? 'Artifact Found!' : 'New Location!'}
          </h2>

          <div style={{
            height: '2px',
            width: '50px',
            background: '#ddd',
            margin: '0 auto'
          }} />

          <p style={{
            margin: 0,
            fontSize: '1rem',
            color: '#555',
            lineHeight: '1.5'
          }}>
            You've unlocked:
          </p>

          <h3 style={{
            margin: 0,
            fontSize: '2.2rem',
            color: '#333',
            fontFamily: 'var(--font-family-english)',
            fontWeight: '800'
          }}>
            {location.name}
          </h3>

          {location.artifact && (
            <div style={{
              background: '#FFF3E0',
              padding: '15px',
              borderRadius: '12px',
              border: '1px solid #FFE0B2',
              marginTop: '10px'
            }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#E65100', fontSize: '1.1rem' }}>{location.artifact.name}</h4>
              <p style={{ margin: 0, color: '#5D4037', fontSize: '0.9rem', fontStyle: 'italic' }}>
                "{location.artifact.description}"
              </p>
            </div>
          )}

          {!location.artifact && (
            <p style={{
              fontSize: '1rem',
              color: '#888',
              fontStyle: 'italic',
              margin: 0
            }}>
              Qualified! (50% Mastery of Previous Topic)
            </p>
          )}

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
