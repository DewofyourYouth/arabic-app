
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CURRICULUM_DIR = path.join(__dirname, '../src/data/curriculum');

// We want to revert 'ج' back to 'گ' ONLY in phonetic_bedouin fields
// But we need to be careful not to revert actual Jeems.
// Luckily, my previous script only touched specific words or I can just check the known ones.
// Or better, checking if the Bedouin word has 'ج' but the Arabic word had 'ق' (Qaf).
// If Arabic has Qaf and Bedouin has Jeem, it's highly likely a hacked G.

async function main() {
  const files = fs.readdirSync(CURRICULUM_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(CURRICULUM_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let modified = false;

    if (!Array.isArray(content)) continue;

    for (const item of content) {
        if (!item.phonetic_bedouin || !item.arabic) continue;

        // Check if Arabic has Qaf (ق) and Bedouin has Jeem (ج)
        const arabicHasQaf = item.arabic.includes('ق');
        const bedouinHasJeem = item.phonetic_bedouin.includes('ج');

        if (arabicHasQaf && bedouinHasJeem) {
            const original = item.phonetic_bedouin;
            const fixed = original.replace(/ج/g, 'گ'); // Revert to Gaf
            
            console.log(`[${file}] Reverting Hack: ${original} -> ${fixed} (Base: ${item.arabic})`);
            item.phonetic_bedouin = fixed;
            modified = true;
            
            // Delete audio to force regenerate
             if (item.audio_bedouin) {
                const audioPathAbs = path.join(__dirname, '../public', item.audio_bedouin);
                if (fs.existsSync(audioPathAbs)) {
                    fs.unlinkSync(audioPathAbs);
                    console.log(`Deleted ${audioPathAbs}`);
                }
            }
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
        console.log(`Saved ${file}`);
    }
  }
}

main();
