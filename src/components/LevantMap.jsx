import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import mapImage from '../assets/map_levant_stylized.png';
// Import artifact images properly for production builds
import artifactWadiRum from '../assets/artifacts/wadi_rum.png';
import artifactPetra from '../assets/artifacts/petra.png';
import artifactJerusalem from '../assets/artifacts/jerusalem.png';
import artifactJericho from '../assets/artifacts/jericho.png';
import artifactAmman from '../assets/artifacts/amman.png';
import artifactBeerSheba from '../assets/artifacts/abrahamsWell.png';
import eilatArtifact from '../assets/artifacts/eilat.png';
import beirutArtifact from '../assets/artifacts/cedar.jpg';
import sidonArtifact from '../assets/artifacts/sidon.jpg';
import jerashArtifact from '../assets/artifacts/jerash.jpg';
import tyreArtifact from '../assets/artifacts/tyre.jpg';
import hebronArtifact from '../assets/artifacts/hebron.jpg';
import aqabaArtifact from '../assets/artifacts/aqaba.jpg';
import madabaArtifact from '../assets/artifacts/madaba.png';
import karakArtifact from '../assets/artifacts/karak.png';
import masadaArtifact from '../assets/artifacts/romanScroll.jpg';
import nablusSoapArtifact from '../assets/artifacts/nablus_soap.png';
import haifaArtifact from '../assets/artifacts/haifa.jpg';
import tiberiasArtifact from '../assets/artifacts/tiberias.jpg';
import suwaydaArtifact from '../assets/artifacts/assuwayada.jpg';
import byblosArtifact from '../assets/artifacts/byblos.jpg';
import homsArtifact from '../assets/artifacts/homs.jpg';
import palmyraArtifact from '../assets/artifacts/palmyra.jpg';
import baalbekArtifact from '../assets/artifacts/baalbek.jpg';
import aleppoArtifact from '../assets/artifacts/aleppo.jpg';
import akkoArtifact from '../assets/artifacts/akko.jpg';
import damascusArtifact from '../assets/artifacts/damascus.jpg';
import ramallahArtifact from '../assets/artifacts/ramallah.jpg';
import tripoliArtifact from '../assets/artifacts/tripoli.jpg';
// CSS for Animations (injected here for simplicity)
const animationKeyframes = `
@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 111, 81, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(231, 111, 81, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 111, 81, 0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes popIn {
  0% { 
    transform: scale(0.5) rotate(-5deg); 
    opacity: 0;
  }
  50% {
    transform: scale(1.05) rotate(2deg);
  }
  100% { 
    transform: scale(1) rotate(0deg); 
    opacity: 1;
  }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes glow {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(231, 111, 81, 0.5),
                0 0 40px rgba(231, 111, 81, 0.3),
                inset 0 0 20px rgba(255, 255, 255, 0.1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(231, 111, 81, 0.8),
                0 0 60px rgba(231, 111, 81, 0.5),
                inset 0 0 30px rgba(255, 255, 255, 0.2);
  }
}

@keyframes particleBurst {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(0);
    opacity: 0;
  }
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}

.course-path-summary {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 20;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border: 2px solid var(--color-accent);
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  width: 150px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-path-summary:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
  background: white;
}

@media (max-width: 640px) {
  .course-path-summary {
    bottom: 85px;
    left: 20px;
    right: auto;
  }
}
`;

const CITIES = [
  { 
    id: 'wadi_rum', 
    name: 'Wadi Rum', 
    label: 'Bedouin Coffee', 
    minLevel: 1, 
    x: 60, 
    y: 90,
    artifact: {
      image: artifactWadiRum,
      name: 'Dallah (Coffee Pot)',
      description: 'A symbol of hospitality. Always served with the right hand!'
    }
  },
  {
    id: 'aqaba',
    name: 'Aqaba',
    label: 'Red Sea Gateway',
    minLevel: 3,
    x: 50,
    y: 92,
    artifact: {
      image: aqabaArtifact,
      name: 'Coral Diving Mask',
      description: 'Gateway to Jordan\'s Red Sea coast.'
    }
  },
  {
    id: 'madaba',
    name: 'Madaba',
    label: 'Mosaic City',
    minLevel: 6,
    x: 68,
    y: 48,
    artifact: {
      image: madabaArtifact,
      name: 'Byzantine Mosaic',
      description: 'Ancient map of the Holy Land.'
    }
  },
  {
    id: 'karak',
    name: 'Karak',
    label: 'Crusader Castle',
    minLevel: 7,
    x: 62,
    y: 58,
    artifact: {
      image: karakArtifact,
      name: 'Castle Key',
      description: 'Fortress along the King\'s Highway.'
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
      image: eilatArtifact, 
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
      image: artifactPetra,
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
      image: artifactBeerSheba,
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
      image: jerashArtifact,
      name: 'Roman Column Fragment',
      description: 'Piece of the extensive Roman architecture.'
    }
  },
  { 
    id: 'beirut', 
    name: 'Beirut', 
    label: 'Coastal Gem', 
    minLevel: 5, 
    x: 32, 
    y: 18,
    artifact: {
      image: beirutArtifact,
      name: 'Cedar Tree',
      description: 'Symbol of Lebanon\'s resilience.'
    }
  },
  {
    id: 'tripoli',
    name: 'Tripoli',
    label: 'Northern Port',
    minLevel: 8,
    x: 30,
    y: 12,
    artifact: {
      image: tripoliArtifact,
      name: 'Crusader Citadel',
      description: 'Medieval fortress overlooking the sea.'
    }
  },
  {
    id: 'sidon',
    name: 'Sidon',
    label: 'Sea Castle',
    minLevel: 7,
    x: 33,
    y: 22,
    artifact: {
      image: sidonArtifact,
      name: 'Phoenician Harbor',
      description: 'Ancient trading port of the Phoenicians.'
    }
  },
  {
    id: 'tyre',
    name: 'Tyre',
    label: 'Purple Dye',
    minLevel: 8,
    x: 34,
    y: 26,
    artifact: {
      image: tyreArtifact,
      name: 'Royal Purple Shell',
      description: 'Source of the legendary Tyrian purple.'
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
      image: masadaArtifact,
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
      image: artifactAmman,
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
      image: hebronArtifact,
      name: 'Tomb of the Patriarchs',
      description: 'Burial site of Abraham, Isaac, and Jacob.'
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
      image: haifaArtifact,
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
      image: tiberiasArtifact,
      name: 'St. Peter\'s Fish',
      description: 'Famous fish from the Sea of Galilee.'
    }
  },
  { 
    id: 'jericho', 
    name: 'Jericho', 
    label: 'Ancient Oasis', 
    minLevel: 6, 
    x: 50, 
    y: 55,
    artifact: {
      image: artifactJericho, 
      name: 'Date Palm',
      description: 'The oldest continuously inhabited city in the world.'
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
      image: nablusSoapArtifact, 
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
      image: ramallahArtifact,
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
      image: akkoArtifact,
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
      image: suwaydaArtifact,
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
      image: byblosArtifact,
      name: 'Phoenician Alphabet',
      description: 'Birthplace of the modern alphabet.'
    }
  },
  { 
    id: 'damascus', 
    name: 'Damascus', 
    label: 'City of Jasmine', 
    minLevel: 8, 
    x: 68, 
    y: 20,
    artifact: {
      image: damascusArtifact,
      name: 'Damascus Steel',
      description: 'Legendary sword-making technique.'
    }
  },
  {
    id: 'palmyra',
    name: 'Palmyra',
    label: 'Desert Oasis',
    minLevel: 9,
    x: 85,
    y: 30,
    artifact: {
      image: palmyraArtifact,
      name: 'Temple Columns',
      description: 'Zenobia\'s legendary desert kingdom.'
    }
  },
  {
    id: 'homs',
    name: 'Homs',
    label: 'Historic City',
    minLevel: 8,
    x: 60,
    y: 18,
    artifact: {
      image: homsArtifact,
      name: 'Crusader Castle',
      description: 'Krak des Chevaliers overlooks the valley.'
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
      image: baalbekArtifact,
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
      image: aleppoArtifact,
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
      image: artifactJerusalem,
      name: 'City Key',
      description: 'Iron key to the ancient gates.'
    }
  },
];

const LevantMap = ({ userLevel, onCitySelect, onViewPath }) => {
  const { levels } = useData();
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [showLabels, setShowLabels] = useState(false); // Default: labels hidden
  const [hoveredCityId, setHoveredCityId] = useState(null);

  // Calculate overall progress across all levels
  const overallProgress = useMemo(() => {
    if (!levels || levels.length === 0) return 0;
    const total = levels.reduce((acc, lvl) => acc + lvl.stats.total, 0);
    const learned = levels.reduce((acc, lvl) => acc + lvl.stats.learned, 0);
    return total > 0 ? Math.round((learned / total) * 100) : 0;
  }, [levels]);

  const currentLevelObj = levels?.find(l => l.stats.progress < 100) || levels?.[levels.length - 1];

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
      backgroundImage: `url(${mapImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
      border: '4px solid white'
    }}>
      
      <style>{animationKeyframes}</style>
      
      {/* Visibility Toggle */}
      <button 
        onClick={() => setShowLabels(!showLabels)}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
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
        <span>{showLabels ? '👁️' : '👁️‍🗨️'}</span>
        <span className="hide-text-mobile">
          {showLabels ? ' Hide Labels' : ' Show Labels'}
        </span>
      </button>

      {/* Subtle Learning Path Summary - Moved to Bottom Right to avoid markers */}
      {levels && levels.length > 0 && (
        <div 
          onClick={onViewPath}
          className="course-path-summary"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-secondary)', letterSpacing: '0.5px' }}>COURSE PATH</span>
            <span style={{ fontSize: '0.9rem' }}>🎯</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary)' }}>
              {overallProgress}%
            </div>
            <div style={{ fontSize: '0.65rem', color: '#888' }}>complete</div>
          </div>

          <div style={{ height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${overallProgress}%`, height: '100%', background: 'var(--color-accent)', transition: 'width 1s ease' }} />
          </div>

          <div style={{ fontSize: '0.65rem', color: '#666', marginTop: '2px' }}>
            On: <span style={{ fontWeight: 'bold' }}>{currentLevelObj?.title?.split(':')[0] || 'Unknown'}</span>
          </div>
        </div>
      )}
      
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
        // Fix for labels getting cut off at the bottom of the map
        const isBottom = city.y > 80;
        
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
                    {city.id === 'aqaba' && '🤿'}
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
                    {city.id === 'madaba' && '🎨'}
                    {city.id === 'karak' && '🏰'}
                    {city.id === 'jerash' && '🏺'}
                    {city.id === 'jericho' && '🌴'}
                    {city.id === 'tripoli' && '⛵'}
                    {city.id === 'beirut' && '⚓'}
                    {city.id === 'sidon' && '🏖️'}
                    {city.id === 'tyre' && '🐚'}
                    {city.id === 'byblos' && '📜'}
                    {city.id === 'homs' && '🏰'}
                    {city.id === 'baalbek' && '🏛️'}
                    {city.id === 'damascus' && '🌸'}
                    {city.id === 'palmyra' && '🏜️'}
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
              marginTop: isBottom ? 0 : '12px',
              marginBottom: isBottom ? '12px' : 0,
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center',
              minWidth: '100px',
              border: `1px solid ${isUnlocked ? 'var(--color-primary-light)' : '#ccc'}`,
              opacity: (showLabels || hoveredCityId === city.id) ? 1 : 0,
              transform: (showLabels || hoveredCityId === city.id) 
                ? 'translateY(0)' 
                : (isBottom ? 'translateY(10px)' : 'translateY(-10px)'),
              pointerEvents: 'none', // Allow clicking overlapping pins if label is nuisance
              transition: 'all 0.2s ease',
              position: 'absolute', // Float above so it doesn't push layout
              top: isBottom ? 'auto' : '100%',
              bottom: isBottom ? '100%' : 'auto'
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

      {/* Artifact Modal - Enhanced with Premium Graphics */}
      {selectedArtifact && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'radial-gradient(circle at center, rgba(231, 111, 81, 0.3), rgba(61, 64, 91, 0.95))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.5s ease',
          overflow: 'hidden'
        }}>
          
          {/* Particle Burst Effect */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 150;
            return (
              <div 
                key={`particle-${i}`}
                style={{
                  position: 'absolute',
                  width: '20px',
                  height: '20px',
                  background: `radial-gradient(circle, ${
                    i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#E76F51' : '#F4A261'
                  }, transparent)`,
                  borderRadius: '50%',
                  top: '50%',
                  left: '50%',
                  '--tx': `${Math.cos(angle) * distance}px`,
                  '--ty': `${Math.sin(angle) * distance}px`,
                  animation: `particleBurst 1s ease-out ${i * 0.05}s`,
                  pointerEvents: 'none',
                  filter: 'blur(2px)',
                  opacity: 0
                }}
              />
            );
          })}
          
          {/* Floating Sparkles */}
          {[...Array(8)].map((_, i) => (
            <div 
              key={`sparkle-${i}`}
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                background: 'gold',
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
                animation: `sparkle ${2 + Math.random() * 2}s ease-in-out infinite ${i * 0.2}s`,
                pointerEvents: 'none'
              }}
            />
          ))}
          
          {/* Main Modal Card */}
          <div style={{
            background: 'linear-gradient(145deg, #FAF9F6, #F4F1DE)',
            padding: 'var(--spacing-8)',
            borderRadius: '24px',
            textAlign: 'center',
            maxWidth: '400px',
            border: '6px solid transparent',
            backgroundImage: 'linear-gradient(145deg, #FAF9F6, #F4F1DE), linear-gradient(145deg, #FFD700, #E76F51, #264653)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            boxShadow: '0 30px 80px rgba(0,0,0,0.4), 0 10px 30px rgba(231, 111, 81, 0.3), inset 0 1px 0 rgba(255,255,255,0.8)',
            transform: 'scale(1)',
            animation: 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative'
          }}>
            
            {/* Shimmer Title */}
            <h3 style={{ 
              background: 'linear-gradient(90deg, #E76F51, #FFD700, #E76F51, #FFD700)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '2rem', 
              marginBottom: 'var(--spacing-4)',
              fontWeight: '900',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              animation: 'shimmer 3s linear infinite',
              filter: 'drop-shadow(0 2px 4px rgba(231, 111, 81, 0.3))'
            }}>
              ✨ Artifact Unlocked! ✨
            </h3>
            
            {/* Glowing Artifact Container */}
            <div style={{
              width: '180px', 
              height: '180px', 
              margin: '0 auto var(--spacing-6)',
              background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
              borderRadius: '50%',
              border: '6px solid #FFD700',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              animation: 'glow 2s ease-in-out infinite, float 3s ease-in-out infinite',
              boxShadow: '0 0 20px rgba(231, 111, 81, 0.5), 0 0 40px rgba(231, 111, 81, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
            }}>
              {/* Rotating Glow Ring */}
              <div style={{
                position: 'absolute',
                inset: '-10px',
                background: 'conic-gradient(from 0deg, transparent, rgba(255, 215, 0, 0.5), transparent, rgba(231, 111, 81, 0.5), transparent)',
                animation: 'spin 4s linear infinite',
                borderRadius: '50%',
                filter: 'blur(10px)',
                zIndex: 0
              }} />
              
              {/* Image with fallback */}
              <img 
                src={selectedArtifact.artifact.image} 
                alt={selectedArtifact.artifact.name}
                onError={(e) => {e.target.style.display='none'; e.target.parentNode.innerHTML += '<div style="font-size: 80px; z-index: 2;">�</div>'}}
                style={{ 
                  width: '90%', 
                  height: '90%', 
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 2,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                }} 
              />
            </div>
            
            {/* Artifact Name with Accent */}
            <div style={{
              background: 'linear-gradient(90deg, transparent, rgba(231, 111, 81, 0.1), transparent)',
              padding: 'var(--spacing-2) 0',
              marginBottom: 'var(--spacing-3)'
            }}>
              <h4 style={{ 
                color: '#264653', 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
              }}>
                {selectedArtifact.artifact.name}
              </h4>
            </div>
            
            {/* Description */}
            <p style={{ 
              color: '#3D405B', 
              marginBottom: 'var(--spacing-6)', 
              fontSize: '1rem', 
              lineHeight: '1.6',
              fontStyle: 'italic',
              padding: '0 var(--spacing-4)'
            }}>
              {selectedArtifact.artifact.description}
            </p>
            
            {/* Premium CTA Button */}
            <button 
              onClick={closeArtifact}
              style={{
                background: 'linear-gradient(145deg, #E76F51, #D6624A)',
                color: 'white',
                border: 'none',
                padding: '16px 40px',
                borderRadius: '50px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 0 #B85540, 0 8px 20px rgba(231, 111, 81, 0.4)',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 0 #B85540, 0 12px 25px rgba(231, 111, 81, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 0 #B85540, 0 8px 20px rgba(231, 111, 81, 0.4)';
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(4px)';
                e.target.style.boxShadow = '0 2px 0 #B85540, 0 3px 10px rgba(231, 111, 81, 0.3)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 0 #B85540, 0 12px 25px rgba(231, 111, 81, 0.5)';
              }}
            >
              🎯 Collect & Continue
            </button>
          </div>

          {/* Spin animation for rotating glow */}
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default LevantMap;
