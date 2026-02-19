
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../src/data/curriculum');

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    console.log(`Processing ${path.basename(filePath)}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    let json;
    try {
        json = JSON.parse(content);
    } catch (e) {
        console.error(`Error parsing ${filePath}`, e);
        return;
    }

    let modified = false;

    const stripIpa = (item) => {
        if (item.ipa) {
            delete item.ipa;
            modified = true;
        }
        if (item.ipa_bedouin) {
            delete item.ipa_bedouin;
            modified = true;
        }
    };

    if (Array.isArray(json)) {
        json.forEach(stripIpa);
    } else {
        // Handle object of arrays (e.g. topics-ordering.json might be structured differently? check later. 
        // Most are arrays. If it's an object, we iterate keys.)
         Object.keys(json).forEach(key => {
            if (Array.isArray(json[key])) {
                json[key].forEach(stripIpa);
            }
        });
    }

    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
        console.log(`  Stripped IPA fields.`);
    } else {
        console.log(`  No IPA fields found.`);
    }
}

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
files.forEach(f => processFile(path.join(DATA_DIR, f)));
