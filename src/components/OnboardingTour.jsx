import React, { useState, useEffect } from 'react';
import Fennec from './Fennec';

const steps = [
  {
    target: 'welcome',
    title: 'Welcome to HAKI! 👋',
    content: "I'm Fennec, your guide to learning Levantine Arabic. Let me show you around!",
    position: 'center',
    mood: 'happy'
  },
  {
    target: 'map-view', 
    title: 'The Map 🌍',
    content: 'This is your journey through the Levant. Each city unlocks new challenges and vocabulary.',
    position: 'bottom',
    mood: 'celebrating'
  },
  {
    target: 'xp-bar',
    title: 'Level Up! 🚀',
    content: 'Earn XP by completing sessions. Watch your level grow as you master new words.',
    position: 'bottom-left', // adjust based on UI
    mood: 'happy'
  },
  {
    target: 'start-btn',
    title: 'Start Practice ▶',
    content: 'Ready to learn? Click here to start a quick 10-card session. We mix new words with review.',
    position: 'top',
    mood: 'happy' 
  },
  {
    target: 'settings-btn',
    title: 'Your Settings ⚙️',
    content: 'Toggle Arabic script on/off here. Adjust it to match your comfort level.',
    position: 'bottom-right',
    mood: 'idle'
  }
];

const OnboardingTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2000,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-6)',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 'var(--spacing-4)',
        animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        
        {/* Mascot */}
        <div style={{ marginTop: '-60px' }}>
          <Fennec mood={step.mood} size={100} />
        </div>

        <div>
          <h2 style={{ 
            color: 'var(--color-primary)', 
            marginBottom: 'var(--spacing-2)',
            fontSize: '1.5rem'
          }}>
            {step.title}
          </h2>
          <p style={{ color: 'var(--color-text-light)', lineHeight: '1.5' }}>
            {step.content}
          </p>
        </div>

        {/* Progress Dots */}
        <div style={{ display: 'flex', gap: '8px', margin: 'var(--spacing-2) 0' }}>
          {steps.map((_, idx) => (
            <div 
              key={idx}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: idx === currentStep ? 'var(--color-primary)' : '#eee',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            padding: '12px 32px',
            borderRadius: 'var(--radius-full)',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 0 var(--color-primary-dark)',
            width: '100%'
          }}
        >
          {currentStep === steps.length - 1 ? "Let's Go! 🚀" : 'Next ➜'}
        </button>

      </div>
    </div>
  );
};

export default OnboardingTour;
