import React, { useState } from 'react';
import Fennec from './Fennec';
import { useSettings } from '../contexts/SettingsContext';

import SettingsModal from './SettingsModal';

const Layout = ({ children, title = "HAKI", activeView, onNavigate }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--color-background)',
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
          className="settings-btn" // Added class for Tour targeting
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
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
          padding: '0',
          position: 'relative' // Ensure it stacks correctly
        }}>
          <div style={{ width: '60px', height: '60px', bottom: '-8px', position: 'absolute' }}>
             <Fennec mood="idle" size={60} />
          </div>
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
          icon="🎯" 
          isActive={activeView === 'path'} 
          onClick={() => onNavigate && onNavigate('path')} 
        />
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
        <SettingsModal 
            onClose={() => setShowSettings(false)} 
        />
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
