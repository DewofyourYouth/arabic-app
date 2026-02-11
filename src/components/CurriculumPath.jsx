import React from 'react';
import { useData } from '../contexts/DataContext';

const CurriculumPath = ({ onStartLevel }) => {
  const { levels, loading } = useData();

  if (loading) return <div>Loading Path...</div>;

  return (
    <div style={{ 
      padding: 'var(--spacing-4)', 
      maxWidth: '800px', 
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-4)'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: 'var(--color-primary)',
        fontSize: 'var(--font-size-2xl)',
        marginBottom: 'var(--spacing-4)'
      }}>
        🚀 Your Learning Path
      </h2>

      {levels.map((level, index) => {
        const isLocked = !level.isUnlocked;
        const isComplete = level.stats.progress >= 100;
        
        return (
          <div 
            key={level.id}
            style={{
              position: 'relative',
              background: isLocked ? '#f5f5f5' : 'white',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-4)',
              boxShadow: isLocked ? 'none' : 'var(--shadow-md)',
              border: isLocked ? '2px solid #e0e0e0' : '2px solid transparent',
              opacity: isLocked ? 0.7 : 1,
              transition: 'transform 0.2s',
              cursor: isLocked ? 'not-allowed' : 'pointer'
            }}
            onClick={() => !isLocked && onStartLevel(level.id)}
            onMouseEnter={(e) => !isLocked && (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={(e) => !isLocked && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* Connector Line (visual only, simplified) */}
            {index < levels.length - 1 && (
              <div style={{
                position: 'absolute',
                bottom: '-24px',
                left: '50%',
                width: '4px',
                height: '24px',
                background: '#e0e0e0',
                transform: 'translateX(-50%)',
                zIndex: -1
              }} />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  background: isLocked ? '#ccc' : 'var(--color-primary)',
                  color: 'white',
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}>
                  {level.id}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: isLocked ? '#888' : 'var(--color-text)' }}>
                    {level.title}
                  </h3>
                  <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.9rem' }}>
                    {level.description}
                  </p>
                </div>
              </div>
              
              {isComplete && <div style={{ fontSize: '1.5rem' }}>✅</div>}
              {isLocked && <div style={{ fontSize: '1.5rem' }}>🔒</div>}
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: 'var(--spacing-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
                <span>Progress</span>
                <span>{level.stats.progress}% ({level.stats.learned}/{level.stats.total})</span>
              </div>
              <div style={{ 
                height: '8px', 
                background: '#eee', 
                borderRadius: '4px', 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  height: '100%', 
                  width: `${level.stats.progress}%`, 
                  background: isLocked ? '#999' : 'var(--color-success)',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

            {!isLocked && (
               <button style={{
                 marginTop: 'var(--spacing-3)',
                 width: '100%',
                 padding: '10px',
                 background: 'var(--color-primary-light)',
                 color: 'var(--color-primary)',
                 border: 'none',
                 borderRadius: 'var(--radius-md)',
                 fontWeight: 'bold',
                 cursor: 'pointer',
                 transition: 'background 0.2s'
               }}
               onMouseEnter={(e) => e.target.style.background = '#e6e6fa'}
               onMouseLeave={(e) => e.target.style.background = 'var(--color-primary-light)'}
               >
                 Start Practice
               </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CurriculumPath;
