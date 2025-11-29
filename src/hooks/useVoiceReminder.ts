import { useCallback, useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

interface VoiceReminderOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useVoiceReminder = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const user = useStore((state) => state.user);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback((text: string, options: VoiceReminderOptions = {}) => {
    if (!isSupported) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;
    
    // Try to find a good English voice
    const englishVoice = voices.find(
      voice => voice.lang.startsWith('en') && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [isSupported, voices]);

  const speakWithVoice = useCallback((text: string, voiceId: string, options: VoiceReminderOptions = {}) => {
    if (!isSupported) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;
    
    // Find specific voice
    const selectedVoice = voices.find(v => v.name === voiceId);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [isSupported, voices]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.resume();
    }
  }, [isSupported]);

  const speakDoseReminder = useCallback((medicineName: string, dosage: string, time: string) => {
    const message = `It's ${time}. Time to take your ${medicineName}, ${dosage}.`;
    speak(message);
  }, [speak]);

  const speakConfirmation = useCallback((action: string, medicineName: string) => {
    const messages: Record<string, string> = {
      taken: `Great! You've taken your ${medicineName}. Keep up the good work!`,
      skipped: `${medicineName} has been marked as skipped.`,
      snoozed: `Reminder for ${medicineName} will repeat in 10 minutes.`
    };
    speak(messages[action] || `${action} ${medicineName}`);
  }, [speak]);

  const speakPrescription = useCallback((medicines: { name: string; strength?: string; frequency?: string }[], opts: { variant?: 'simple' | 'detailed' | 'step' } = {}) => {
    if (!isSupported || medicines.length === 0) return;
    const variant = opts.variant || 'simple';
    if (variant === 'simple') {
      const lines = medicines.map(m => `${m.name}${m.strength ? ` ${m.strength}` : ''}`);
      speak(`Prescription: ${lines.join(', ')}.`);
      return;
    }

    if (variant === 'detailed') {
      medicines.forEach((m, i) => {
        const text = `Medicine ${i + 1}: ${m.name}${m.strength ? `, strength ${m.strength}` : ''}${m.frequency ? `, take ${m.frequency}` : ''}.`;
        speak(text, { rate: 0.9, pitch: 1 });
      });
      return;
    }

    // step-by-step
    medicines.forEach((m, i) => {
      const text = `Step ${i + 1}. Take ${m.name}${m.strength ? ` ${m.strength}` : ''}${m.frequency ? `, frequency: ${m.frequency}` : ''}. Repeat as prescribed.`;
      speak(text, { rate: 0.85, pitch: 1 });
    });
  }, [isSupported, speak]);

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    speak,
    speakWithVoice,
    speakDoseReminder,
    speakConfirmation,
    speakPrescription,
    pause,
    resume,
    cancel,
    isSpeaking,
    isSupported,
    voices
  };
};
