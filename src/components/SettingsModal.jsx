import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

const SettingsModal = ({ onClose, onRestartTour }) => {
  const { settings, toggleArabicScript, resetOnboarding } = useSettings();

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
