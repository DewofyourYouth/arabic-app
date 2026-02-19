
import fs from 'fs';
import path from 'path';
import textToSpeech from '@google-cloud/text-to-speech';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Google Cloud TTS Client
// Assumes GOOGLE_APPLICATION_CREDENTIALS is set or key file is in default location
const client = new textToSpeech.TextToSpeechClient({
  keyFilename: path.join(__dirname, '../google-cloud-key.json') 
});

const DATA_DIR = path.join(__dirname, '../src/data/curriculum');
const AUDIO_OUTPUT_DIR = path.join(__dirname, '../public/audio');

// ensure output dir exists
if (!fs.existsSync(AUDIO_OUTPUT_DIR)) {
  fs.mkdirSync(AUDIO_OUTPUT_DIR, { recursive: true });
}

async function generateAudio(text, ipa, gender, outputPath) {
  // Construct SSML
  // If IPA is provided, use it. Otherwise just use the text.
  let ssml = `<speak>${text}</speak>`;
  if (ipa) {
    if (ipa.startsWith('xsampa:')) {
      const ph = ipa.replace('xsampa:', '');
      ssml = `<speak><phoneme alphabet="x-sampa" ph="${ph}">${text}</phoneme></speak>`;
    } else {
      ssml = `<speak><phoneme alphabet="ipa" ph="${ipa}">${text}</phoneme></speak>`;
    }
  }

  // Select voice based on gender
  // 'ar-XA-Wavenet-B' is male
  // 'ar-XA-Wavenet-A' is female
  const voiceName = gender === 'female' ? 'ar-XA-Wavenet-A' : 'ar-XA-Wavenet-B';

  const request = {
    input: { ssml: ssml },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode: 'ar-XA', name: voiceName }, 
    audioConfig: { audioEncoding: 'MP3' },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outputPath, response.audioContent, 'binary');
    console.log(`Generated: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Failed to generate audio for "${text}":`, error);
    return false;
  }
}

import util from 'util';

async function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  const content = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    console.error(`Error parsing JSON in ${filePath}`, e);
    return;
  }

  if (!Array.isArray(data)) {
    console.warn(`Skipping ${filePath} - not an array.`);
    return;
  }

  let modified = false;

  for (const item of data) {
    // We only care if there is arabic text
    if (!item.arabic) continue;

    const topic = item.topic || 'general';
    const filename = `${item.id}.mp3`;
    const topicDir = path.join(AUDIO_OUTPUT_DIR, topic);
    
    if (!fs.existsSync(topicDir)) {
      fs.mkdirSync(topicDir, { recursive: true });
    }

    const audioPath = `/audio/${topic}/${filename}`;
    const fullOutputPath = path.join(topicDir, filename);

    // Generation Logic for Dialects
    const variations = [
      { suffix: '', ipaField: 'ipa', audioField: 'audio' },
      { suffix: '_bedouin', ipaField: 'ipa_bedouin', audioField: 'audio_bedouin' }
    ];

    for (const variation of variations) {
        // Skip Bedouin if no specific IPA is provided (it will fall back to default in app logic if we want, or we can just not generate it)
        // However, if the user explicitly provided ipa_bedouin, we generate.
        // If not, we might want to check if we should generate a fallback? 
        // For now, only generate if IPA exists or if it's the default variation.
        
        // 1. Determine IPA to use
        let ipaToUse = item[variation.ipaField];
        
        // If it's the default variation and no IPA, we might still want to generate from text (though it will be MSA-ish)
        // But user said MSA is bad. So maybe we ONLY generate if IPA is present?
        // User said: "It's basically an MSA prononciation - that is why I wanted to make IPA first"
        // So we should probably SKIP generation if no IPA is present to avoid bad audio.
        // BUT, for now let's stick to: if IPA is present, use it. If not, rely on text (and maybe log a warning).
        
        if (!ipaToUse && variation.suffix !== '') continue; // Skip bedouin if no specific IPA

        const filename = `${item.id}${variation.suffix}.mp3`;
        const audioPath = `/audio/${topic}/${filename}`;
        const fullOutputPath = path.join(topicDir, filename);
        
        const needsGeneration = !fs.existsSync(fullOutputPath);

        if (needsGeneration) {
            console.log(`Generating audio for ${item.id}${variation.suffix} (${item.arabic})...`);
            // If ipaToUse is undefined, it passes undefined to generateAudio, which falls back to text (MSA)
            // Ideally we only want to generate if we HAVE IPA, but for backward compat we can leave it.
            // If user populates IPA, it will use it.
            const success = await generateAudio(item.arabic, ipaToUse, item.gender, fullOutputPath); 
            if (success) {
                item[variation.audioField] = audioPath;
                modified = true;
            }
        }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${filePath}`);
  }
}

async function main() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    await processFile(path.join(DATA_DIR, file));
  }
  console.log('Done!');
}

main().catch(console.error);
