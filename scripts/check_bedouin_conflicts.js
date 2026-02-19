
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CURRICULUM_DIR = path.join(__dirname, '../src/data/curriculum');

async function main() {
  const files = fs.readdirSync(CURRICULUM_DIR).filter(f => f.endsWith('.json'));

  const conflicts = [];
  const safe = [];

  for (const file of files) {
    const filePath = path.join(CURRICULUM_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!Array.isArray(content)) continue;

    for (const item of content) {
        // Check phonetic_bedouin or bedouin-implied text
        // We know we put 'g' in phonetic_bedouin in the last step.
        // Let's check for 'g' (was Gaf) AND 'ج' (Jeem).
        
        const text = item.phonetic_bedouin || item.arabic;
        if (!text) continue;
        
        const hasG = text.includes('g') || text.includes('گ'); // Check both just in case
        const hasJ = text.includes('ج');
        
        if (hasG) {
            if (hasJ) {
                conflicts.push({ id: item.id, text, file });
            } else {
                safe.push({ id: item.id, text, file });
            }
        }
    }
  }

  console.log(`Found ${safe.length} SAFE words (G only).`);
  console.log(`Found ${conflicts.length} CONFLICT words (G + J).`);
  
  if (conflicts.length > 0) {
      console.log('Conflicts:', conflicts);
  }
}

main();
