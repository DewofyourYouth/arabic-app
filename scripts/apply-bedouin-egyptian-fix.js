
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
            // Check for Latin 'g' (from previous failed fix) OR 'گ'
            let bedouin = item.phonetic_bedouin;
            
            if (bedouin && (bedouin.includes('g') || bedouin.includes('گ'))) {
                const original = bedouin;
                // Replace 'g' or 'گ' with 'ج' (Jeem) for Egyptian voice
                const fixed = original.replace(/g/g, 'ج').replace(/گ/g, 'ج');
                
                if (fixed !== original) {
                    item.phonetic_bedouin = fixed;
                    // Add a special flag/tag so generate-audio knows to use Egyptian voice?
                    // Or we just detect "phonetic_bedouin" usage in generate-audio?
                    // Actually, we can just rely on the fact that we are generating the "_bedouin" variant.
                    
                    modified = true;
                    console.log(`[${file}] Egyptian Fix: ${original} -> ${fixed}`);
                    
                    // TARGETED DELETION
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
