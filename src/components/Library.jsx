import React from 'react';

const Library = ({ cards }) => {
  return (
    <div style={{ padding: 'var(--spacing-4)' }}>
      <h2 style={{ 
        color: 'var(--color-primary)', 
        marginBottom: 'var(--spacing-4)',
        fontSize: 'var(--font-size-xl)' 
      }}>
        Your Library
      </h2>
      
      <div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
        {cards.map((card) => (
          <div 
            key={card.id}
            style={{
              backgroundColor: 'white',
              padding: 'var(--spacing-3)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold' }}>{card.target}</div>
              <div style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>{card.native}</div>
            </div>
            {/* Simple SRS Indicator */}
            <div style={{ 
              fontSize: '0.8rem', 
              padding: '2px 8px', 
              borderRadius: '10px', 
              backgroundColor: card.srs.repetition > 0 ? 'var(--color-success-light)' : '#eee',
              color: card.srs.repetition > 0 ? 'var(--color-success-dark)' : '#888'
            }}>
              Lvl {card.srs.repetition}
            </div>
          </div>
        ))}
      </div>
      
      {cards.length === 0 && (
        <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
          No cards found. Start practicing to unlock more!
        </p>
      )}
    </div>
  );
};

export default Library;
