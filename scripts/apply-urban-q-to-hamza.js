
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
            // Apply to phonetic_arabic (Urban/Default)
            // If phonetic_arabic exists, use it. If not, use arabic (and add sukoon? No, previous script handled sukoon).
            // But if previous script added sukoon, phonetic_arabic SHOULD exist for almost everything.
            // If it doesn't exist, we skip (or should we derive from arabic?).
            // Let's assume phonetic_arabic exists or we fallback to arabic AND create phonetic_arabic.
            
            let source = item.phonetic_arabic;
            if (!source && item.arabic) {
                 // Should have been caught by apply-global-sukoon.js, but just in case.
                 source = item.arabic;
            }

            if (source && source.includes('ق')) {
                // Replace Qaf with Hamza
                // Qahwa -> 'Ahwa. (قَهْوَة -> ءَهْوَة)
                // This seems safe for Urban Levantine.
                const urban = source.replace(/ق/g, 'ء');
                
                if (item.phonetic_arabic !== urban) {
                    item.phonetic_arabic = urban;
                    modified = true;
                    console.log(`[${file}] Urban Fix: ${source} -> ${urban}`);
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
