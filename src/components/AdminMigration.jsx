import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc, writeBatch, collection, getDocs } from 'firebase/firestore';
import combinedCurriculum, { levels as staticLevels } from '../data/curriculum';

const AdminMigration = ({ onBack }) => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState('idle'); // idle, processing, done, error
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const addLog = (msg) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const runMigration = async () => {
    try {
      setStatus('processing');
      setLogs([]);
      setProgress(0);
      addLog("Starting migration...");

      // 1. Upload Atomic Vocab to 'vocab' collection
      addLog(`Found ${combinedCurriculum.length} items in local JSON.`);
      
      const vocabBatches = [];
      let batch = writeBatch(db);
      let count = 0;

      for (const item of combinedCurriculum) {
        if (!item.id) {
            addLog(`❌ Skipping item without ID: ${JSON.stringify(item)}`);
            continue;
        }
        
        const ref = doc(db, 'vocab', item.id);
        batch.set(ref, item);
        count++;

        if (count % 400 === 0) {
          vocabBatches.push(batch);
          batch = writeBatch(db);
        }
      }
      if (count % 400 !== 0) vocabBatches.push(batch);

      addLog(`Split into ${vocabBatches.length} batches for 'vocab' collection.`);

      for (let i = 0; i < vocabBatches.length; i++) {
        await vocabBatches[i].commit();
        setProgress(Math.round(((i + 1) / vocabBatches.length) * 50)); // First 50%
        addLog(`✅ Committed batch ${i + 1}/${vocabBatches.length}`);
      }

      // 2. Publish Bundles to 'published_curriculum'
      addLog("Bundling levels...");
      
      // Group by level
      const paramsByLevel = {}; // { 1: [], 2: [], ... }
      
      combinedCurriculum.forEach(item => {
          const lvl = item.level || 1;
          if (!paramsByLevel[lvl]) paramsByLevel[lvl] = [];
          paramsByLevel[lvl].push(item);
      });

      const pubBatch = writeBatch(db);
      
      for (const [lvl, items] of Object.entries(paramsByLevel)) {
          // Flatten standard JSON structures if needed, but here we just dump the array
          // The implementation plan says: `published_curriculum` -> `level_X`
          const docId = `level_${lvl}`;
          const ref = doc(db, 'published_curriculum', docId);
          
          // We wrap in an object. We can also add metadata like 'count'.
          pubBatch.set(ref, {
              id: docId,
              level: Number(lvl),
              items: items,
              lastUpdated: new Date().toISOString(),
              itemCount: items.length
          });
          
          addLog(`📦 Bundled Level ${lvl} (${items.length} items)`);
      }

      // 3. Update Metadata
      const metaRef = doc(db, 'curriculum', 'metadata'); // Legacy location
      // OR new location? Plan says "Update DataContext to prioritize Firestore". 
      // Let's stick to a consistent location. The DataContext currently reads 'curriculum/metadata'.
      // But we are creating new collections.
      // Let's put metadata in `published_curriculum/metadata` too.
      
      const newMetaRef = doc(db, 'published_curriculum', 'metadata');
      pubBatch.set(newMetaRef, {
          version: 1,
          lastUpdated: new Date().toISOString(),
          supportedLevels: Object.keys(paramsByLevel).map(Number)
      });
      
      await pubBatch.commit();
      setProgress(100);
      addLog("✅ Published bundles and metadata.");

      setStatus('done');
      addLog("Migration Complete! 🎉");

    } catch (err) {
      console.error(err);
      setStatus('error');
      addLog(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Admin: Data Migration</h1>
      
      {currentUser && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          background: '#FFF3E0', 
          border: '1px solid #FFB74D', 
          borderRadius: '8px' 
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#EF6C00' }}>⚠️ Developer Access Enabled</h4>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>
            Currently, <strong>ANY logged-in user</strong> can access this page. 
            To secure it, copy your UID below and update <code>ADMIN_UIDS</code> in <code>App.jsx</code>.
          </p>
          <div style={{ background: 'white', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <strong>Your UID:</strong> 
            <code style={{ fontFamily: 'monospace', background: '#f5f5f5', padding: '2px 6px' }}>{currentUser.uid}</code>
          </div>
        </div>
      )}

      <p>This tool will upload all local JSON data to Firestore.</p>
      
      <div style={{ margin: '20px 0', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h3>Stats</h3>
        <p>Total Items: {combinedCurriculum.length}</p>
        <p>Levels: {staticLevels.length}</p>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={runMigration} 
            disabled={status === 'processing'}
            style={{ 
                padding: '10px 20px', 
                background: status === 'processing' ? '#ccc' : '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer'
            }}
          >
            {status === 'processing' ? 'Migrating...' : 'Start Migration'}
          </button>
          
          <button 
            onClick={onBack}
            style={{ padding: '10px 20px', background: '#eee', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Back to App
          </button>
      </div>

      {progress > 0 && (
          <div style={{ marginTop: '20px', height: '20px', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#28a745', transition: 'width 0.3s' }}></div>
          </div>
      )}

      <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '10px', borderRadius: '5px', maxHeight: '300px', overflowY: 'auto', fontFamily: 'monospace' }}>
        {logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );
};

export default AdminMigration;
