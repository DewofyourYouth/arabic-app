import React, { useState } from 'react';
import Fennec from './Fennec';
import { useSettings } from '../contexts/SettingsContext';

const Layout = ({ children, title = "HAKI", activeView, onNavigate }) => {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, toggleArabicScript } = useSettings();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--color-background)',
      backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 0%, transparent 10%), radial-gradient(circle at 0% 0%, rgba(224, 122, 95, 0.05) 0%, transparent 50%)',
      backgroundSize: '20px 20px, 100% 100%',
      fontFamily: 'var(--font-family-english)',
      color: 'var(--color-text)'
    }}>
      {/* Header */}
      <header style={{
        padding: 'var(--spacing-4)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(224, 122, 95, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <h1 style={{ 
            color: 'var(--color-primary)', 
            fontSize: 'var(--font-size-2xl)', 
            fontWeight: '800', 
            letterSpacing: '-1px',
            textShadow: '2px 2px 0 var(--color-primary-light)'
          }}>
            HAKI
          </h1>
          <span style={{ 
            fontSize: 'var(--font-size-xl)', 
            color: 'var(--color-secondary)',
            fontFamily: 'Amiri, serif',
            fontWeight: 'bold',
            marginTop: '-6px'
          }}>
            حكي
          </span>
        </div>
        
        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(true)}
          style={{
            background: 'none',
            border: '2px solid var(--color-primary-light)',
            borderRadius: 'var(--radius-full)',
            width: '40px',
            height: '40px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="Settings"
        >
          ⚙️
        </button>
        
        {/* Animated Fennec Mascot */}
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(244, 241, 222, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid var(--color-primary-light)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'visible',
          padding: '4px'
        }}>
          <Fennec mood="idle" size={45} />
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        padding: 'var(--spacing-4)',
        overflowY: 'auto'
      }}>
        {children}
      </main>

      {/* Bottom Nav */}
      <nav style={{
        height: '70px',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
      }}>
        <NavButton 
          icon="🏠" 
          isActive={activeView === 'map' || activeView === undefined} 
          onClick={() => onNavigate && onNavigate('map')} 
        />
        <NavButton 
          icon="📚" 
          isActive={activeView === 'library'} 
          onClick={() => onNavigate && onNavigate('library')} 
        />
        <NavButton 
          icon="⚡" 
          isActive={activeView === 'session'} 
          onClick={() => onNavigate && onNavigate('session')} 
        />
      </nav>

      {/* Settings Modal */}
      {showSettings && (
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
          zIndex: 1000
        }}
        onClick={() => setShowSettings(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-8)',
            maxWidth: '400px',
            width: '90%',
            boxShadow: 'var(--shadow-card)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ 
              marginTop: 0, 
              marginBottom: 'var(--spacing-6)',
              color: 'var(--color-primary)',
              fontSize: 'var(--font-size-xl)'
            }}>
              Display Settings
            </h2>
            
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

            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: '100%',
                padding: 'var(--spacing-3)',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const NavButton = ({ icon, isActive, onClick }) => (
  <button 
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      padding: '10px',
      cursor: 'pointer',
      opacity: isActive ? 1 : 0.5,
      transform: isActive ? 'scale(1.1)' : 'scale(1)',
      transition: 'all 0.2s',
      borderBottom: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
      color: isActive ? 'var(--color-primary)' : 'var(--color-text-light)'
    }}
  >
    {icon}
  </button>
);

export default Layout;
