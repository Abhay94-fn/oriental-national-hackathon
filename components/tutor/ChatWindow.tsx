"use client";

import { useState, useRef, useEffect } from 'react';
import { Message } from '../../types';
import { ChatMessage } from './ChatMessage';
import { VoiceInput } from './VoiceInput';
import { SubjectSelector } from './SubjectSelector';
import { Send, Hash, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { pickNarratorVoice, resolveNarrationLang } from '../../lib/speech';

export function ChatWindow() {
  const { profile, voice, setVoiceState } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Namaste! I'm Abhay Parth, your personal AI Tutor for ${profile?.exam || 'competitive exams'}. Which subject or concept are you struggling with today?` }
  ]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('General');
  const [language, setLanguage] = useState('English');
  const [isTyping, setIsTyping] = useState(false);
  const [mentorMode, setMentorMode] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastSpokenRef = useRef('');
  const lastSpokenAtRef = useRef(0);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    fetch('/api/tutor/history')
      .then(res => res.json())
      .then(data => {
        if (data.sessionId && data.messages.length > 0) {
          setSessionId(data.sessionId);
          setMessages(data.messages);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedAutoSpeak = localStorage.getItem('abhay_tutor_auto_speak');
    const storedNarrator = localStorage.getItem('abhay_tutor_narrator');
    if (storedAutoSpeak !== null) {
      setVoiceState({ autoSpeak: storedAutoSpeak === 'true' });
    }
    if (storedNarrator === 'female' || storedNarrator === 'male' || storedNarrator === 'neutral') {
      setVoiceState({ narrator: storedNarrator });
    }
  }, [setVoiceState]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakResponse = (text: string) => {
    if (!window.speechSynthesis || !voice.autoSpeak) return;
    
    const cleanText = text
      .replace(/[*#_`~|-]/g, ' ')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleanText) return;
    if (cleanText === lastSpokenRef.current && Date.now() - lastSpokenAtRef.current < 3000) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const selectedVoice = pickNarratorVoice(window.speechSynthesis.getVoices(), language, voice.narrator);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.lang = resolveNarrationLang(language);
    utterance.pitch = 1.05; 
    utterance.rate = 0.95;
    utterance.onend = () => {
      activeUtteranceRef.current = null;
    };
    utterance.onerror = () => {
      activeUtteranceRef.current = null;
    };

    window.speechSynthesis.cancel();
    activeUtteranceRef.current = utterance;
    lastSpokenRef.current = cleanText;
    lastSpokenAtRef.current = Date.now();
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const textToSubmit = overrideInput !== undefined ? overrideInput : input;
    if (!textToSubmit.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', content: textToSubmit };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          subject,
          language,
          exam: profile?.exam || 'General Competitive Exams',
          mode: mentorMode ? 'mentor' : 'direct',
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.body) throw new Error("No response body");
      
      const returnedSessionId = res.headers.get('X-Session-Id');
      if (returnedSessionId && !sessionId) {
          setSessionId(returnedSessionId);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      let done = false;
      let assistantMsgContent = '';
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          assistantMsgContent += chunk;
          
          setMessages(prev => {
             const newMsgs = [...prev];
             newMsgs[newMsgs.length - 1].content = assistantMsgContent;
             return newMsgs;
          });
        }
      }
      
      // Auto-TTS after stream is complete
      speakResponse(assistantMsgContent);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please try asking again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = (text: string) => {
      setInput(text);
  };

  const handleVoiceEnd = (finalText: string) => {
      handleSubmit(undefined, finalText);
  };

  const quickChips = {
     'Physics': ['Explain Faraday Law', 'Kinematics formulas', 'Draw FBD'],
     'Chemistry': ['SN1 vs SN2', 'Periodic Trends', 'VSEPR Theory'],
     'General': ['Make a study plan', 'How to reduce silly mistakes', 'Best way to revise']
  };
  const currentChips = (quickChips as any)[subject] || quickChips['General'];

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-3xl overflow-hidden shadow-2xl relative">
       {/* Header */}
       <div className="bg-surface border-b border-border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 shrink-0">
          <SubjectSelector subject={subject} setSubject={setSubject} />
          
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setMentorMode(!mentorMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${mentorMode ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/20' : 'bg-background border-border text-muted hover:text-foreground'}`}
                title={mentorMode ? "Mentor Mode: AI gives hints and acts as a coach" : "Direct Mode: AI gives direct answers"}
             >
                {mentorMode ? '🧠 Mentor Mode' : '⚡ Direct Mode'}
             </button>

             <button 
                onClick={() => {
                  const next = !voice.autoSpeak;
                  setVoiceState({ autoSpeak: next });
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('abhay_tutor_auto_speak', String(next));
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${voice.autoSpeak ? 'bg-primary/20 border-primary text-primary' : 'bg-background border-border text-muted hover:text-foreground'}`}
              >
                {voice.autoSpeak ? '🗣 Auto' : '🗣 Off'}
              </button>

              <select 
                 value={voice.narrator}
                 onChange={e => {
                   const narrator = e.target.value as 'female' | 'male' | 'neutral';
                   setVoiceState({ narrator });
                   if (typeof window !== 'undefined') {
                     localStorage.setItem('abhay_tutor_narrator', narrator);
                   }
                 }}
                 className="bg-background border border-border text-foreground text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary cursor-pointer appearance-none transition-colors"
                 title="Narrator Voice"
              >
                 <option value="female" className="bg-surface text-foreground">Girl Voice</option>
                 <option value="male" className="bg-surface text-foreground">Boy Voice</option>
                 <option value="neutral" className="bg-surface text-foreground">Neutral Voice</option>
              </select>

              <select 
                 value={language}
                 onChange={e => setLanguage(e.target.value)}
                 className="bg-background border border-border text-foreground text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary cursor-pointer appearance-none transition-colors"
                 title="Select Tutor Language"
              >
                 {['English', 'Hindi', 'Hinglish', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati'].map(l => (
                   <option key={l} value={l} className="bg-surface text-foreground">{l}</option>
                 ))}
              </select>
          </div>
       </div>

       {/* Chat Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 relative z-10 min-h-0">
             {messages.map((m, i) => (
             <ChatMessage key={i} message={m} language={language} narrator={voice.narrator} />
          ))}
          {isTyping && messages[messages.length - 1].role === 'user' && (
             <div className="flex items-center gap-3 text-teal-400 p-4 bg-surface/50 border border-border rounded-2xl w-fit">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-semibold animate-pulse">Thinking...</span>
             </div>
          )}
          <div ref={bottomRef} className="h-4 w-full" />
       </div>

       {/* Quick Chips & Input */}
       <div className="p-4 bg-surface border-t border-border z-10 shrink-0">
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-3 mb-1">
             {currentChips.map((chip: string) => (
                <button
                  key={chip}
                  onClick={() => setInput(chip)}
                  className="px-3 py-1.5 bg-card border border-border rounded-full text-xs text-muted hover:text-foreground hover:border-primary transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0"
                >
                  <Hash className="w-3 h-3" /> {chip}
                </button>
             ))}
          </div>

          <form onSubmit={e => handleSubmit(e)} className="flex gap-3 items-end">
             <VoiceInput language={language} onTranscript={handleVoiceInput} onVoiceEnd={handleVoiceEnd} />
             <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                     }
                  }}
                  placeholder="Ask any concept, formula, or exam doubt..."
                  className="w-full bg-background border border-border rounded-2xl pl-4 pr-12 py-3.5 text-foreground placeholder:text-muted focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 resize-none min-h-[56px] max-h-32 custom-scrollbar transition-all text-sm leading-relaxed"
                  rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 4) : 1}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 bottom-2 p-2 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl text-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
             </div>
          </form>
       </div>
    </div>
  );
}
