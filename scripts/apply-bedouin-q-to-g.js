
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CURRICULUM_DIR = path.join(__dirname, '../src/data/curriculum');

async function main() {
  const files = fs.readdirSync(CURRICULUM_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(CURRICULUM_DIR, file);
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let modified = false;

        if (!Array.isArray(content)) continue;

        for (const item of content) {
            const hasQaf = (item.phonetic_arabic && item.phonetic_arabic.includes('ق')) || (item.arabic && item.arabic.includes('ق'));
            
            if (hasQaf) {
                // Determine source text (prefer existing phonetic_arabic which has Sukoon)
                const source = item.phonetic_arabic || item.arabic;
                
                // Replace Qaf with Gaf
                const bedouin = source.replace(/ق/g, 'گ');
                
                // Only update if it's different and doesn't already exist (or overwrite to fix?)
                // We should overwrite to be sure we restore the "G".
                if (item.phonetic_bedouin !== bedouin) {
                    item.phonetic_bedouin = bedouin;
                    modified = true;
                    console.log(`[${file}] Bedouin Fix: ${source} -> ${bedouin}`);
                }
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
            console.log(`Saved ${file}`);
        }

    } catch (e) {
        console.error(`Error processing ${file}:`, e);
    }
  }
}

main();
