import React, { useState } from 'react';

const WelcomeScreen = ({ onComplete }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name.trim());
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: 'var(--spacing-6)',
      background: 'var(--color-background)',
      backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 0%, transparent 10%), radial-gradient(circle at 0% 0%, rgba(224, 122, 95, 0.05) 0%, transparent 50%)',
      backgroundSize: '20px 20px, 100% 100%',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: 'var(--spacing-8)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>🦊</div>
        
        <h1 style={{ 
          color: 'var(--color-secondary)', 
          marginBottom: 'var(--spacing-2)',
          fontFamily: 'var(--font-family-english)'
        }}>
          Ahlan wa Sahlan!
        </h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-6)' }}>
          Welcome to HAKI. Let's start your journey to street-smart Arabic.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div style={{ textAlign: 'left' }}>
            <label 
              htmlFor="name" 
              style={{ 
                display: 'block', 
                marginBottom: 'var(--spacing-2)', 
                fontWeight: 'bold', 
                color: 'var(--color-text)'
              }}
            >
              What should we call you?
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                border: '2px solid var(--color-primary-light)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-primary-light)'}
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              opacity: name.trim() ? 1 : 0.7,
              boxShadow: name.trim() ? '0 4px 0 var(--color-primary-dark)' : 'none',
              transition: 'all 0.2s',
              marginTop: 'var(--spacing-2)'
            }}
          >
            Let's Go! 🚀
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeScreen;
