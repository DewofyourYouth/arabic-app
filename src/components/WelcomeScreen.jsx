import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import SocialLoginButton from './SocialLoginButton';
import Fennec from './Fennec';

const WelcomeScreen = () => {
  const { signInWithGoogle, signInWithApple, signInGuest, signInLocalGuest } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setError('Failed to sign in with Google. Check console for details.');
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithApple();
    } catch (err) {
      console.error(err);
      setError('Failed to sign in with Apple. Check console for details.');
      setLoading(false);
    }
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setError('');
      setLoading(true);
      // Try Firebase Anonymous Auth first
      const result = await signInGuest();
      await updateProfile(result.user, { displayName: name.trim() });
    } catch (err) {
      console.warn("Firebase Anonymous Auth failed, falling back to local guest mode.", err);
      // Fallback: Local Guest Mode (Offline)
      signInLocalGuest(name.trim());
    }
    // No need to set loading false as view will switch
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      padding: 'var(--spacing-6)',
      background: 'var(--color-background)',
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
        <div style={{ marginBottom: 'var(--spacing-4)', display: 'flex', justifyContent: 'center' }}>
          <Fennec mood="happy" size={120} />
        </div>
        
        <h1 style={{ 
          color: 'var(--color-secondary)', 
          marginBottom: 'var(--spacing-2)',
          fontFamily: 'var(--font-family-english)'
        }}>
          Ahlan wa Sahlan!
        </h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-6)' }}>
          Welcome to HAKI. Sign in to save your progress across devices.
        </p>

        {error && (
          <div style={{ 
            color: 'var(--color-error)', 
            background: '#ffebee', 
            padding: '8px', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: 'var(--spacing-4)',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
             <SocialLoginButton 
                onClick={handleGoogleSignIn}
                label={loading ? 'Signing in...' : 'Sign in with Google'}
                icon="🇬"
                style={{ border: '1px solid #ddd' }}
             />
             <SocialLoginButton 
                onClick={handleAppleSignIn}
                label={loading ? 'Signing in...' : 'Sign in with Apple'}
                icon=""
                style={{ background: 'black', color: 'white', border: 'none' }}
             />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-6)', color: '#aaa', fontSize: '0.9rem' }}>
          <div style={{ height: '1px', background: '#eee', flex: 1 }}></div>
          OR
          <div style={{ height: '1px', background: '#eee', flex: 1 }}></div>
        </div>

        <form onSubmit={handleGuestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div style={{ textAlign: 'left' }}>
            <label 
              htmlFor="name" 
              style={{ 
                display: 'block', 
                marginBottom: 'var(--spacing-2)', 
                fontWeight: 'bold', 
                color: 'var(--color-text)',
                fontSize: '0.9rem'
              }}
            >
              Continue as Guest
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
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
            disabled={!name.trim() || loading}
            style={{
              background: 'white',
              color: 'var(--color-text)',
              border: '2px solid #eee',
              padding: '12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: name.trim() && !loading ? 'pointer' : 'not-allowed',
              opacity: name.trim() && !loading ? 1 : 0.7,
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Please wait...' : 'Start Guest Session 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeScreen;
