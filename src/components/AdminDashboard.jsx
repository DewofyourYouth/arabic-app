import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminContentEditor from './AdminContentEditor';
import AdminBulkImport from './AdminBulkImport';

const AdminDashboard = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [activeTool, setActiveTool] = useState(null); // 'editor', 'import', 'publish'

  if (activeTool === 'editor') {
      return <AdminContentEditor onBack={() => setActiveTool(null)} />;
  }

  if (activeTool === 'import') {
      return <AdminBulkImport onBack={() => setActiveTool(null)} />;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--color-primary)' }}>Admin Portal</h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>Manage Curriculum Content</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
           <button 
             onClick={() => onNavigate('admin-migrate')}
             style={{ padding: '10px 20px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer', color: '#666' }}
           >
             Legacy Migration Tool
           </button>
           <button 
             onClick={() => onNavigate('map')}
             style={{ padding: '10px 20px', background: 'white', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }}
           >
             Exit to App
           </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Content Editor */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>✏️ Content Editor</h3>
          <p style={{ color: '#666' }}>Add, edit, or delete vocabulary cards and verb conjugations.</p>
          <button 
            onClick={() => setActiveTool('editor')}
            style={{ width: '100%', padding: '10px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Open Editor
          </button>
        </div>

        {/* Card 2: Bulk Import */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>📥 Bulk Import</h3>
          <p style={{ color: '#666' }}>Upload CSV files to add hundreds of words at once.</p>
          <button 
            onClick={() => setActiveTool('import')}
            style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Go to Importer
          </button>
        </div>

        {/* Card 3: Publish */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>🚀 Publish</h3>
          <p style={{ color: '#666' }}>Bundle atomic changes and push them to all users.</p>
          <button style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Publish Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
