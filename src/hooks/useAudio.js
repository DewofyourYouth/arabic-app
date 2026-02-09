import { useCallback } from 'react';

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

  const playPronunciation = useCallback((text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-JO'; // Jordanian Arabic if available, else standard Arabic
      utterance.rate = 0.8; // Slightly slower for learning
      
      // Fallback for voices
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(voice => voice.lang.includes('ar'));
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Text-to-Speech not supported in this browser.");
    }
  }, []);

  return {
    playFlip,
    playCorrect,
    playIncorrect,
    playPronunciation
  };
};
