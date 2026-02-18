import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import mapImage from '../assets/map_levant_stylized.png';
import LocationModal from './LocationModal';



import { useSettings } from '../contexts/SettingsContext';

import { CITIES } from '../data/artifacts';

// ... (keep styles and other imports)

// CSS for Animations
const animationKeyframes = `
@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 111, 81, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(231, 111, 81, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 111, 81, 0); }
}
`;

const LevantMap = ({ onCitySelect, onViewPath }) => {
  const { settings } = useSettings();
  const { locations } = useData();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hoveredCityId, setHoveredCityId] = useState(null);
  const [showLabels, setShowLabels] = useState(false);

  // Merge CITIES with dynamic location tracking data
  const mappedCities = useMemo(() => {
    return CITIES.map(city => {
      // Find dynamic data if exists
      const locData = locations?.find(l => l.id === city.id);

      // If found, use its unlocked status. If not, it's considered "Locked/Unknown"
      // Exception: The first location 'wadi_rum' is always unlocked if logic fails, 
      // but 'locations' in DataContext handles that.

      const isUnlocked = locData ? locData.isUnlocked : false;
      // "Next" logic: if it's the first locked item? 
      // For now simple boolean.

      return {
        ...city,
        ...locData, // Merge dynamic stats (progress, isMastered)
        isUnlocked,
        isPlaceholder: !locData // If no data, it's just a map point
      };
    });
  }, [locations]);

  // Handle click on a city pin
  const handleCityClick = (city) => {
    if (city.isUnlocked) {
      setSelectedLocation(city);
    }
  };

  const handleStartLevel = (locationId, studyMode = false) => {
    onCitySelect(locationId, studyMode);
    setSelectedLocation(null);
  };

  const handleViewArtifact = (artifact) => {
    // Logic to show artifact in detailed view?
    // For now, just close modal or maybe we need a separate Artifact View
    // Let's implement a simple artifact alert or pass it up
    alert(`Viewing Artifact: ${artifact.name}`);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      flex: 1,
      minHeight: 0, /* Important for flex child scrubbing */
      backgroundColor: 'var(--color-background)',
      backgroundImage: `url(${mapImage})`,
      backgroundSize: '100% 100%', /* Stretch to fit container to ensure alignment */
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
          position: 'absolute', bottom: '20px', left: '20px', zIndex: 20,
          background: 'rgba(255, 255, 255, 0.9)',
          border: '2px solid var(--color-primary)', borderRadius: '20px',
          padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold',
          color: 'var(--color-primary)', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
      >
        <span>{showLabels ? '👁️' : '👁️‍🗨️'}</span>
      </button>

      <h2 style={{
        position: 'absolute', top: '20px', width: '100%', textAlign: 'center',
        color: 'var(--color-secondary)', fontFamily: 'var(--font-family-english)',
        textTransform: 'uppercase', letterSpacing: '3px', fontSize: '1.5rem',
        textShadow: '0 2px 4px rgba(255,255,255,0.8)', zIndex: 10
      }}>
        {settings.nativeLanguage === 'hebrew' ? 'מסע ברחבי הלבנט' : 'Journey Through The Levant'}
      </h2>

      {/* Render Cities */}
      {mappedCities.map(city => {
        const isUnlocked = city.isUnlocked;
        const isMastered = city.isMastered;

        return (
          <div
            key={city.id}
            onClick={() => handleCityClick(city)}
            onMouseEnter={() => setHoveredCityId(city.id)}
            onMouseLeave={() => setHoveredCityId(null)}
            style={{
              position: 'absolute',
              left: `${city.x}%`,
              top: `${city.y}%`,
              transform: 'translate(-50%, -50%)',
              cursor: isUnlocked ? 'pointer' : 'default',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              zIndex: hoveredCityId === city.id ? 20 : 10,
              opacity: isUnlocked ? 1 : 0.5,
              transition: 'all 0.3s ease',
              filter: isUnlocked ? 'none' : 'grayscale(1)'
            }}
          >
            {/* Pin */}
            <div style={{
              position: 'relative',
              transform: isUnlocked ? 'scale(1)' : 'scale(0.8)',
              animation: (isUnlocked && !isMastered) ? 'pulse 2s infinite' : 'none'
            }}>
              <div style={{
                width: '40px', height: '40px',
                background: isUnlocked ? (isMastered ? 'var(--color-accent)' : 'var(--color-primary)') : '#888',
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                border: '3px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.2)'
              }}>
                <div style={{ transform: 'rotate(45deg)', fontSize: '18px' }}>
                  {/* Simplified Custom Icons based on ID logic or generic */}
                  {['wadi_rum', 'palmyra'].includes(city.id) ? '🏜️' :
                    ['aqaba', 'eilat', 'tyre', 'sidon'].includes(city.id) ? '🌊' :
                      '🏰'}
                </div>
              </div>
            </div>

            {/* Label */}
            {(showLabels || hoveredCityId === city.id) && (
              <div style={{
                position: 'absolute', top: '100%', marginTop: '5px',
                background: 'rgba(255,255,255,0.9)', padding: '4px 8px',
                borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold',
                pointerEvents: 'none', whiteSpace: 'nowrap'
              }}>
                {settings.nativeLanguage === 'hebrew' ? (city.hebrewName || city.name) : city.name} {isMastered && '⭐'}
              </div>
            )}
          </div>
        );
      })}

      {/* Helper Text for Locked Items */}
      <div style={{
        position: 'absolute', bottom: '20px', right: '20px',
        background: 'rgba(255,255,255,0.8)', padding: '10px',
        borderRadius: '8px', fontSize: '0.8rem', color: '#666',
        direction: settings.nativeLanguage === 'hebrew' ? 'rtl' : 'ltr'
      }}>
        {settings.nativeLanguage === 'hebrew' ? 'חקור כדי לפתוח מיקומים נוספים!' : 'Explore to unlock more locations!'}
      </div>

      {/* Location Modal Overlay */}
      {selectedLocation && (
        <LocationModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onStartLevel={handleStartLevel}
          onViewArtifact={handleViewArtifact}
        />
      )}

    </div>
  );
};

export default LevantMap;
