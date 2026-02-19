
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
    // Test 1: X-SAMPA "zu:Z" (Should be Zuj)
    await generate(
        'public/audio/test_xsampa_zuj.mp3',
        `<speak><phoneme alphabet="x-sampa" ph="zu:Z">زُوج</phoneme></speak>`
    );

    // Test 2: IPA "zuːʒ" (Should be Zuj)
    await generate(
        'public/audio/test_ipa_zuj.mp3',
        `<speak><phoneme alphabet="ipa" ph="zuːʒ">زُوج</phoneme></speak>`
    );

    // Test 3: Control "ba:ba" via X-SAMPA (Should be Baba, ignoring text "Zuj")
    await generate(
        'public/audio/test_control_baba.mp3',
        `<speak><phoneme alphabet="x-sampa" ph="ba:ba">زُوج</phoneme></speak>`
    );
}

run();
