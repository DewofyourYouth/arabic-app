import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';
import dotenv from 'dotenv'; // Load env vars

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Polly Client
// Region from env or default to us-east-1
const client = new PollyClient({ 
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const DATA_DIR = path.join(__dirname, '../src/data/curriculum');
const AUDIO_OUTPUT_DIR = path.join(__dirname, '../public/audio');

// ensure output dir exists
if (!fs.existsSync(AUDIO_OUTPUT_DIR)) {
  fs.mkdirSync(AUDIO_OUTPUT_DIR, { recursive: true });
}

async function generateAudio(text, ipa, gender, outputPath) {
  // Construct SSML for Polly
  let ssml;
  
  if (ipa) {
    if (ipa.startsWith('xsampa:')) {
      let ph = ipa.replace('xsampa:', '');
      // Escape double quotes for XML attribute
      ph = ph.replace(/"/g, '&quot;'); 
      ssml = `<speak><phoneme alphabet="x-sampa" ph="${ph}">${text}</phoneme></speak>`;
    } else {
      // Standard IPA
      ssml = `<speak><phoneme alphabet="ipa" ph="${ipa}">${text}</phoneme></speak>`;
    }
  } else {
      // Just text
      ssml = `<speak>${text}</speak>`;
  }

  // Select voice based on gender
  // Zeina (Female, MSA - 'arb')
  // Zayd (Male, Gulf/MSA - 'ar-AE' but speaks MSA with 'arb' tag implies language code check)
  // Wait, Zayd is a Gulf voice ('ar-AE'). Zeina is 'arb' (MSA). 
  // If we want MSA for general, Zeina is best. 
  // Zayd is Neural only. Zeina is Standard or Neural.
  
  // Let's use:
  // Female: Zeina (Engine: neural or standard)
  // Male: Zayd (Engine: neural) - Note: Zayd is ar-AE (Gulf). Does he speak MSA well? Yes, documented.
  
  // Note: To use Zayd for MSA, we might need to wrap in <lang xml:lang="arb"> but usually the voice handles checking.
  // Actually, let's keep it simple.
  
  let voiceId = gender === 'female' ? 'Zeina' : 'Zayd';
  
  // Zeina is Standard only. Zayd is Neural only.
  let engine = voiceId === 'Zeina' ? 'standard' : 'neural';

  // Polly Request
  const params = {
    Text: ssml,
    TextType: "ssml",
    OutputFormat: "mp3",
    VoiceId: voiceId,
    Engine: engine,
    // LanguageCode: "arb" // optional, defaults to voice's default. Zeina is arb. Zayd is ar-AE.
  };

  try {
    const command = new SynthesizeSpeechCommand(params);
    const response = await client.send(command);
    
    // Save the audio stream to file
    // response.AudioStream is a ReadableStream (in Node)
    const writeFile = util.promisify(fs.writeFile);
    
    // Convert stream to buffer
    const stream = response.AudioStream;
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    await writeFile(outputPath, buffer);
    console.log(`Generated: ${outputPath} (Voice: ${voiceId})`);
    return true;
  } catch (error) {
    console.error(`Failed to generate audio for "${text}" (Voice: ${voiceId}):`, error.message);
    return false;
  }
}

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
    const topicDir = path.join(AUDIO_OUTPUT_DIR, topic);
    
    if (!fs.existsSync(topicDir)) {
      fs.mkdirSync(topicDir, { recursive: true });
    }

    const variations = [
      { suffix: '', audioField: 'audio' },
      { suffix: '_bedouin', audioField: 'audio_bedouin' }
    ];

    for (const variation of variations) {
        // Determine text to use
        let textToUse = item.phonetic_arabic || item.arabic;
        let ipaToUse = null;

        // Dialect logic
        if (variation.suffix === '_bedouin') {
            if (item.phonetic_bedouin) textToUse = item.phonetic_bedouin;
            if (item.ipa_bedouin) ipaToUse = item.ipa_bedouin;
            
            // For Bedouin, we might prefer Gulf voices if available?
            // Zayd (Male) is Gulf. Hala (Female) is Gulf.
            // But let's stick to consistent gender mapping for now unless 'dialect' field exists.
        } else {
            if (item.ipa) ipaToUse = item.ipa;
        }

        const filename = `${item.id}${variation.suffix}.mp3`;
        const audioPath = `/audio/${topic}/${filename}`;
        const fullOutputPath = path.join(topicDir, filename);
        
        // Check existence
        // Force regen for Bedouin items to pick up new IPA
        const needsGeneration = !fs.existsSync(fullOutputPath) || variation.suffix === '_bedouin';
        
        if (needsGeneration) {
            console.log(`Generating audio for ${filename} (${textToUse})...`);
            
            // SPECIAL HANDLING FOR BEDOUIN GAF
            // If text contains 'g' or 'گ', we rely on IPA if present.
            // If no IPA, we might still fail if Polly doesn't guess 'g'.
            // But Polly DOES support 'g' via IPA.
            
            const success = await generateAudio(textToUse, ipaToUse, item.gender, fullOutputPath); 
            if (success) {
                const index = data.findIndex(d => d.id === item.id);
                if (index !== -1) {
                    data[index][variation.audioField] = audioPath;
                    modified = true;
                }
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
