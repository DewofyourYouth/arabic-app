
import fs from 'fs';
import path from 'path';
import textToSpeech from '@google-cloud/text-to-speech';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: path.join(__dirname, '../google-cloud-key.json')
});

async function gen(text, filename) {
    const request = {
        input: { ssml: `<speak>${text}</speak>` },
        voice: { languageCode: 'ar-XA', name: 'ar-XA-Wavenet-B' },
        audioConfig: { audioEncoding: 'MP3' },
    };
    try {
        const [response] = await client.synthesizeSpeech(request);
        fs.writeFileSync(path.join(__dirname, `../public/audio/test_${filename}.mp3`), response.audioContent);
        console.log(`Generated test_${filename}.mp3`);
    } catch (e) {
        console.error(e);
    }
}

async function main() {
    // Test mixing Latin G with Arabic
    await gen('gَهْوَة', 'mixed_gahwa_start'); 
    await gen('بْgُولْ', 'mixed_bgoul_mid');
    
    // Test pure transliteration for G-words
    await gen('Gahwa', 'latin_gahwa_pure');
    await gen('Bgoul', 'latin_bgoul_pure');
    
    // Test Egyptian Voice on unmodified text (maybe it reads Gaf correctly?)
    // But ar-EG usually reads Jeem as G. Gaf is Gaf.
    
    // One more try with IPA but using the name "g" not "g" char? No.
}

main();
