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
        await writeFile(path.join(__dirname, '../public/audio/', filename), response.audioContent, 'binary');
        console.log(`Generated: ${filename}`);
    } catch (error) {
        console.error(`Failed: ${filename}`, error);
    }
}

async function run() {
    // 1. Kifak
    await generate(
        'test_translit_kifak.mp3',
        `<speak><phoneme alphabet="x-sampa" ph="ki:fak">كِيفَك؟</phoneme></speak>`
    );

    // 2. Kifik
    await generate(
        'test_translit_kifik.mp3',
        `<speak><phoneme alphabet="x-sampa" ph="ki:fik">كِيفِك؟</phoneme></speak>`
    );

    // 3. Daiman
    await generate(
        'test_translit_daiman.mp3',
        `<speak><phoneme alphabet="x-sampa" ph="da:jman">دائماً</phoneme></speak>`
    );
    
    // 4. Afwan
    await generate(
        'test_translit_afwan.mp3',
        `<speak><phoneme alphabet="x-sampa" ph="?afwan">عفواً</phoneme></speak>`
    );
    
    // 5. Ba'ul (bagu:l) -> g issue test
    await generate(
        'test_translit_bagul.mp3',
        `<speak><phoneme alphabet="x-sampa" ph="bagu:l">بقول</phoneme></speak>`
    );
}

run();
