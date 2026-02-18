import React from 'react';
import { useData } from '../contexts/DataContext';

import { useSettings } from '../contexts/SettingsContext';

const LocationModal = ({ location, onClose, onStartLevel, onViewArtifact }) => {
    const { settings } = useSettings();
    if (!location) return null;

    const {
        name, hebrewName,
        label, hebrewLabel,
        description, hebrewDescription,
        stats, isMastered, artifact
    } = location;

    const displayName = settings.nativeLanguage === 'hebrew' ? (hebrewName || name) : name;
    const displayLabel = settings.nativeLanguage === 'hebrew' ? (hebrewLabel || label) : label;

    // Note: 'description' in LocationModal currently refers to the location description?
    // Wait, CITIES only has artifact description.
    // Checking artifacts.js: Objects have name, label, x, y, and artifact object.
    // There is NO top-level description in CITIES objects in artifacts.js!
    // BUT the modal reads `description` from `location`.
    // Where does `location` come from? It comes from `mappedCities` in LevantMap.
    // `mappedCities` merges `CITIES` and `locData`.
    // `locData` comes from `useData()`.
    // Does `useData` provide descriptions for locations?
    // If not, `description` might be undefined or coming from `artifact.description`?
    // Looking at LocationModal: `const { name, label, description, stats, ... } = location`
    // And it renders `{description}` in a paragraph.
    // In `artifacts.js`, only `artifact` has a description. The city itself does NOT.
    // So `description` might be undefined? Or maybe I missed it in `artifacts.js`.
    // Re-checking artifacts.js...
    // ...
    // { id: 'wadi_rum', name: 'Wadi Rum', label: 'Start Here', ..., artifact: { ... } }
    // No description on the city object.
    // maybe `description` is actually `artifact.description`?
    // Let's check where `description` is used.
    // In `LocationModal`: `<p ...>{description}</p>`

    // If `description` is missing on the location object, it will be blank.
    // Let's assume the user wants `artifact.description` or we should use `artifact.description` if available.
    // Or maybe I should add descriptions to `artifacts.js`?
    // The user said "explanations".

    // Let's proceed with Artifact details since those DEFINITELY have descriptions.

    // Use MASTERY percentage (SRS >= 3) instead of just "Learned" (seen once)
    // This matches the unlocking logic (50% mastery unlocks next).
    const progressPercent = stats?.masteryPercentage || 0;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(5px)',
            animation: 'fadeIn 0.3s ease'
        }} onClick={onClose}>
            <div
                style={{
                    width: '90%',
                    maxWidth: '500px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '24px',
                    padding: '30px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: 'slideUp 0.4s ease',
                    direction: settings.nativeLanguage === 'hebrew' ? 'rtl' : 'ltr'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Background Decorative Elements */}
                <div style={{
                    position: 'absolute', top: '-50px', right: '-50px',
                    width: '150px', height: '150px',
                    background: 'radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%)',
                    opacity: 0.5, borderRadius: '50%'
                }} />

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        color: 'var(--color-secondary)',
                        fontWeight: 'bold',
                        marginBottom: '5px'
                    }}>
                        {settings.nativeLanguage === 'hebrew' ? 'מיקום התגלה' : 'Location Discovered'}
                    </div>
                    <h2 style={{
                        fontSize: '2.5rem',
                        margin: '0',
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-family-english)'
                    }}>
                        {settings.nativeLanguage === 'hebrew' ? (location.hebrewName || name) : name}
                    </h2>
                    <div style={{
                        fontSize: '1.1rem',
                        color: '#666',
                        marginTop: '5px',
                        fontStyle: 'italic'
                    }}>
                        {settings.nativeLanguage === 'hebrew' ? (location.hebrewLabel || label) : label}
                    </div>
                </div>

                {/* Artifact Image */}
                {artifact && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        animation: 'fadeIn 1s ease'
                    }}>
                        <div style={{
                            width: '140px',
                            height: '140px',
                            borderRadius: '50%',
                            border: '4px solid white',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            overflow: 'hidden',
                            position: 'relative',
                            background: 'white'
                        }}>
                            <img
                                src={artifact.image}
                                alt={artifact.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {/* Lock Overlay if not unlocked? LocationModal is usually only for unlocked/discovered items */}
                        </div>
                    </div>
                )}

                {/* Description */}
                <p style={{
                    textAlign: 'center',
                    color: '#444',
                    lineHeight: '1.6',
                    marginBottom: '25px',
                    fontSize: '1rem',
                    fontStyle: artifact ? 'italic' : 'normal'
                }}>
                    {settings.nativeLanguage === 'hebrew'
                        ? (artifact?.hebrewDescription || location.hebrewDescription || description)
                        : (artifact?.description || description)}
                </p>

                {/* Progress Section */}
                <div style={{
                    background: 'var(--color-background)',
                    padding: '15px',
                    borderRadius: '16px',
                    marginBottom: '25px',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#555' }}>
                        <span>{settings.nativeLanguage === 'hebrew' ? 'הושלם מהמיקום' : 'Location Complete'}</span>
                        <span>{Math.round(stats?.progress || 0)}%</span>
                    </div>
                    <div style={{
                        height: '14px',
                        background: '#e0e0e0',
                        borderRadius: '7px',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                        position: 'relative'
                    }}>
                        {/* Learned Bar (Main Progress - Green) */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0,
                            width: `${stats?.progress || 0}%`,
                            height: '100%',
                            background: 'var(--color-primary)', // Main Green
                            borderRadius: '7px',
                            transition: 'width 1s ease'
                        }} />

                        {/* Mastered Bar (Depth - Gold Overlay) */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0,
                            width: `${progressPercent}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)', // Gold/Orange
                            opacity: 0.8,
                            borderRadius: '7px',
                            transition: 'width 1s ease',
                            boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
                        }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem', color: '#888' }}>
                        <span>{stats?.learned || 0} {settings.nativeLanguage === 'hebrew' ? 'נלמדו (נצפו)' : 'learned (seen)'}</span>
                        <span>{stats?.mastered || 0}/{stats?.total} {settings.nativeLanguage === 'hebrew' ? 'הושלמו (הוסמכו)' : 'mastered (qualified)'}</span>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => onStartLevel(location.id)}
                            style={{
                                flex: 1,
                                padding: '16px',
                                background: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(38, 70, 83, 0.3)',
                                transition: 'transform 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            <span>🚀</span> {settings.nativeLanguage === 'hebrew' ? 'תרגול' : 'Practice'}
                        </button>
                        <button
                            onClick={() => onStartLevel(location.id, true)} // true = study mode
                            style={{
                                flex: 1,
                                padding: '16px',
                                background: 'white',
                                color: 'var(--color-primary)',
                                border: '2px solid var(--color-primary)',
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            <span>📖</span> {settings.nativeLanguage === 'hebrew' ? 'מדריך' : 'Guide'}
                        </button>
                    </div>

                    {isMastered && artifact && (
                        <button
                            onClick={() => onViewArtifact(artifact)}
                            style={{
                                padding: '14px',
                                background: 'transparent',
                                color: 'var(--color-secondary)',
                                border: '2px solid var(--color-secondary)',
                                borderRadius: '16px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--color-secondary)';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--color-secondary)';
                            }}
                        >
                            <span>🏆</span> {settings.nativeLanguage === 'hebrew' ? 'צפה באוצר נדיר' : 'View Rare Artifact'}
                        </button>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'rgba(0,0,0,0.05)',
                        border: 'none',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem',
                        color: '#666'
                    }}
                >
                    &times;
                </button>

            </div>
            <style>{`
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default LocationModal;
