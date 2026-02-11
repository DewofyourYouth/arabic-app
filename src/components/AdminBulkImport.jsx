import React, { useState } from 'react';
import Papa from 'papaparse';
import { db } from '../lib/firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';

const AdminBulkImport = ({ onBack }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, parsing, ready, uploading, done, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs(prev => [...prev, msg]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);
        parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    setStatus('parsing');
    setErrors([]);
    setLogs([]);
    
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            if (results.errors.length > 0) {
                setErrors(results.errors.map(e => `CSV Error on row ${e.row}: ${e.message}`));
                setStatus('error');
                return;
            }

            const rows = results.data;
            addLog(`Parsed ${rows.length} rows.`);

            // Basic Validation
            const validRows = [];
            const validationErrors = [];

            // Helper to clean keys
            const cleanRow = (row) => {
                const cleaned = {};
                Object.keys(row).forEach(key => {
                    cleaned[key.trim()] = row[key]?.trim();
                });
                return cleaned;
            };

            for (let i = 0; i < rows.length; i++) {
                const rawRow = rows[i];
                const row = cleanRow(rawRow); // Handle sloppy CSV spaces
                
                // Required Fields
                if (!row.id || !row.arabic || !row.english) {
                    validationErrors.push(`Row ${i + 2}: Missing required fields (id, arabic, or english).`);
                    continue;
                }

                // Type Check
                if (!['word', 'verb', 'phrase'].includes(row.type)) {
                   // Default to 'word' if missing, or error? Let's default.
                   if (!row.type) row.type = 'word';
                }

                // Construct Doc
                const docData = {
                    id: row.id,
                    level: parseInt(row.level) || 1,
                    type: row.type || 'word',
                    topic: row.topic || 'general',
                    arabic: row.arabic,
                    transliteration: row.transliteration || '',
                    english: row.english,
                    tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
                    lastUpdated: new Date().toISOString()
                };

                // Optional verb fields
                if (row.type === 'verb') {
                    // Start simple. If user wants conjugations, they might need JSON format or complex cols.
                    // For CSV, usually we just import the base form, then use Editor to add conjugations.
                    // Or we support columns like `past_he`, `pres_he` etc.
                    // Let's stick to base fields for now to unblock migration.
                }

                validRows.push(docData);
            }

            if (validationErrors.length > 0) {
                setErrors(prev => [...prev, ...validationErrors]);
            }
            
            setPreviewData(validRows);
            setStatus('ready');
            addLog(`Ready to import ${validRows.length} items.`);
        },
        error: (error) => {
            setErrors([`Parse Error: ${error.message}`]);
            setStatus('error');
        }
    });
  };

  const handleUpload = async () => {
      if (previewData.length === 0) return;

      setStatus('uploading');
      setUploadProgress(0);
      
      try {
          // Check for existing ID conflicts first? 
          // Firestore sets overwrite by default. This is usually what we want for "Updates".
          // If user wants to avoid overwrites, we'd need a check. 
          // Let's assume OVERWRITE is the desired behavior for "Bulk Update".
          
          const batches = [];
          let batch = writeBatch(db);
          let count = 0;

          for (const item of previewData) {
              const ref = doc(db, 'vocab', item.id);
              batch.set(ref, item, { merge: true }); // Merge to preserve fields not in CSV (like existing audio URLs)
              count++;

              if (count % 450 === 0) { // Safety limit 500
                  batches.push(batch);
                  batch = writeBatch(db);
              }
          }
          if (count % 450 !== 0) batches.push(batch);
          
          addLog(`Split into ${batches.length} batches.`);

          for (let i = 0; i < batches.length; i++) {
              await batches[i].commit();
              setUploadProgress(Math.round(((i + 1) / batches.length) * 100));
              addLog(`Committed batch ${i+1}/${batches.length}`);
          }

          setStatus('done');
          addLog("Import Complete! 🎉");
          addLog("Remember to go to 'Publish' tab to push these changes to users.");

      } catch (err) {
          console.error(err);
          setErrors([`Upload Error: ${err.message}`]);
          setStatus('error');
      }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={onBack} style={{ marginBottom: '20px' }}>← Back to Dashboard</button>
      
      <h1>Bulk Import</h1>
      <p>Upload a CSV file to add or update vocabulary.</p>
      
      {/* File Input */}
      <div style={{ 
          border: '2px dashed #ccc', 
          borderRadius: '10px', 
          padding: '40px', 
          textAlign: 'center',
          background: status === 'uploading' ? '#f9f9f9' : 'white'
      }}>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            disabled={status === 'uploading'}
            style={{ display: 'none' }}
            id="csv-upload"
          />
          <label htmlFor="csv-upload" style={{ cursor: 'pointer', display: 'block' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📄</div>
              <button 
                onClick={() => document.getElementById('csv-upload').click()}
                disabled={status === 'uploading'}
                style={{ padding: '10px 20px', fontSize: '1rem', cursor: 'pointer' }}
              >
                  Select CSV File
              </button>
              <p style={{ color: '#999', marginTop: '10px' }}>Columns: id, level, type, arabic, english, transliteration, tags</p>
          </label>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '5px' }}>
              <h4>Validation Errors ({errors.length})</h4>
              <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
          </div>
      )}

      {/* Preview */}
      {status === 'ready' && (
          <div style={{ marginTop: '20px' }}>
              <h3>Preview ({previewData.length} items)</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
                          <tr>
                              <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
                              <th style={{ padding: '8px', textAlign: 'left' }}>Arabic</th>
                              <th style={{ padding: '8px', textAlign: 'left' }}>English</th>
                              <th style={{ padding: '8px', textAlign: 'left' }}>Type</th>
                              <th style={{ padding: '8px', textAlign: 'left' }}>Level</th>
                          </tr>
                      </thead>
                      <tbody>
                          {previewData.slice(0, 50).map(row => (
                              <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
                                  <td style={{ padding: '8px' }}>{row.id}</td>
                                  <td style={{ padding: '8px' }}>{row.arabic}</td>
                                  <td style={{ padding: '8px' }}>{row.english}</td>
                                  <td style={{ padding: '8px' }}>{row.type}</td>
                                  <td style={{ padding: '8px' }}>{row.level}</td>
                              </tr>
                          ))}
                          {previewData.length > 50 && (
                              <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center', color: '#888' }}>... and {previewData.length - 50} more</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
              
              <div style={{ marginTop: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <button 
                    onClick={handleUpload}
                    style={{ 
                        padding: '12px 24px', 
                        background: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        fontSize: '1rem', 
                        fontWeight: 'bold',
                        cursor: 'pointer' 
                    }}
                  >
                      Start Import
                  </button>
                  <span style={{ color: '#666' }}>This will overwrite existing fields for these IDs.</span>
              </div>
          </div>
      )}

      {/* Progress */}
      {(status === 'uploading' || status === 'done') && (
          <div style={{ marginTop: '20px' }}>
              <h3>Upload Status</h3>
              <div style={{ height: '20px', background: '#eee', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', background: status === 'done' ? '#28a745' : '#007bff', transition: 'width 0.3s' }} />
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', background: '#f9f9f9', padding: '10px', borderRadius: '5px', fontFamily: 'monospace' }}>
                  {logs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
              {status === 'done' && (
                  <button 
                    onClick={() => { setStatus('idle'); setFile(null); setPreviewData([]); }}
                    style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
                  >
                      Import Another CSV
                  </button>
              )}
          </div>
      )}

    </div>
  );
};

export default AdminBulkImport;
