import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
    'src/data/curriculum/level-1-basics.json',
    'src/data/curriculum/level-1-family.json',
    'src/data/curriculum/level-1-food.json',
    'src/data/curriculum/level-1-numbers.json',
    'src/data/curriculum/level-1-verbs-expanded.json',
    'src/data/curriculum/topics-ordering.json'
];

function convertToXsampa(ipaStr) {
    if (!ipaStr) return ipaStr;
    if (ipaStr.startsWith('xsampa:')) return ipaStr;

    let res = ipaStr;
    
    // 1. Stress mark -> "
    res = res.replace(/ˈ/g, '"');

    // 2. Long vowels
    res = res.replace(/aː/g, 'a:');
    res = res.replace(/eː/g, 'e:');
    res = res.replace(/iː/g, 'i:');
    res = res.replace(/oː/g, 'o:');
    res = res.replace(/uː/g, 'u:');

    // 3. Emphatic Consonants (Pharyngealized)
    // tˤ -> t_?\
    res = res.replace(/tˤ/g, 't_?\\');
    res = res.replace(/dˤ/g, 'd_?\\');
    res = res.replace(/sˤ/g, 's_?\\');
    res = res.replace(/ðˤ/g, 'D_?\\');
    
    // 4. Special Consonants
    res = res.replace(/ʔ/g, '?');  // Glottal stop
    res = res.replace(/ʕ/g, '?\\'); // Ayin
    res = res.replace(/ħ/g, 'X\\'); // Ha (7)
    res = res.replace(/ɣ/g, 'G');  // Gh (gh)
    res = res.replace(/x/g, 'x');  // Kh (5)
    res = res.replace(/ʃ/g, 'S');  // Sh (sheen)
    res = res.replace(/ʒ/g, 'Z');  // Zh (measure)
    res = res.replace(/dʒ/g, 'dZ'); // J (judge)
    res = res.replace(/θ/g, 'T');  // Th (think)
    res = res.replace(/ð/g, 'D');  // Th (this)

    return 'xsampa:' + res;
}

files.forEach(relativePath => {
    const fullPath = path.resolve(process.cwd(), relativePath);
    if (!fs.existsSync(fullPath)) {
        console.warn(`File not found: ${relativePath}`);
        return;
    }

    console.log(`Processing ${relativePath}...`);
    let content;
    try {
        content = fs.readFileSync(fullPath, 'utf8');
    } catch (e) {
        console.error(`Error reading ${relativePath}: ${e.message}`);
        return;
    }

    let json;
    try {
        json = JSON.parse(content);
    } catch (e) {
        console.error(`Error parsing JSON in ${relativePath}: ${e.message}`);
        return;
    }

    let modifications = 0;

    const processItem = (item) => {
        if (item.ipa && !item.ipa.startsWith('xsampa:')) {
            const newIpa = convertToXsampa(item.ipa);
            if (newIpa !== item.ipa) {
                item.ipa = newIpa;
                modifications++;
            }
        }
        if (item.ipa_bedouin && !item.ipa_bedouin.startsWith('xsampa:')) {
            const newIpa = convertToXsampa(item.ipa_bedouin);
            if (newIpa !== item.ipa_bedouin) {
                item.ipa_bedouin = newIpa;
                modifications++;
            }
        }
    };

    if (Array.isArray(json)) {
        json.forEach(processItem);
    } else {
         Object.keys(json).forEach(key => {
            if (Array.isArray(json[key])) {
                json[key].forEach(processItem);
            }
        });
    }

    if (modifications > 0) {
        fs.writeFileSync(fullPath, JSON.stringify(json, null, 2));
        console.log(`  Updated ${modifications} entries.`);
    } else {
        console.log(`  No changes needed.`);
    }
});
