
import fs from 'fs';
import path from 'path';
import textToSpeech from '@google-cloud/text-to-speech';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: path.join(__dirname, '../google-cloud-key.json')
});

async function gen(text, filename, voice = 'ar-XA-Wavenet-B') {
    const request = {
        input: { ssml: `<speak>${text}</speak>` },
        voice: { languageCode: voice.substring(0, 5), name: voice },
        audioConfig: { audioEncoding: 'MP3' },
    };
    try {
        const [response] = await client.synthesizeSpeech(request);
        fs.writeFileSync(path.join(__dirname, `../public/audio/test_${filename}.mp3`), response.audioContent);
        console.log(`Generated test_${filename}.mp3 (${voice})`);
    } catch (e) {
        console.error(e);
    }
}

async function main() {
    // Try Egyptian voice for G (using Jeem)
    // ar-EG-Wavenet-A is usually female.
    await gen('جَهْوَة', 'egyptian_jahwa', 'ar-EG-Standard-A'); 
    
    // Also try Just English G in Arabic context?
    await gen('Gahwa', 'latin_gahwa_xa', 'ar-XA-Wavenet-B');
}

main();
