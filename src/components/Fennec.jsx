import React from 'react';
import fennecIdle from '../assets/fennec_mascot_idle.png';
import fennecHappy from '../assets/fennec_mascot_happy.png';
import fennecSad from '../assets/fennec_mascot_sad.png';

const Fennec = ({ mood = 'idle', size = 40 }) => {
  const mascots = {
    idle: fennecIdle,
    happy: fennecHappy,
    sad: fennecSad,
    celebrating: fennecHappy // Using happy image for celebrating too, maybe adds extra CSS animation
  };

  const animations = {
    idle: 'animate-breathe',
    happy: 'animate-bounce',
    sad: '', // Sad image speaks for itself, maybe subtle fade
    celebrating: 'animate-celebrate'
  };

  const currentMascot = mascots[mood] || mascots.idle;
  const currentAnim = animations[mood] || animations.idle;

  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes celebrate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(-5deg); }
          75% { transform: scale(1.1) rotate(5deg); }
        }
        
        .animate-breathe { animation: breathe 3s ease-in-out infinite; }
        .animate-bounce { animation: bounce 0.6s ease-in-out infinite; }
        .animate-celebrate { animation: celebrate 0.5s ease-in-out infinite; }
        
        .mascot-transition {
          transition: opacity 0.3s ease-in-out;
        }
      `}</style>
      
      <img 
        key={mood} // Force re-render for clean switch or remove to use transition if managing opacity manually
        src={currentMascot} 
        alt={`Fennec Mascot ${mood}`}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
        }}
        className={`${currentAnim} mascot-transition`}
      />
    </div>
  );
};

export default Fennec;
