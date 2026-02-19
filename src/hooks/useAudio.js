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

    // 1. Replace ta marbouta (ة) with regular ha (ه) for pausal form "eh" sound
    processedText = processedText.replace(/ة/g, 'ه');

    // 2. Dialect-specific replacements for Qaf (ق)
    if (dialect === 'urban') {
      processedText = processedText.replace(/ق/g, 'ء');
    } else if (dialect === 'rural' || dialect === 'bedouin') {
      processedText = processedText.replace(/ق/g, 'g');
    }

    console.log(`[TTS] Input: "${text}", Dialect: ${dialect}, Spoken: "${processedText}"`); // Debug log

    return processedText;
  };

  const playPronunciation = useCallback((text, audioData) => {
    // 1. Try playing audio file if available
    let audioFile = null;

    // Handle string (legacy/simple) vs object (future proofing if passed entire card)
    // Actually, callers pass `cardData.audio`.
    // But we need to know about `audio_bedouin`.
    // So callers should probably pass the WHOLE card or both paths.
    // Let's assume callers pass the `cardData` object or we change the signature.
    // To minimize refactoring, let's keep `text` as first arg, and 2nd arg `audioData` can be the card object OR the audio path string.
    
    if (typeof audioData === 'object' && audioData !== null) {
        const dialect = settings?.dialect || 'urban'; // default to urban/standard
        if (dialect === 'bedouin' || dialect === 'rural') {
            audioFile = audioData.audio_bedouin || audioData.audio; // Fallback to standard if bedouin missing
        } else {
            audioFile = audioData.audio;
        }
    } else if (typeof audioData === 'string') {
        audioFile = audioData;
    }

    if (audioFile) {
      console.log(`[useAudio] Attempting to play file: ${audioFile} with cache buster`);
      const audio = new Audio(`${audioFile}?v=9`);
      audio.onerror = (e) => {
        console.warn(`[useAudio] Error loading audio file: ${audioFile}`, e);
        // Fallback to TTS handled by caller? No, we need to handle it here or let it fail
        // If we want fallback on error, we need to move TTS logic here or chain it.
        // For now, let's just log it.
      };
      audio.oncanplaythrough = () => console.log(`[useAudio] Audio file loaded successfully: ${audioFile}`);
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
          playPromise.catch(error => {
              console.warn(`[useAudio] Playback failed for ${audioFile}:`, error);
          });
      }
      return;
    } else {
        console.log(`[useAudio] No audio file found for text: "${text}". audioData was:`, audioData);
    }

    // 2. Fallback to TTS
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
