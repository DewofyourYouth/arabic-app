import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import { CITIES } from '../data/artifacts';
import { MAPS } from '../data/mapsData';
import LocationModal from './LocationModal';

// CSS for Animations
const animationKeyframes = `
@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 111, 81, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(231, 111, 81, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 111, 81, 0); }
}
`;

const RegionMap = ({ mapId = 'levant', onCitySelect }) => {
  const { settings } = useSettings();
  const { locations } = useData();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hoveredCityId, setHoveredCityId] = useState(null);
  const [showLabels, setShowLabels] = useState(false);

  const mapConfig = MAPS[mapId];

  // Map configuration validation
  if (!mapConfig) {
      return <div style={{ padding: '20px', textAlign: 'center' }}>Map configuration '{mapId}' not found.</div>;
  }

  // Filter and merge CITIES with dynamic location tracking data, and extract coordinates for this specific map
  const mappedCities = useMemo(() => {
    return CITIES
      .filter(city => mapConfig.cities.includes(city.id) && city.coordinates && city.coordinates[mapId])
      .map(city => {
        // Find dynamic data if exists
        const locData = locations?.find(l => l.id === city.id);

        const isUnlocked = locData ? locData.isUnlocked : false;

        return {
          ...city,
          ...locData, // Merge dynamic stats (progress, isMastered)
          isUnlocked,
          isPlaceholder: !locData, // If no data, it's just a map point
          x: city.coordinates[mapId].x, // Use map-specific coordinates
          y: city.coordinates[mapId].y
        };
      });
  }, [locations, mapConfig, mapId]);

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
    alert(`Viewing Artifact: ${artifact.name}`);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      flex: 1,
      minHeight: 0, /* Important for flex child scrubbing */
      backgroundColor: 'var(--color-background)',
      backgroundImage: `url(${mapConfig.image})`,
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
        {settings.nativeLanguage === 'hebrew' ? mapConfig.hebrewName : mapConfig.name}
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

export default RegionMap;
