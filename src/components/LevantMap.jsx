import React, { useState } from 'react';

// Assets (Assuming these will be in public/assets or imported if using Vite's asset handling)
// For now using direct paths assuming they are in public/
const MAP_BG = '/src/assets/map_levant_stylized.png';

// CSS for Pulse Animation (injected here for simplicity)
const pulseKeyframes = `
@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 111, 81, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(231, 111, 81, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 111, 81, 0); }
}
`;

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
    id: 'eilat',
    name: 'Eilat', 
    label: 'Red Sea Port', 
    minLevel: 2, 
    x: 40, 
    y: 89,
    artifact: {
      image: ARTIFACT_WADI_RUM, 
      name: 'Coral Reef',
      description: 'Beautiful underwater gardens of the Red Sea.'
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
    id: 'beersheba', 
    name: 'Beer Sheba', 
    label: 'Negev Capital', 
    minLevel: 4, 
    x: 35, 
    y: 65,
    artifact: {
      image: ARTIFACT_PETRA,
      name: 'Abraham\'s Well',
      description: 'Ancient well associated with the patriarch.'
    }
  },
  {
    id: 'jerash',
    name: 'Jerash',
    label: 'Roman Ruins',
    minLevel: 5,
    x: 70,
    y: 28,
    artifact: {
      image: ARTIFACT_AMMAN,
      name: 'Roman Column Fragment',
      description: 'Piece of the extensive Roman architecture.'
    }
  },
  { 
    id: 'beirut', 
    name: 'Beirut', 
    label: 'Coastal Gem', 
    minLevel: 5, 
    x: 55, 
    y: 15,
    artifact: {
      image: ARTIFACT_AMMAN,
      name: 'Cedar Tree',
      description: 'Symbol of Lebanon\'s resilience.'
    }
  },
  { 
    id: 'masada',
    name: 'Masada',
    label: 'Desert Fortress',
    minLevel: 5,
    x: 48,
    y: 60,
    artifact: {
      image: ARTIFACT_AMMAN,
      name: 'Roman Scroll',
      description: 'Ancient texts preserved in the desert climate.'
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
    id: 'hebron', 
    name: 'Hebron', 
    label: 'Ancient City', 
    minLevel: 6, 
    x: 45, 
    y: 58,
    artifact: {
      image: ARTIFACT_JERUSALEM,
      name: 'Glass Blowing',
      description: 'Famous Hebron glass art.'
    }
  },
  {
    id: 'haifa',
    name: 'Haifa',
    label: 'Bahai Gardens',
    minLevel: 6,
    x: 35,
    y: 35,
    artifact: {
      image: ARTIFACT_AMMAN,
      name: 'Mount Carmel Flora',
      description: 'Unique species from the holy mountain.'
    }
  },
  {
    id: 'tiberias',
    name: 'Tiberias',
    label: 'Sea of Galilee',
    minLevel: 6,
    x: 48,
    y: 32,
    artifact: {
      image: ARTIFACT_JERUSALEM,
      name: 'St. Peter\'s Fish',
      description: 'Famous fish from the Sea of Galilee.'
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
      image: ARTIFACT_JERICHO, 
      name: 'Nabulsi Soap',
      description: 'Handmade olive oil soap, a tradition for centuries.'
    }
  },
  {
    id: 'ramallah',
    name: 'Ramallah',
    label: 'Cultural Hub',
    minLevel: 7,
    x: 45,
    y: 45,
    artifact: {
      image: ARTIFACT_JERUSALEM,
      name: 'Debke Scarf',
      description: 'Symbol of traditional Palestinian dance.'
    }
  },
  {
    id: 'akko',
    name: 'Akko',
    label: 'Crusader Halls',
    minLevel: 7,
    x: 35,
    y: 30,
    artifact: {
      image: ARTIFACT_JERUSALEM,
      name: 'Knight\'s Helmet',
      description: 'Relic from the Crusader period.'
    }
  },
  { 
    id: 'suwayda', 
    name: 'As-Suwayda', 
    label: 'Black Basalt', 
    minLevel: 7, 
    x: 80, 
    y: 25,
    artifact: {
      image: ARTIFACT_WADI_RUM,
      name: 'Basalt Stone',
      description: 'Volcanic rock used in local architecture.'
    }
  },
  {
    id: 'byblos',
    name: 'Byblos',
    label: 'Oldest Port',
    minLevel: 8,
    x: 55,
    y: 10,
    artifact: {
      image: ARTIFACT_AMMAN,
      name: 'Phoenician Alphabet',
      description: 'Birthplace of the modern alphabet.'
    }
  },
  { 
    id: 'damascus', 
    name: 'Damascus', 
    label: 'City of Jasmine', 
    minLevel: 8, 
    x: 75, 
    y: 15,
    artifact: {
      image: ARTIFACT_AMMAN,
      name: 'Damascus Steel',
      description: 'Legendary sword-making technique.'
    }
  },
  {
    id: 'baalbek',
    name: 'Baalbek',
    label: 'Temple of Jupiter',
    minLevel: 9,
    x: 65,
    y: 12,
    artifact: {
      image: ARTIFACT_PETRA,
      name: 'Keystone Fragment',
      description: 'Massive stone from the temple complex.'
    }
  },
  { 
    id: 'aleppo', 
    name: 'Aleppo', 
    label: 'The Citadel', 
    minLevel: 9, 
    x: 75, 
    y: 5,
    artifact: {
      image: ARTIFACT_PETRA,
      name: 'Aleppo Soap',
      description: 'Famous laurel soap.'
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
  const [showLabels, setShowLabels] = useState(false); // Default: labels hidden
  const [hoveredCityId, setHoveredCityId] = useState(null);

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
      
      {/* Visibility Toggle */}
      <button 
        onClick={() => setShowLabels(!showLabels)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 20,
          background: 'rgba(255, 255, 255, 0.9)',
          border: '2px solid var(--color-primary)',
          borderRadius: '20px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontWeight: 'bold',
          color: 'var(--color-primary)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {showLabels ? '👁️ Hide Labels' : '👁️‍🗨️ Show Labels'}
      </button>
      
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
            onMouseEnter={() => setHoveredCityId(city.id)}
            onMouseLeave={() => setHoveredCityId(null)}
            style={{
              position: 'absolute',
              left: `${city.x}%`,
              top: `${city.y}%`,
              transform: 'translate(-50%, -50%)',
              cursor: isUnlocked ? 'pointer' : 'default',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: hoveredCityId === city.id ? 20 : 10,
              opacity: isUnlocked || isNext ? 1 : 0.6,
              transition: 'all 0.3s ease'
            }}
          >
            {/* Enhanced Location Pin */}
            <div style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              filter: isUnlocked ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'grayscale(1)',
              transform: isUnlocked ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(5px)',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              animation: isNext ? 'pulse 2s infinite' : 'none'
            }}>
               <div style={{
                 width: '40px', height: '40px',
                 background: isUnlocked ? 'var(--color-primary)' : '#999',
                 borderRadius: '50% 50% 50% 0',
                 transform: 'rotate(-45deg)',
                 border: '3px solid white',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.2)'
               }}>
                 <div style={{ transform: 'rotate(45deg)', fontSize: '18px' }}>
                    {/* Icons */}
                    {city.id === 'wadi_rum' && '🏜️'}
                    {city.id === 'eilat' && '🐬'}
                    {city.id === 'petra' && '🏛️'}
                    {city.id === 'beersheba' && '🐫'}
                    {city.id === 'hebron' && '🍇'}
                    {city.id === 'masada' && '🏰'}
                    {city.id === 'jerusalem' && '🕌'}
                    {city.id === 'ramallah' && '🎨'}
                    {city.id === 'nablus' && '🧼'}
                    {city.id === 'haifa' && '🚢'}
                    {city.id === 'akko' && '⚔️'}
                    {city.id === 'tiberias' && '🐟'}
                    {city.id === 'amman' && '🎭'}
                    {city.id === 'jerash' && '🏺'}
                    {city.id === 'jericho' && '🌴'}
                    {city.id === 'beirut' && '⚓'}
                    {city.id === 'byblos' && '📜'}
                    {city.id === 'baalbek' && '🏛️'}
                    {city.id === 'damascus' && '🌸'}
                    {city.id === 'aleppo' && '🏯'}
                    {city.id === 'suwayda' && '🌋'}
                 </div>
               </div>
               {/* Pin Point Shadow Effect */}
               <div style={{
                 width: '10px', height: '4px',
                 background: 'rgba(0,0,0,0.3)',
                 borderRadius: '50%',
                 marginTop: '5px',
                 filter: 'blur(2px)'
               }}></div>
            </div>

            {/* Label - Only show if toggle is ON or hovered */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '6px 14px',
              borderRadius: '20px',
              marginTop: '12px',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center',
              minWidth: '100px',
              border: `1px solid ${isUnlocked ? 'var(--color-primary-light)' : '#ccc'}`,
              opacity: (showLabels || hoveredCityId === city.id) ? 1 : 0,
              transform: (showLabels || hoveredCityId === city.id) ? 'translateY(0)' : 'translateY(-10px)',
              pointerEvents: 'none', // Allow clicking overlapping pins if label is nuisance
              transition: 'all 0.2s ease',
              position: 'absolute', // Float above so it doesn't push layout
              top: '100%'
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
