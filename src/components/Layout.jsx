import React from 'react';

const Layout = ({ children, title = "HAKI", activeView, onNavigate }) => {
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
        
        {/* Mascot / Profile Placeholder */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          border: '2px solid white',
          boxShadow: 'var(--shadow-md)',
          fontSize: '1.2rem'
        }}>
          🦊
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
