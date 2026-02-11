import React, { useState } from 'react';
import { migrateCurriculumToFirestore } from '../utils/migrateCurriculum';

const AdminMigration = () => {
  const [status, setStatus] = useState('idle'); // idle, migrating, success, error
  const [msg, setMsg] = useState('');

  const handleMigration = async () => {
    setStatus('migrating');
    setMsg('Migrating...');
    const result = await migrateCurriculumToFirestore();
    if (result.success) {
      setStatus('success');
      setMsg('Migration Complete! Check Firebase Console.');
    } else {
      setStatus('error');
      setMsg(`Error: ${result.error.message}`);
    }
  };

  if (status === 'success') return null; // Hide after success

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: '#333', 
      color: '#fff', 
      padding: '20px', 
      borderRadius: '8px',
      zIndex: 9999 
    }}>
      <h3>Admin: Migrate Data</h3>
      <p>{msg}</p>
      <button 
        onClick={handleMigration} 
        disabled={status === 'migrating'}
        style={{ padding: '8px 16px', marginTop: '10px', cursor: 'pointer' }}
      >
        {status === 'migrating' ? 'Uploading...' : 'Start Migration'}
      </button>
    </div>
  );
};

export default AdminMigration;
