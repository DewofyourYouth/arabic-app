import React from 'react';

const Fennec = ({ mood = 'idle', size = 40 }) => {
  const animations = {
    idle: {
      ears: 'animate-ear-wiggle',
      tail: 'animate-tail-sway',
      eyes: 'animate-blink'
    },
    happy: {
      ears: 'animate-ear-bounce',
      tail: 'animate-tail-wag',
      eyes: 'animate-sparkle'
    },
    sad: {
      ears: 'animate-ear-droop',
      tail: '',
      eyes: ''
    },
    celebrating: {
      ears: 'animate-ear-party',
      tail: 'animate-tail-spin',
      eyes: 'animate-star-eyes'
    }
  };

  const currentAnim = animations[mood] || animations.idle;

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <style>{`
        @keyframes ear-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        @keyframes ear-bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(-5deg); }
        }
        @keyframes ear-droop {
          0%, 100% { transform: rotate(15deg); }
          50% { transform: rotate(20deg); }
        }
        @keyframes ear-party {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-10deg) scale(1.1); }
          75% { transform: rotate(10deg) scale(1.1); }
        }
        @keyframes tail-sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes tail-wag {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes tail-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        
        .animate-ear-wiggle { animation: ear-wiggle 3s ease-in-out infinite; }
        .animate-ear-bounce { animation: ear-bounce 0.6s ease-in-out infinite; }
        .animate-ear-droop { animation: ear-droop 2s ease-in-out infinite; }
        .animate-ear-party { animation: ear-party 0.5s ease-in-out infinite; }
        .animate-tail-sway { animation: tail-sway 2s ease-in-out infinite; }
        .animate-tail-wag { animation: tail-wag 0.4s ease-in-out infinite; }
        .animate-tail-spin { animation: tail-spin 1s linear infinite; }
        .animate-blink { animation: blink 4s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 0.8s ease-in-out infinite; }
      `}</style>
      
      <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        {/* Tail */}
        <g 
          style={{ transformOrigin: '80% 70%' }} 
          className={currentAnim.tail}
        >
          <path 
            d="M 75 65 Q 85 55, 95 50 Q 90 55, 92 62 Q 88 60, 85 65 Q 83 62, 80 65" 
            fill="#F2CC8F" 
            stroke="#C66248" 
            strokeWidth="1"
          />
          <ellipse cx="92" cy="52" rx="4" ry="5" fill="white" opacity="0.6" />
        </g>

        {/* Body */}
        <ellipse cx="50" cy="60" rx="20" ry="22" fill="#E07A5F" />
        
        {/* Head */}
        <circle cx="50" cy="40" r="18" fill="#E07A5F" />
        
        {/* Left Ear */}
        <g 
          style={{ transformOrigin: '38px 25px' }} 
          className={currentAnim.ears}
        >
          <path 
            d="M 38 25 L 30 5 L 40 18 Z" 
            fill="#E07A5F" 
            stroke="#C66248" 
            strokeWidth="1.5"
          />
          <path 
            d="M 36 22 L 32 10 L 38 20 Z" 
            fill="#F4F1DE" 
          />
        </g>

        {/* Right Ear */}
        <g 
          style={{ transformOrigin: '62px 25px' }} 
          className={currentAnim.ears}
        >
          <path 
            d="M 62 25 L 70 5 L 60 18 Z" 
            fill="#E07A5F" 
            stroke="#C66248" 
            strokeWidth="1.5"
          />
          <path 
            d="M 64 22 L 68 10 L 62 20 Z" 
            fill="#F4F1DE" 
          />
        </g>

        {/* Snout/Face Patch */}
        <ellipse cx="50" cy="45" rx="10" ry="8" fill="#F4F1DE" />

        {/* Eyes */}
        <g className={currentAnim.eyes}>
          {mood === 'celebrating' ? (
            <>
              {/* Star eyes for celebrating */}
              <g>
                <path d="M 42 36 L 43 38 L 45 38 L 43.5 39.5 L 44 41.5 L 42 40 L 40 41.5 L 40.5 39.5 L 39 38 L 41 38 Z" fill="#F2CC8F" stroke="#3D405B" strokeWidth="0.5" />
                <path d="M 58 36 L 59 38 L 61 38 L 59.5 39.5 L 60 41.5 L 58 40 L 56 41.5 L 56.5 39.5 L 55 38 L 57 38 Z" fill="#F2CC8F" stroke="#3D405B" strokeWidth="0.5" />
              </g>
            </>
          ) : mood === 'sad' ? (
            <>
              {/* Sad eyes */}
              <ellipse cx="43" cy="38" rx="2.5" ry="3" fill="#3D405B" opacity="0.7" />
              <ellipse cx="57" cy="38" rx="2.5" ry="3" fill="#3D405B" opacity="0.7" />
            </>
          ) : (
            <>
              {/* Normal eyes with highlights */}
              <circle cx="43" cy="38" r="3" fill="#3D405B" />
              <circle cx="57" cy="38" r="3" fill="#3D405B" />
              <circle cx="44" cy="37" r="1.2" fill="white" opacity="0.9" />
              <circle cx="58" cy="37" r="1.2" fill="white" opacity="0.9" />
            </>
          )}
        </g>

        {/* Nose */}
        <ellipse cx="50" cy="44" rx="2" ry="1.5" fill="#3D405B" />

        {/* Mouth/Smile */}
        {mood === 'happy' || mood === 'celebrating' ? (
          <path 
            d="M 45 47 Q 50 50, 55 47" 
            fill="none" 
            stroke="#3D405B" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
        ) : mood === 'sad' ? (
          <path 
            d="M 45 50 Q 50 48, 55 50" 
            fill="none" 
            stroke="#3D405B" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
        ) : (
          <path 
            d="M 47 48 Q 50 49, 53 48" 
            fill="none" 
            stroke="#3D405B" 
            strokeWidth="1" 
            strokeLinecap="round"
          />
        )}

        {/* Whiskers */}
        <g stroke="#3D405B" strokeWidth="0.8" opacity="0.6">
          <line x1="35" y1="43" x2="25" y2="42" strokeLinecap="round" />
          <line x1="35" y1="46" x2="25" y2="47" strokeLinecap="round" />
          <line x1="65" y1="43" x2="75" y2="42" strokeLinecap="round" />
          <line x1="65" y1="46" x2="75" y2="47" strokeLinecap="round" />
        </g>

        {/* Paws/Feet */}
        <ellipse cx="42" cy="78" rx="5" ry="6" fill="#E07A5F" />
        <ellipse cx="58" cy="78" rx="5" ry="6" fill="#E07A5F" />
        
        {/* Paw details */}
        <ellipse cx="42" cy="80" rx="3" ry="2" fill="#F4F1DE" opacity="0.7" />
        <ellipse cx="58" cy="80" rx="3" ry="2" fill="#F4F1DE" opacity="0.7" />

        {/* Celebration confetti for celebrating mood */}
        {mood === 'celebrating' && (
          <g opacity="0.8">
            <circle cx="20" cy="20" r="2" fill="#F2CC8F">
              <animate attributeName="cy" values="20;30;20" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="80" cy="25" r="2" fill="#81B29A">
              <animate attributeName="cy" values="25;35;25" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="15" cy="35" r="1.5" fill="#E07A5F">
              <animate attributeName="cy" values="35;45;35" dur="0.9s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.3;1" dur="0.9s" repeatCount="indefinite" />
            </circle>
          </g>
        )}
      </svg>
    </div>
  );
};

export default Fennec;
