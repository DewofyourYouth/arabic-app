import React, { useState } from 'react';

// Assets (Assuming these will be in public/assets or imported if using Vite's asset handling)
// For now using direct paths assuming they are in public/
const MAP_BG = '/src/assets/map_levant_stylized.png';

// Artifact Imports (using placeholders until generated)
const ARTIFACT_WADI_RUM = '/src/assets/artifacts/wadi_rum.png';
const ARTIFACT_PETRA = '/src/assets/artifacts/petra.png';
const ARTIFACT_JERUSALEM = '/src/assets/artifacts/jerusalem.png';
const ARTIFACT_JERICHO = '/src/assets/artifacts/jericho.png';
const ARTIFACT_AMMAN = '/src/assets/artifacts/amman.png';

const CITIES = [
  { 
    id: 'wadi_rum', 
    name: 'Wadi Rum', 
    label: 'Bedouin Coffee', 
    minLevel: 1, 
    x: 60, 
    y: 90,
    artifact: {
      image: ARTIFACT_WADI_RUM,
      name: 'Dallah (Coffee Pot)',
      description: 'A symbol of hospitality. Always served with the right hand!'
    }
  },
  { 
    id: 'petra', 
    name: 'Petra', 
    label: 'The Treasury', 
    minLevel: 3, 
    x: 55, 
    y: 75,
    artifact: {
      image: ARTIFACT_PETRA,
      name: 'Nabatean Coin',
      description: 'Ancient currency from the rose-red city.'
    }
  },
  { 
    id: 'amman', 
    name: 'Amman', 
    label: 'The Amphitheater', 
    minLevel: 5, 
    x: 70, 
    y: 35,
    artifact: {
      image: ARTIFACT_AMMAN,
      name: 'Roman Dagger',
      description: 'Relic from Philadelphia (ancient Amman).'
    }
  },
  { 
    id: 'nablus', 
    name: 'Nablus', 
    label: 'Olive Soap', 
    minLevel: 7, 
    x: 48, 
    y: 25,
    artifact: {
      image: ARTIFACT_JERICHO, // Keeping placeholder or renaming if I could, but strictly reusing existing var for now to avoid errors
      name: 'Nabulsi Soap',
      description: 'Handmade olive oil soap, a tradition for centuries.'
    }
  },
  { 
    id: 'jerusalem', 
    name: 'Jerusalem', 
    label: 'Old City Walls', 
    minLevel: 10, 
    x: 45, 
    y: 50,
    artifact: {
      image: ARTIFACT_JERUSALEM,
      name: 'City Key',
      description: 'Iron key to the ancient gates.'
    }
  },
];

const LevantMap = ({ userLevel, onCitySelect }) => {
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  const handleCityClick = (city, isUnlocked) => {
    if (isUnlocked) {
      if (city.artifact) {
        setSelectedArtifact(city);
      } else {
        onCitySelect(city);
      }
    }
  };

  const closeArtifact = () => {
    onCitySelect(selectedArtifact); // Proceed to session after viewing artifact
    setSelectedArtifact(null);
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '600px', 
      backgroundColor: 'var(--color-background)',
      backgroundImage: `url(${MAP_BG})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
      border: '4px solid white'
    }}>
      
      {/* Overlay for better text readability if map is busy */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(244, 241, 222, 0.8), transparent)',
        pointerEvents: 'none'
      }} />

      <h2 style={{
        position: 'absolute',
        top: '20px',
        width: '100%',
        textAlign: 'center',
        color: 'var(--color-secondary)',
        fontFamily: 'var(--font-family-english)',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        fontSize: '1.5rem',
        textShadow: '0 2px 4px rgba(255,255,255,0.8)',
        zIndex: 10
      }}>
        Journey Through The Levant
      </h2>

      {/* Cities */}
      {CITIES.map((city, index) => {
        const isUnlocked = userLevel >= city.minLevel;
        const isNext = !isUnlocked && (index === 0 || userLevel >= CITIES[index-1].minLevel);
        
        return (
          <div 
            key={city.id}
            onClick={() => handleCityClick(city, isUnlocked)}
            style={{
              position: 'absolute',
              left: `${city.x}%`,
              top: `${city.y}%`,
              transform: 'translate(-50%, -50%)',
              cursor: isUnlocked ? 'pointer' : 'not-allowed',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 10,
              opacity: isUnlocked || isNext ? 1 : 0.6,
              transition: 'all 0.3s ease'
            }}
          >
            {/* Location Pin / Icon */}
            <div style={{
              position: 'relative',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: isUnlocked ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' : 'grayscale(1)',
              transition: 'transform 0.2s',
              transform: isUnlocked ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(5px)',
            }}>
               <div style={{
                 width: '100%', height: '100%', 
                 background: isUnlocked ? 'var(--color-primary)' : '#999',
                 borderRadius: '50% 50% 50% 0',
                 transform: 'rotate(-45deg)',
                 border: '3px solid white',
                 display: 'flex', alignItems: 'center', justifyContent: 'center'
               }}>
                 <div style={{ transform: 'rotate(45deg)', fontSize: '24px' }}>
                    {/* Placeholder Icons until images are ready */}
                    {city.id === 'wadi_rum' && '☕'}
                    {city.id === 'petra' && '🏛️'}
                    {city.id === 'amman' && '🗡️'}
                    {city.id === 'jericho' && '💠'}
                    {city.id === 'jerusalem' && '🔑'}
                 </div>
               </div>
            </div>

            {/* Label */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '6px 14px',
              borderRadius: '20px',
              marginTop: '12px',
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'center',
              minWidth: '100px',
              border: `1px solid ${isUnlocked ? 'var(--color-primary-light)' : '#ccc'}`
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                {city.name}
              </div>
              {isUnlocked && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-dark)', fontWeight: '600' }}>
                  {city.label}
                </div>
              )}
               {!isUnlocked && (
                <div style={{ fontSize: '0.75rem', color: '#888' }}>
                  Lvl {city.minLevel}
                </div>
              )}
            </div>
            
          </div>
        );
      })}

      {/* Artifact Modal */}
      {selectedArtifact && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'rgba(61, 64, 91, 0.9)', // Secondary color with opacity
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'var(--color-background)',
            padding: 'var(--spacing-6)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            maxWidth: '300px',
            border: '4px solid var(--color-primary)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            transform: 'scale(1)',
            animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <h3 style={{ color: 'var(--color-secondary)', fontSize: '1.5rem', marginBottom: 'var(--spacing-2)' }}>
              Artifact Found!
            </h3>
            <div style={{
              width: '120px', height: '120px', margin: '0 auto var(--spacing-4)',
              background: 'white', borderRadius: '50%',
              border: '4px solid var(--color-primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {/* Image with fallback */}
              <img 
                src={selectedArtifact.artifact.image} 
                alt={selectedArtifact.artifact.name}
                onError={(e) => {e.target.style.display='none'; e.target.parentNode.innerText='🎁'}}
                style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
              />
            </div>
            <h4 style={{ color: 'var(--color-primary-dark)', fontSize: '1.25rem', marginBottom: 'var(--spacing-2)' }}>
              {selectedArtifact.artifact.name}
            </h4>
            <p style={{ color: 'var(--color-text)', marginBottom: 'var(--spacing-6)', fontSize: '0.9rem', lineHeight: '1.4' }}>
              {selectedArtifact.artifact.description}
            </p>
            <button 
              onClick={closeArtifact}
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 0 var(--color-primary-dark)',
                transition: 'transform 0.1s'
              }}
            >
              Collect & Start
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevantMap;
