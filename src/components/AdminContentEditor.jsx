import React from 'react';

const AdminContentEditor = ({ onBack }) => {
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={onBack} style={{ marginBottom: '20px' }}>← Back to Dashboard</button>
      <h1>Content Editor</h1>
      <p>Coming Soon: A form to add/edit vocabulary.</p>
    </div>
  );
};

export default AdminContentEditor;
