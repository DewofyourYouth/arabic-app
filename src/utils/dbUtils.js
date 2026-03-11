import { db } from '../lib/firebase';
import { doc, writeBatch } from 'firebase/firestore';

export const bulkUploadVocab = async (data, onProgress, onLog) => {
    const batches = [];
    let batch = writeBatch(db);
    let count = 0;

    for (const item of data) {
        const ref = doc(db, 'vocab', item.id);
        batch.set(ref, item, { merge: true }); // Merge to preserve fields not in CSV (like existing audio URLs)
        count++;

        if (count % 450 === 0) { // Safety limit 500
            batches.push(batch);
            batch = writeBatch(db);
        }
    }
    if (count % 450 !== 0) batches.push(batch);
    
    if (onLog) onLog(`Split into ${batches.length} batches.`);

    for (let i = 0; i < batches.length; i++) {
        await batches[i].commit();
        if (onProgress) onProgress(Math.round(((i + 1) / batches.length) * 100));
        if (onLog) onLog(`Committed batch ${i+1}/${batches.length}`);
    }
};
