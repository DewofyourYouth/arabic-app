import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CURRICULUM_DIR = path.join(__dirname, '../src/data/curriculum');

// Advanced Transliteration to X-SAMPA / IPA Mapper
// We use X-SAMPA because it's easier to manipulate and pass to Polly
function translitToXsampa(text) {
    if (!text) return null;
    
    // Lowercase and strip punctuation
    let s = text.toLowerCase().replace(/[?,.!();]/g, '');

    // Multi-char replacements (do these first)
    s = s.replace(/sh/g, 'S'); // sheen
    s = s.replace(/kh/g, 'x'); // khaa
    s = s.replace(/gh/g, 'G'); // ghayn
    s = s.replace(/dh/g, 'D'); // dhaal
    s = s.replace(/th/g, 'T'); // thaa
    s = s.replace(/ch/g, 'tS'); // tsha
    s = s.replace(/ee/g, 'i:');
    s = s.replace(/uu/g, 'u:');
    s = s.replace(/aa/g, 'a:');
    s = s.replace(/ou/g, 'u:'); // like "mabsoot" or "goul"
    s = s.replace(/oo/g, 'u:'); // "soog"
    
    // Arabic chat alphabet
    s = s.replace(/7/g, 'X\\'); // Haa
    s = s.replace(/3/g, '?\\'); // Ayn
    s = s.replace(/2/g, '?');   // Hamza
    s = s.replace(/5/g, 'x');   // Khaa
    s = s.replace(/6/g, 't_?\\'); // Taa (Ta)
    s = s.replace(/9/g, 's_?\\'); // Saad
    
    // Specific letter shifts
    s = s.replace(/'/g, '?'); // glottal stop
    s = s.replace(/j/g, 'dZ'); // Jeem
    s = s.replace(/y/g, 'j'); // Yaa (consonant)
    s = s.replace(/q/g, '?'); // Qaf (Urban default is Hamza for translit, but we will fix later)
    
    // Vowel rules
    // Sometimes transliterations have "ai" (daiman) or "au" / "aw"
    s = s.replace(/ai/g, 'aj'); // Daiman -> Dajman
    s = s.replace(/ay/g, 'aj'); 
    s = s.replace(/aw/g, 'aw');
    
    // Clean up spaces
    s = s.replace(/\s+/g, ' ').trim();
    
    return 'xsampa:' + s;
}

// Same for Bedouin, but we preserve G
function translitToXsampaBedouin(text, originalArabic) {
    if (!text) return null;
    
    // Let's take the base mapper
    let s = text.toLowerCase().replace(/[?,.!();]/g, '');

    // Multi-char replacements
    s = s.replace(/sh/g, 'S');
    s = s.replace(/kh/g, 'x');
    s = s.replace(/gh/g, 'G');
    s = s.replace(/dh/g, 'D');
    s = s.replace(/th/g, 'T');
    s = s.replace(/ch/g, 'tS');
    s = s.replace(/ee/g, 'i:');
    s = s.replace(/uu/g, 'u:');
    s = s.replace(/aa/g, 'a:');
    s = s.replace(/ou/g, 'u:');
    s = s.replace(/oo/g, 'u:');
    
    s = s.replace(/7/g, 'X\\');
    s = s.replace(/3/g, '?\\');
    s = s.replace(/2/g, '?');
    s = s.replace(/5/g, 'x');
    s = s.replace(/6/g, 't_?\\');
    s = s.replace(/9/g, 's_?\\');
    
    // Specific letter shifts
    s = s.replace(/'/g, '?'); // glottal stop
    s = s.replace(/j/g, 'dZ'); // Jeem
    s = s.replace(/y/g, 'j'); // Yaa (consonant)
    
    // Bedouin Qaf -> G rule
    // Almost ALL 'q' in transliteration should be 'g' in Bedouin (e.g. qaddesh -> gaddesh, qahwa -> gahwa, qalam -> galam)
    // Urban dropped it to '?' or left it as 'q' in spelling.
    s = s.replace(/q/g, 'g'); 

    // What about words where Transliteration uses ' (glottal stop) instead of Q? 
    // e.g., "ba'ul" (I say) -> "bagul". 
    // This is hard to catch programmatically without false-positives on real hamzas (like su'al).
    // We will rely on Arabic text: If arabic has 'ق', replace ALL '?' with 'g'.
    // WAIT: "Daqa'iq" has both Qaf and Hamza. Replacing all '?' is dangerous.
    // It's safer to use MANUAL_OVERRIDES for the ba'ul/biguul family if the transliteration dropped the Q entirely.
    
    // Some Bedouin regions also shift 'k' to 'ch' (tS) in specific phonetic environments (usually near front vowels).
    // e.g. "Kifak" -> "Chifak". "Dik" -> "Dich". "Samak" -> "Samach".
    // For now, I will NOT auto-map k->ch unless the user specifically requests it, as it varies heavily by specific tribe (e.g., Jordanian vs Saudi vs Iraqi). 
    // Basic "G" for "Q" is pan-Bedouin/Gulf.

    s = s.replace(/ai/g, 'aj');
    s = s.replace(/ay/g, 'aj');
    s = s.replace(/aw/g, 'aw');
    s = s.replace(/\s+/g, ' ').trim();

    return 'xsampa:' + s;
}

// specific manual overrides for known problem items we don't want to mess up
const MANUAL_OVERRIDES_URBAN = {
    'l1_g_howareyou_m': 'xsampa:ki:fak',
    'l1_g_howareyou_f': 'xsampa:ki:fik',
    'l2_time_always': 'xsampa:da:jman',
    'l1_res_yourewelcome': 'xsampa:?afwan'
};

const MANUAL_OVERRIDES_BEDOUIN = {
    'l1_g_howareyou_m': 'xsampa:ki:fak',
    'l1_g_howareyou_f': 'xsampa:ki:fik',
    'l2_time_always': 'xsampa:da:jman',
    'l1_res_yourewelcome': 'xsampa:?afwan',
    'l1_food_coffee': 'xsampa:gahwa', 
    'place_cafe': 'xsampa:gahwa',
    'place_market': 'xsampa:su:g',
    'l1_v_say_i': 'xsampa:bagu:l',
    'l1_v_say_you_m': 'xsampa:bitgu:l',
    'l1_v_say_he': 'xsampa:bigu:l'
};

function main() {
    const files = fs.readdirSync(CURRICULUM_DIR).filter(f => f.endsWith('.json'));

    let totalUpdated = 0;

    for (const file of files) {
        const filePath = path.join(CURRICULUM_DIR, file);
        let content = [];
        try {
            content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch(e) { continue; }

        if (!Array.isArray(content)) continue;

        let modified = false;

        for (const item of content) {
            // Only update if auto-generated previously, or if missing
            // The user wants a clean slate of GOOD pronunciations.
            
            // Urban IPA:
            if (!item.ipa || item.ipa_auto_generated !== false) {
                let newIpa = null;
                if (MANUAL_OVERRIDES_URBAN[item.id]) {
                    newIpa = MANUAL_OVERRIDES_URBAN[item.id];
                } else if (item.transliteration) {
                    newIpa = translitToXsampa(item.transliteration);
                }

                if (newIpa && newIpa !== item.ipa) {
                    item.ipa = newIpa;
                    item.ipa_auto_generated = true;
                    modified = true;
                }
            }

            // Bedouin IPA:
            if (!item.ipa_bedouin || item.ipa_bedouin_auto_generated !== false) {
                let newIpaB = null;
                if (MANUAL_OVERRIDES_BEDOUIN[item.id]) {
                    newIpaB = MANUAL_OVERRIDES_BEDOUIN[item.id];
                } else if (item.transliteration) {
                    newIpaB = translitToXsampaBedouin(item.transliteration, item.arabic);
                }

                if (newIpaB && newIpaB !== item.ipa_bedouin) {
                    item.ipa_bedouin = newIpaB;
                    item.ipa_bedouin_auto_generated = true;
                    
                    if (item.gender !== 'female') {
                        item.gender = 'female'; // Zeina rules all IPA
                    }
                    
                    modified = true;
                }
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
            console.log(`Updated ${file}`);
            totalUpdated++;
        }
    }
    
    console.log(`Finished updating ${totalUpdated} files with transliteration->IPA logic.`);
}

main();
