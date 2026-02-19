
import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';
import util from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: path.join(__dirname, '../google-cloud-key.json')
});

async function generate(filename, ssml) {
    const request = {
        input: { ssml: ssml },
        voice: { languageCode: 'ar-XA', name: 'ar-XA-Wavenet-B' },
        audioConfig: { audioEncoding: 'MP3' },
    };

    try {
        const [response] = await client.synthesizeSpeech(request);
        const writeFile = util.promisify(fs.writeFile);
        await writeFile(filename, response.audioContent, 'binary');
        console.log(`Generated: ${filename}`);
    } catch (error) {
        console.error(`Failed: ${filename}`, error);
    }
}

async function run() {
    // Strategy A: "Respeaking" - Spell it like it sounds in Arabic
    // 1. "Joz" spelled with Jeem (جُوز) instead of Zay (زُوج)
    await generate(
        'public/audio/debug_respeak_joz.mp3',
        `<speak>جُوز</speak>`
    );

    // 2. "Zuj" explicit vocalization (زُوجْ) - trying to force end stop
    await generate(
        'public/audio/debug_respeak_zuj_stop.mp3',
        `<speak>زُوجْ</speak>`
    );

    // Strategy B: Latin text inside phoneme tag
    // Sometimes TTS ignores phonemes if the text content is in a different script than the voice language
    // But maybe if we put "baba" inside, it will use the phonemes?
    await generate(
        'public/audio/debug_ssml_latin_content.mp3',
        `<speak><phoneme alphabet="ipa" ph="baːba">baba</phoneme></speak>`
    );
    
    // Strategy C: Empty content?
     await generate(
        'public/audio/debug_ssml_empty_content.mp3',
        `<speak><phoneme alphabet="ipa" ph="baːba"> </phoneme></speak>`
    );
}

run();
