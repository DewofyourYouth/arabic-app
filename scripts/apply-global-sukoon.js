
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CURRICULUM_DIR = path.join(__dirname, '../src/data/curriculum');

// Helper to apply sukoon to a single word
function applySukoonToWord(word) {
  if (!word) return word;
  
  // Remove existing vocalization at end if present (simple check)
  // Actually, we just want to force stop at the end.
  // Common endings to strip? No, just append sukoon usually works unless there is already a vowel.
  // Levantine usually ends in consonant or long vowel. 
  
  // Special Handling: Ta Marbuta (ة)
  if (word.endsWith('ة')) {
     // Replace with Ha + Sukoon to force "ah/eh" sound
     return word.slice(0, -1) + 'هْ';
  }

  // If word ends in a long vowel (ا, و, ي), Sukoon might be weird but usually silent.
  // If it ends in Alif (ا), adding Sukoon might make it ignored or treated as glottal. 
  // Let's NOT add Sukoon if it ends in Alif? 
  // "Marhaba" (مرحبا). If we add Sukoon -> "Marhaba". It's fine.
  // "Ana" (أنا) -> "Ana". Fine.
  
  // Only add Sukoon if not already present
  if (!word.endsWith('ْ')) {
    return word + 'ْ';
  }
  return word;
}

function processText(text) {
  if (!text) return text;
  
  // Handle slashes "foo / bar"
  if (text.includes('/')) {
    return text.split('/').map(part => applySukoonToWord(part.trim())).join(' / ');
  }
  
  // Handle multiple words? "Sabah el-kheir"
  // If we put Sukoon at very end, it handles the case ending of the last word.
  // "Sabah el-kheir" -> "Sabah el-kheir[STOP]".
  // Intermediate words might still have vowels if explicit?
  // Google TTS usually respects spaces. 
  // Let's just apply to the very end of the string for multi-word phrases, 
  // UNLESS it's a slash case.
  // Actually, for "Sabah el-kheir", the last char is 'r'. "kheir" -> "kheir[STOP]". Correct.
  
  return applySukoonToWord(text);
}

async function main() {
  const files = fs.readdirSync(CURRICULUM_DIR).filter(f => f.endsWith('.json') && !f.startsWith('topics-')); // Skip metadata files if any, but topics-ordering is curriculum?
  // Actually topics-ordering IS curriculum.
  // But strictly `level-*.json` + `topics-*.json` + `idioms.json` etc.
  // Let's just process ALL json files in that dir safely.
  // Maybe exclude `index.js` (it is js).
  
  const jsonFiles = fs.readdirSync(CURRICULUM_DIR).filter(f => f.endsWith('.json'));

  for (const file of jsonFiles) {
    const filePath = path.join(CURRICULUM_DIR, file);
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let modified = false;

        if (!Array.isArray(content)) continue; // Skip non-array files if any

        for (const item of content) {
            // Skip if already has manual phonetic override
            if (item.phonetic_arabic) continue;
            
            // Skip if no arabic text
            if (!item.arabic) continue;

            const original = item.arabic;
            const phonetic = processText(original);

            // If the generated phonetic is different from original, save it
            // Note: We only add phonetic_arabic if it ADDS value (i.e. changes pronunciation)
            // But here we basically want to enforce it everywhere to be safe.
            if (phonetic !== original) {
                item.phonetic_arabic = phonetic;
                modified = true;
                console.log(`[${file}] Applied Sukoon: ${original} -> ${phonetic}`);
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
