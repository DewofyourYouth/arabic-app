import React from 'react';
import { useAudio } from '../hooks/useAudio';
import { useSettings } from '../contexts/SettingsContext';

const SettingsModal = ({ onClose, onRestartTour }) => {
  const { settings, toggleArabicScript, resetOnboarding, setDialect, setGChar } = useSettings();
  const { playPronunciation } = useAudio();

  const handleRestartTour = () => {
    resetOnboarding(); 
    onRestartTour && onRestartTour();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease'
    }}
    onClick={onClose}
    >
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-8)',
        maxWidth: '400px',
        width: '90%',
        boxShadow: 'var(--shadow-card)',
        animation: 'scaleIn 0.2s ease'
      }}
      onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
            <h2 style={{ 
            margin: 0, 
            color: 'var(--color-primary)',
            fontSize: 'var(--font-size-xl)'
            }}>
            Display Settings
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>&times;</button>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-6)',
          padding: 'var(--spacing-4)',
          background: 'var(--color-background)',
          borderRadius: 'var(--radius-md)'
        }}>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              Show Arabic Script
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
              {settings.showArabicScript 
                ? 'Arabic text is shown' 
                : 'Only transliteration is shown'}
            </div>
          </div>
          
          <button
            onClick={toggleArabicScript}
            style={{
              width: '60px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: settings.showArabicScript 
                ? 'var(--color-success)' 
                : '#ccc',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: '4px',
              left: settings.showArabicScript ? '32px' : '4px',
              transition: 'left 0.2s',
              boxShadow: 'var(--shadow-sm)'
            }} />
          </button>
        </div>

        {/* Dialect Preference */}
        <div style={{
          marginBottom: 'var(--spacing-6)',
          padding: 'var(--spacing-4)',
          background: 'var(--color-background)',
          borderRadius: 'var(--radius-md)'
        }}>
           <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              Pronunciation Dialect
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={() => setDialect('urban')}
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        border: settings.dialect === 'urban' ? '2px solid var(--color-primary)' : '1px solid #ddd',
                        background: settings.dialect === 'urban' ? 'var(--color-primary-light)' : 'white',
                        color: settings.dialect === 'urban' ? 'var(--color-primary)' : 'var(--color-text)',
                        fontWeight: settings.dialect === 'urban' ? 'bold' : 'normal',
                        cursor: 'pointer'
                    }}
                >
                    Urban (Ah-weh)
                </button>
                <button
                    onClick={() => setDialect('bedouin')}
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        border: settings.dialect === 'bedouin' ? '2px solid var(--color-primary)' : '1px solid #ddd',
                        background: settings.dialect === 'bedouin' ? 'var(--color-primary-light)' : 'white',
                        color: settings.dialect === 'bedouin' ? 'var(--color-primary)' : 'var(--color-text)',
                        fontWeight: settings.dialect === 'bedouin' ? 'bold' : 'normal',
                        cursor: 'pointer'
                    }}
                >
                    Bedouin (Gah-weh)
                </button>
            </div>
        </div>

        {/* Hard G Character Selection (Only if Bedouin is selected) */}
        {settings.dialect === 'bedouin' && (
            <div style={{
                marginBottom: 'var(--spacing-6)',
                padding: 'var(--spacing-4)',
                background: 'var(--color-background)',
                borderRadius: 'var(--radius-md)',
                animation: 'fadeIn 0.2s ease'
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    "Hard G" Character
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>
                    Select the character that sounds like "G" on your device:
                </div>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {['گ', 'ڨ', 'ق', 'ج', 'g'].map(char => (
                        <button
                            key={char}
                            onClick={() => setGChar(char)}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                border: settings.gChar === char ? '2px solid var(--color-primary)' : '1px solid #ddd',
                                background: settings.gChar === char ? 'var(--color-primary)' : 'white',
                                color: settings.gChar === char ? 'white' : 'var(--color-text)',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            {char}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => playPronunciation('قهوة')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--color-primary)',
                        background: 'white',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                    }}
                >
                    <span>🔊</span> Test "Coffee" ({settings.gChar}ahweh)
                </button>
            </div>
        )}

        <div style={{ borderTop: '1px solid #eee', paddingTop: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <button 
                onClick={handleRestartTour}
                style={{
                    background: 'white',
                    border: '2px solid var(--color-primary)',
                    color: 'var(--color-primary)',
                    padding: '12px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                Start Helper Tour 🦊
            </button>

            <button
            onClick={onClose}
            style={{
                width: '100%',
                padding: '12px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
            }}
            >
            Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
