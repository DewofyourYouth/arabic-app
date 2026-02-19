
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CURRICULUM_DIR = path.join(__dirname, '../src/data/curriculum');
const AUDIO_OUTPUT_DIR = path.join(__dirname, '../public/audio');

async function main() {
  const files = fs.readdirSync(CURRICULUM_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(CURRICULUM_DIR, file);
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let modified = false;

        if (!Array.isArray(content)) continue;

        for (const item of content) {
            // Check for Gaf in phonetic_bedouin
            if (item.phonetic_bedouin && item.phonetic_bedouin.includes('گ')) {
                const original = item.phonetic_bedouin;
                // Replace Gaf with Latin 'g'
                const fixed = original.replace(/گ/g, 'g');
                
                if (fixed !== original) {
                    item.phonetic_bedouin = fixed;
                    modified = true;
                    console.log(`[${file}] Fixed G: ${original} -> ${fixed}`);
                    
                    // TARGETED DELETION:
                    // Delete the existing bedouin audio file so it gets regenerated
                    // We need to reconstruct the path logic from generate-audio.js
                    // audio_bedouin path is likely already in item.audio_bedouin
                     if (item.audio_bedouin) {
                        const audioPathRel = item.audio_bedouin;
                        const audioPathAbs = path.join(__dirname, '../public', audioPathRel);
                        if (fs.existsSync(audioPathAbs)) {
                            fs.unlinkSync(audioPathAbs);
                            console.log(`Deleted ${audioPathAbs} for regeneration`);
                        }
                    }
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
