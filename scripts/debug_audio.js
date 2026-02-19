
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
    // 1. IPA Standard (Zuj)
    await generate(
        'public/audio/debug_ipa_zuj.mp3',
        `<speak><phoneme alphabet="ipa" ph="zuːdʒ">زُوج</phoneme></speak>`
    );

    // 2. IPA Variant (Zoj - might fail if 'o' not supported)
    await generate(
        'public/audio/debug_ipa_zoj.mp3',
        `<speak><phoneme alphabet="ipa" ph="zoːʒ">زُوج</phoneme></speak>`
    );

    // 3. X-SAMPA Strict (Zuj)
    await generate(
        'public/audio/debug_xsampa_zuj.mp3',
        `<speak><phoneme alphabet="x-sampa" ph="zu:dZ">زُوج</phoneme></speak>`
    );

    // 4. X-SAMPA Variant (Zoz - previously failed?)
    await generate(
        'public/audio/debug_xsampa_zoz.mp3',
        `<speak><phoneme alphabet="x-sampa" ph="Zoz">زُوج</phoneme></speak>`
    );

     // 5. Control IPA "Baba" (Standard IPA)
    await generate(
        'public/audio/debug_control_baba_ipa.mp3',
        `<speak><phoneme alphabet="ipa" ph="baːba">زُوج</phoneme></speak>`
    );
}

run();
