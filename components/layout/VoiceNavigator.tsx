"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Loader2, Volume2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { pickNarratorVoice, resolveNarrationLang } from '../../lib/speech';

export function VoiceNavigator() {
  const { voice, setVoiceState } = useStore();
  const [recognition, setRecognition] = useState<any>(null);
  const router = useRouter();

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const _recognition = new SpeechRecognition();
        _recognition.continuous = false;
        _recognition.interimResults = false;
        _recognition.lang = 'en-US';
        setRecognition(_recognition);
      }
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    
    // Interrupt any ongoing speech
    window.speechSynthesis.cancel();
    
    setVoiceState({ isSpeaking: true, feedback: text });
    
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = pickNarratorVoice(window.speechSynthesis.getVoices(), 'English', voice.narrator);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = resolveNarrationLang('English');
    utterance.rate = 1.05; // Slightly faster but natural
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      setVoiceState({ isSpeaking: false, feedback: '' });
    };
    
    utterance.onerror = () => {
      setVoiceState({ isSpeaking: false, feedback: '' });
    };

    window.speechSynthesis.speak(utterance);
  }, [setVoiceState, voice.narrator]);

  const handleCommand = async (transcript: string) => {
    const text = transcript.toLowerCase();
    
    // Command Routing Dictionary
    const routes = [
      { keywords: ['dashboard', 'home', 'main'], path: '/', name: 'Dashboard' },
      { keywords: ['recommendations', 'course', 'resource'], path: '/recommendations', name: 'Recommendations' },
      { keywords: ['learning path', 'roadmap'], path: '/learning-path', name: 'Learning Path' },
      { keywords: ['notes', 'summary'], path: '/notes', name: 'Study Notes' },
      { keywords: ['evaluate', 'check my answer'], path: '/evaluate', name: 'Assignment Eval' },
      { keywords: ['plan', 'planner', 'schedule'], path: '/planner', name: 'Study Engine' },
      { keywords: ['practice', 'test', 'question', 'mcq'], path: '/practice', name: 'Adaptive Practice' },
      { keywords: ['tutor', 'chat', 'teach'], path: '/tutor', name: 'AI Tutor' },
      { keywords: ['lab', 'video', 'extract'], path: '/lab', name: 'Content Lab' },
      { keywords: ['retention', 'graph', 'memory', 'review'], path: '/retention', name: 'Retention Vault' }
    ];

    let found = false;
    for (const route of routes) {
      if (route.keywords.some(kw => text.includes(kw))) {
        speak(`Navigating to ${route.name}`);
        router.push(route.path);
        found = true;
        break;
      }
    }

    if (!found) {
      // Treat as AI Question
      setVoiceState({ isThinking: true, feedback: 'AI is thinking...' });
      try {
        const res = await fetch('/api/voice-tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: text })
        });
        const data = await res.json();
        
        if (data.answer) {
           speak(data.answer);
        } else {
           speak("Sorry, I couldn't process that.");
        }
      } catch (e) {
        speak("I encountered a network error.");
      } finally {
        setVoiceState({ isThinking: false });
      }
    }
  };

  useEffect(() => {
    if (recognition) {
        recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            setVoiceState({ transcript });
            handleCommand(transcript);
        };
        recognition.onend = () => {
            setVoiceState({ isListening: false });
        };
        recognition.onerror = () => {
            setVoiceState({ isListening: false, feedback: "Microphone error" });
            setTimeout(() => setVoiceState({ feedback: '' }), 3000);
        };
    }
  }, [recognition, router, speak, setVoiceState]);

  const toggleListen = () => {
    if (!recognition) {
       alert('Voice navigation is not supported in this browser. Please use Chrome.');
       return;
    }
    
    // Interrupt AI if it's currently speaking
    if (voice.isSpeaking) {
      window.speechSynthesis.cancel();
      setVoiceState({ isSpeaking: false, feedback: '' });
    }

    if (voice.isListening) {
      recognition.stop();
      setVoiceState({ isListening: false, feedback: '' });
    } else {
      recognition.start();
      setVoiceState({ isListening: true, feedback: 'Listening for your command...' });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      
      {/* Feedback Banner */}
      {voice.feedback && (
        <div className="bg-background/90 backdrop-blur-xl border border-border text-foreground px-5 py-3 rounded-2xl text-[14px] font-medium shadow-2xl animate-in slide-in-from-bottom-4 fade-in pointer-events-auto max-w-sm">
           {voice.isSpeaking ? (
             <div className="flex items-center gap-3">
               <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
               </span>
               <span className="text-primary font-bold tracking-wide uppercase text-xs shrink-0">AI is speaking</span>
             </div>
           ) : (
             <div className="leading-relaxed">{voice.feedback}</div>
           )}
           {voice.isSpeaking && (
              <div className="mt-2 text-muted-foreground text-[13px] leading-relaxed line-clamp-3">
                {voice.feedback}
              </div>
           )}
        </div>
      )}
      
      {/* Microphone Button */}
      <button
        onClick={toggleListen}
        className={`pointer-events-auto w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          voice.isListening 
            ? 'bg-red-500 text-white animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.4)] scale-110' 
            : voice.isSpeaking
            ? 'bg-primary text-primary-foreground shadow-[0_0_30px_rgba(79,70,229,0.4)] scale-105'
            : 'bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground hover:shadow-xl'
        }`}
        title="AI Voice Tutor"
      >
        {voice.isThinking ? (
           <Loader2 className="w-6 h-6 animate-spin text-primary" />
        ) : voice.isSpeaking ? (
           <Volume2 className="w-6 h-6 animate-pulse" />
        ) : (
           <Mic className="w-7 h-7" />
        )}
      </button>
    </div>
  );
}
