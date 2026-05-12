import React, { useState } from 'react';
import { parseVocabCSV } from '../utils/csvUtils';
import { bulkUploadVocab } from '../utils/dbUtils';

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
        parseFile(selectedFile);
    }
  };

  const parseFile = async (file) => {
    setStatus('parsing');
    setErrors([]);
    setLogs([]);
    
    try {
        const { validRows, validationErrors } = await parseVocabCSV(file, addLog);
        if (validationErrors && validationErrors.length > 0) {
            setErrors(validationErrors);
        }
        if (validRows && validRows.length > 0) {
            setPreviewData(validRows);
            setStatus('ready');
        } else if (validationErrors && validationErrors.length > 0) {
            setStatus('error');
        } else {
            setErrors(['No valid rows found to import.']);
            setStatus('error');
        }
    } catch (err) {
        setErrors([`Parse Error: ${err.message}`]);
        setStatus('error');
    }
  };

  const handleUpload = async () => {
      if (previewData.length === 0) return;

      setStatus('uploading');
      setUploadProgress(0);
      
      try {
          await bulkUploadVocab(previewData, setUploadProgress, addLog);
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
