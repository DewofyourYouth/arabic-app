import { useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';

// Simple beep synth for immediate feedback without external assets
const playBeep = (frequency, duration, type = 'sine') => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency; // value in hertz
  
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

export const useAudio = () => {
  const { settings } = useSettings();
  
  const playFlip = useCallback(() => {
    playBeep(300, 0.1, 'triangle'); // fast low-mid tone
  }, []);

  const playCorrect = useCallback(() => {
    playBeep(600, 0.1, 'sine');
    setTimeout(() => playBeep(800, 0.2, 'sine'), 100); // High-low major third
  }, []);

  const playIncorrect = useCallback(() => {
    playBeep(200, 0.3, 'sawtooth'); // Low buzz
  }, []);

  // Preprocess Arabic text for better TTS pronunciation
  const preprocessArabicForTTS = (text, dialect) => {
    let processedText = text;

    // 0. Manual Overrides for specific words in the text
    const PHONETIC_OVERRIDES = {
      'قهوة': {
        urban: 'أَهْوِة', 
        bedouin: `${settings?.gChar || 'گ'}َهْوِة` // Changed from FatHa to Kasra on Waw (وِ) to avoid "oo" sound
      },
      // Add exact match with diacritics just in case
      'قَهْوَة': {
        urban: 'أَهْوِة', 
        bedouin: `${settings?.gChar || 'گ'}َهْوِة`
      }
    };

    // Helper to remove diacritics for matching
    const removeDiacritics = (str) => str.replace(/[\u064B-\u065F]/g, '');

    // Apply overrides
    Object.keys(PHONETIC_OVERRIDES).forEach(key => {
        if (text.includes(key) || removeDiacritics(text).includes(removeDiacritics(key))) {
             const replacement = PHONETIC_OVERRIDES[key][dialect] || PHONETIC_OVERRIDES[key].bedouin;
             if (replacement) {
                 // Try exact match first
                 if (text.includes(key)) {
                     processedText = processedText.replace(new RegExp(key, 'g'), replacement);
                 } else {
                     // Fallback for diacritic differences
                     const base = removeDiacritics(key);
                     // Create a regex that allows for optional diacritics between letters
                     // This is hard, so for now we stick to the specific fallback we know: "Coffee"
                     if (key.includes('قهوة')) {
                         processedText = processedText.replace(/ق[\u064B-\u065F]*ه[\u064B-\u065F]*و[\u064B-\u065F]*ة/g, replacement);
                     }
                 }
             }
        }
    });

    // 1. Replace ta marbouta (ة) with regular ha (ه) for pausal form "eh" sound
    processedText = processedText.replace(/ة/g, 'ه');

    // 2. Dialect-specific replacements for Qaf (ق)
    if (dialect === 'urban') {
      processedText = processedText.replace(/ق/g, 'ء');
    } else if (dialect === 'rural' || dialect === 'bedouin') {
      const gChar = settings?.gChar || 'گ';
      processedText = processedText.replace(/ق/g, gChar);
    }

    console.log(`[TTS] Input: "${text}", Dialect: ${dialect}, Spoken: "${processedText}"`); // Debug log

    return processedText;
  };

  const playPronunciation = useCallback((text) => {
    if ('speechSynthesis' in window) {
      // Use dialect from settings, default to 'bedouin' if not set
      const dialect = settings?.dialect || 'bedouin';
      const processedText = preprocessArabicForTTS(text, dialect);
      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.lang = 'ar-JO'; // Jordanian Arabic if available
      utterance.rate = 0.8; // Slightly slower
      
      // Fallback for voices
      const voices = window.speechSynthesis.getVoices();
      // Try to find a Google-specific Arabic voice which usually handles these better
      // or just the first available Arabic voice
      const arabicVoice = voices.find(voice => voice.lang.includes('ar'));
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Text-to-Speech not supported in this browser.");
    }
  }, [settings]); // Re-create when settings change

  return {
    playFlip,
    playCorrect,
    playIncorrect,
    playPronunciation
  };
};
