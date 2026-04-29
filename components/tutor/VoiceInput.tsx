"use client";

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

export function VoiceInput({ language, onTranscript, onVoiceEnd }: { language: string, onTranscript: (text: string) => void, onVoiceEnd?: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const latestTranscript = useRef("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const _recognition = new SpeechRecognition();
        _recognition.continuous = false;
        _recognition.interimResults = true;
        setRecognition(_recognition);
      }
    }
  }, []);

  useEffect(() => {
    if (recognition) {
        const langMap: Record<string, string> = {
           'Hindi': 'hi-IN', 'Tamil': 'ta-IN', 'Telugu': 'te-IN', 
           'Bengali': 'bn-IN', 'Marathi': 'mr-IN', 'Gujarati': 'gu-IN'
        };
        recognition.lang = langMap[language] || 'en-IN';
        
        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((r: any) => r[0].transcript)
                .join('');
            latestTranscript.current = transcript;
            onTranscript(transcript);
        };
        recognition.onend = () => {
            setIsListening(false);
            if (onVoiceEnd && latestTranscript.current.trim().length > 0) {
                onVoiceEnd(latestTranscript.current);
            }
            latestTranscript.current = ""; // Reset after fire
        };
        recognition.onerror = () => {
             setIsListening(false);
        };
    }
  }, [recognition, language, onTranscript, onVoiceEnd]);

  const toggleListen = () => {
    if (!recognition) {
       alert('Speech recognition is not supported in your browser. Please use Chrome.');
       return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      latestTranscript.current = "";
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListen}
      className={`p-3 rounded-full transition-all shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-surface border border-border text-muted hover:text-foreground hover:bg-card-2'}`}
      title={isListening ? 'Stop listening' : 'Use voice input'}
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
}
