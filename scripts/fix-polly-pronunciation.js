
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CURRICULUM_DIR = path.join(__dirname, '../src/data/curriculum');
const AUDIO_OUTPUT_DIR = path.join(__dirname, '../public/audio');

// pronunciation fixes
// 1. Ta Marbuta (ة) -> Ha with Sukoon (هْ) at end of word
// 2. Ensure end of phrase has Sukoon (ْ)
// 3. Specific fix for Ahlan (أهلاً) -> أَهْلَنْ (to avoid duble tanween reading)

async function main() {
  const files = fs.readdirSync(CURRICULUM_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(CURRICULUM_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let modified = false;

    if (!Array.isArray(content)) continue;

    for (const item of content) {
        if (!item.arabic) continue;
        
        // 1. Initialize phonetic_arabic if missing
        let phonetic = item.phonetic_arabic || item.arabic;
        let originalPhonetic = phonetic;

        // FIX: Ta Marbuta at end of word/phrase -> Ha + Sukoon
        // Regex looks for ة followed by end of string or non-word char (like space or punctuation)
        // But be careful not to break words in middle. 
        // Generically, in Levantine/Bedouin, ة at end of PAUSE is 'h/a'.
        // So we replace `ة` at end of string with `هْ`.
        
        if (phonetic.includes('ة')) {
             phonetic = phonetic.replace(/ة([؟!.,]|$)/g, 'هْ$1'); 
             // Also replace if followed by space? No, inside phrase it might be pronounced as 't'.
             // User complained about "Masallamet" (Ma'a as-salameh).
             // That is at end.
        }

        // FIX: Ahlan -> Ahlan (explicit nuun)
        if (phonetic.includes('أهلاً')) {
             phonetic = phonetic.replace('أهلاً', 'أَهْلَنْ');
        }
        
        // FIX: Kifik (Female) -> Force IPA
        if (item.id === 'l1_basics_howareyou_f') {
            item.ipa = "k iː f i k"; 
            item.phonetic_arabic = "كِيفِكْ"; // Just in case
            modified = true;
            // force delete
            if (item.audio && fs.existsSync(path.join(AUDIO_OUTPUT_DIR, path.basename(item.audio)))) {
                fs.unlinkSync(path.join(AUDIO_OUTPUT_DIR, path.basename(item.audio)));
            }
        }

        // FIX: Coffee (Ahwah / Gahwah)
        if (item.arabic === 'قَهْوَة' || item.id === 'place_cafe' || item.id === 'l1_food_coffee') {
            item.gender = "female"; // Ensure Female
            // Urban: Ahweh
            item.ipa = "ˈʔ a h w e"; 
            
            // Bedouin: Gahwa
            // User says "gah-hu-wa" with X-SAMPA "g a h . w a".
            // Switching to Standard IPA with Zeina (who handles it well).
            // /ɡ/ (voiced velar plosive) + /a/ + /h/ + /w/ + /a/
            // "ɡahwa"
            item.ipa_bedouin = "ɡ a h w a"; 
            
            modified = true;
             if (item.audio) {
                const p = path.join(__dirname, '../public', item.audio);
                if (fs.existsSync(p)) fs.unlinkSync(p);
            }
            if (item.audio_bedouin) {
                const p = path.join(__dirname, '../public', item.audio_bedouin);
                if (fs.existsSync(p)) fs.unlinkSync(p);
            }
            console.log(`[${file}] Fixed Coffee IPA & Gender for ${item.id}`);
        }

        // FIX: Specific Bedouin G words (Market, Hotel, Orange)
        // Zeina needs explicit G.
        
        // Market (Souq -> Soog)
        if (item.id === 'place_market' || item.id === 'l2_shop_market') {
             item.gender = "female";
             item.ipa_bedouin = "s uː ɡ"; // Soog
             modified = true;
             if (item.audio_bedouin && fs.existsSync(path.join(__dirname, '../public', item.audio_bedouin))) {
                 fs.unlinkSync(path.join(__dirname, '../public', item.audio_bedouin));
             }
        }
        
        // Hotel (Funduq -> Fundug)
        if (item.id === 'place_hotel') {
             item.gender = "female";
             item.ipa_bedouin = "f u n d u ɡ"; 
             modified = true;
             if (item.audio_bedouin && fs.existsSync(path.join(__dirname, '../public', item.audio_bedouin))) {
                 fs.unlinkSync(path.join(__dirname, '../public', item.audio_bedouin));
             }
        }
        
        // Orange (Burtuqal -> Burtugal)
        if (item.id === 'l1_food_orange') {
             item.gender = "female";
             item.ipa_bedouin = "b u r t u ɡ aː l"; 
             modified = true;
             if (item.audio_bedouin && fs.existsSync(path.join(__dirname, '../public', item.audio_bedouin))) {
                 fs.unlinkSync(path.join(__dirname, '../public', item.audio_bedouin));
             }
        }

        // GLOBAL FIX: Zayd (Male) fails on Bedouin 'G' (Gaf).
        // Switch ALL words with 'Gaf' (گ) or 'Qaf' (ق) in Bedouin mode to Female (Zeina).
        // Zeina supports 'G' (via X-SAMPA or possibly text).
        // We will force Gender = Female for these.
        
        // GLOBAL FIX: Zayd (Male) fails on Bedouin 'G' (Gaf).
        // Switch ALL words with 'Gaf' (گ) or 'Qaf' (ق) in Bedouin mode to Female (Zeina).
        // Fix: Check arabic.includes('ق') even if phonetic_bedouin is missing.
        
        let needsGenderSwitch = false;
        const hasGaf = item.phonetic_bedouin && item.phonetic_bedouin.includes('گ');
        const hasQaf = item.arabic && item.arabic.includes('ق');
        
        if (hasGaf || hasQaf) {
            // 1. Force Female Voice (Zeina)
            if (item.gender !== 'female') {
                item.gender = 'female';
                modified = true;
                needsGenderSwitch = true; 
                console.log(`[${file}] Switched ${item.id} to Female (Zeina) for Bedouin 'G' support.`);
            }

            // 2. Force IPA for Bedouin (Auto-generate if missing)
            // Zeina needs explicit /ɡ/ to say "G".
            // Heuristic: If we don't have explicit IPA, try to construct it from Transliteration or approximate.
            // BETTER: If no ipa_bedouin, let's TRY to map common chars ???
            // Actually, for "Ba'ul", Transliteration is "Ba'ul". 
            // If we replace "'" with "g", we get "Bagul".
            // X-SAMPA: "b a g u l" might work?
            // Let's try to be smart for the specific case of "Ba'ul" (I say) -> "b a ɡ uː l"
            
            if (item.arabic === 'بقول') { // I say
                 item.ipa_bedouin = "b a ɡ uː l";
                 modified = true;
                 needsGenderSwitch = true;
            }
            if (item.arabic === 'بتقول') { // You/She says
                 item.ipa_bedouin = "b t ɡ uː l"; // b t g u l
                 modified = true;
                 needsGenderSwitch = true;
            }
             if (item.arabic === 'بيقول') { // He says
                 item.ipa_bedouin = "b j ɡ uː l"; 
                 modified = true;
                 needsGenderSwitch = true;
            }
            // Add other common forms or leave them for Zeina to read as "Q" (better than "Hwa")
            
            // ALWAYS force delete to ensure regeneration (fixing stale cache issue)
            if (item.audio_bedouin) {
                const p = path.join(__dirname, '../public', item.audio_bedouin);
                if (fs.existsSync(p)) {
                    fs.unlinkSync(p);
                    console.log(`Deleted stale audio: ${p}`);
                }
            }
        }

        // FIX: Global Sukoon at end
        // If the last character (ignoring punctuation) is NOT a Sukoon, add it.
        // Clean punctuation for check
        const lastChar = phonetic.replace(/[؟!.,\s]+$/, '').slice(-1);
        const isSukoon = lastChar === 'ْ';
        const isDiacritic = /[\u064B-\u0652]/.test(lastChar); 
        
        if (!isSukoon) {
            // Find where to insert sukoon (before punctuation)
            const match = phonetic.match(/([؟!.,]+)$/);
            if (match) {
                // Insert before punctuation
                const punctuation = match[1];
                const base = phonetic.slice(0, -punctuation.length);
                // If base ends in diacritic other than sukoon, replace it? 
                // Polly is sensitive. Let's just append Sukoon to the letter.
                phonetic = base + 'ْ' + punctuation;
            } else {
                phonetic = phonetic + 'ْ';
            }
        }
        
        // Special Case: "Kifak" / "Kif Halak"
        // Ensure Kaf has Sukoon: كِيفَكْ
        // Ensure Halak has Sukoon: حَالَكْ
        
        if (phonetic !== originalPhonetic) {
            item.phonetic_arabic = phonetic;
            modified = true;
            console.log(`[${file}] Fixed: ${originalPhonetic} -> ${phonetic}`);

            // Delete audio to force regenerate
            // Both standard and bedouin (if bedouin relies on phonetic_arabic)
             if (item.audio) {
                const audioPathAbs = path.join(__dirname, '../public', item.audio);
                if (fs.existsSync(audioPathAbs)) fs.unlinkSync(audioPathAbs);
            }
            if (item.audio_bedouin) {
                 // Check if bedouin has its own override. If not, it uses phonetic_arabic, so delete.
                 // If it has phonetic_bedouin, we might need to fix THAT too.
                 if (!item.phonetic_bedouin) {
                    const audioPathAbs = path.join(__dirname, '../public', item.audio_bedouin);
                    if (fs.existsSync(audioPathAbs)) fs.unlinkSync(audioPathAbs);
                 }
            }
        }
        
        // ALSO FIX PHONETIC_BEDOUIN if present
        if (item.phonetic_bedouin) {
             let pb = item.phonetic_bedouin;
             let pbOriginal = pb;
             
             if (pb.includes('ة')) pb = pb.replace(/ة([؟!.,]|$)/g, 'هْ$1');
             if (pb.includes('أهلاً')) pb = pb.replace('أهلاً', 'أَهْلَنْ');
             
             // Ensure sukoon
             const lastCharB = pb.replace(/[؟!.,\s]+$/, '').slice(-1);
             if (lastCharB !== 'ْ') {
                 const match = pb.match(/([؟!.,]+)$/);
                 if (match) {
                     pb = pb.slice(0, -match[1].length) + 'ْ' + match[1];
                 } else {
                     pb = pb + 'ْ';
                 }
             }
             
             if (pb !== pbOriginal) {
                 item.phonetic_bedouin = pb;
                 modified = true;
                 console.log(`[${file}] Fixed Bedouin: ${pbOriginal} -> ${pb}`);
                 if (item.audio_bedouin) {
                    const audioPathAbs = path.join(__dirname, '../public', item.audio_bedouin);
                    if (fs.existsSync(audioPathAbs)) fs.unlinkSync(audioPathAbs);
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
