import React from 'react';

const SocialLoginButton = ({ provider, onClick, icon, label, style }) => {
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '12px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid #ddd',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    background: 'white',
    color: '#333',
    boxShadow: '0 2px 0 rgba(0,0,0,0.05)',
    transition: 'all 0.2s',
    gap: '12px', // Space between icon and text
    ...style
  };

  return (
    <button onClick={onClick} style={baseStyle}>
      {icon && <span style={{ fontSize: '1.2rem' }}>{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

export default SocialLoginButton;
