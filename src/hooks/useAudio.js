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
      // Urban (Amman, Jerusalem, Damascus): Qaf (ق) -> Hamza (ء)
      // "Qahwa" -> "Ahwa"
      processedText = processedText.replace(/ق/g, 'ء');
    } else if (dialect === 'rural' || dialect === 'bedouin') {
      // Rural/Bedouin: Qaf (ق) -> Gaf (گ) for "hard G" sound
      // "Qahwa" -> "Gahwa"
      // Note: 'گ' (Gaf) is Persian/Urdu but often used to force G sound in TTS
      // Alternatively, try to map to 'g' sound if available, but Gaf is best attempt
      processedText = processedText.replace(/ق/g, 'گ');
    }

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
