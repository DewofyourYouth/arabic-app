import Papa from 'papaparse';

export const parseVocabCSV = (file, onLog) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    const errors = results.errors.map(e => `CSV Error on row ${e.row}: ${e.message}`);
                    resolve({ validRows: [], validationErrors: errors });
                    return;
                }

                const rows = results.data;
                if (onLog) onLog(`Parsed ${rows.length} rows.`);

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

                    validRows.push(docData);
                }

                if (onLog) onLog(`Ready to import ${validRows.length} items.`);
                resolve({ validRows, validationErrors });
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};
