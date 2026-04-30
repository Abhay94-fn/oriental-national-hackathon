"use client";

import { useState, useRef, useEffect } from 'react';
import { Message } from '../../types';
import { ChatMessage } from './ChatMessage';
import { VoiceInput } from './VoiceInput';
import { SubjectSelector } from './SubjectSelector';
import { Send, Hash, Loader2, BarChart3, ChevronRight, Brain, Target, Zap } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { pickNarratorVoice, resolveNarrationLang } from '../../lib/speech';
import { motion, AnimatePresence } from 'framer-motion';
import { KnowledgeGraph } from '../retention/KnowledgeGraph';

export function ChatWindow() {
  const { profile, voice, setVoiceState, concepts } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Namaste! I'm Abhay Parth, your personal AI Tutor for your ${profile?.exam || 'competitive exams'} preparation. Which subject or concept should we master today?` }
  ]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('General');
  const [language, setLanguage] = useState('English');
  const [isTyping, setIsTyping] = useState(false);
  const [mentorMode, setMentorMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
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
       <div className="bg-surface border-b border-border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-20 shrink-0">
          <div className="flex items-center gap-4 w-full md:w-auto">
             <SubjectSelector subject={subject} setSubject={setSubject} />
             <button 
                onClick={() => setShowStats(!showStats)}
                className={`p-2 rounded-xl border transition-all ${showStats ? 'bg-primary/20 border-primary text-primary' : 'bg-background border-border text-muted hover:text-foreground'}`}
                title="Knowledge Stats"
             >
                <BarChart3 className="w-4 h-4" />
             </button>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setMentorMode(!mentorMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${mentorMode ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/20' : 'bg-background border-border text-muted hover:text-foreground'}`}
             >
                {mentorMode ? '🧠 Mentor Mode' : '⚡ Direct Mode'}
             </button>

             <button 
                onClick={() => {
                   const next = !voice.autoSpeak;
                   setVoiceState({ autoSpeak: next });
                   if (typeof window !== 'undefined') localStorage.setItem('abhay_tutor_auto_speak', String(next));
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
                    if (typeof window !== 'undefined') localStorage.setItem('abhay_tutor_narrator', narrator);
                 }}
                 className="bg-background border border-border text-foreground text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary cursor-pointer transition-colors"
              >
                 <option value="female">Girl Voice</option>
                 <option value="male">Boy Voice</option>
                 <option value="neutral">Neutral Voice</option>
              </select>

              <select 
                 value={language}
                 onChange={e => setLanguage(e.target.value)}
                 className="bg-background border border-border text-foreground text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary cursor-pointer transition-colors"
              >
                 {['English', 'Hindi', 'Hinglish', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati'].map(l => (
                   <option key={l} value={l}>{l}</option>
                 ))}
              </select>
          </div>
       </div>

       <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col relative z-10 min-w-0">
             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
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

          <div className="p-4 bg-surface border-t border-border">
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

       <AnimatePresence>
          {showStats && (
             <motion.div 
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-80 bg-surface border-l border-border p-6 overflow-y-auto custom-scrollbar shrink-0 hidden lg:flex flex-col gap-6"
             >
                <div className="flex items-center justify-between">
                   <h3 className="font-sora font-bold text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" /> Mastery Map
                   </h3>
                   <button onClick={() => setShowStats(false)} className="text-muted hover:text-white">
                      <ChevronRight className="w-5 h-5" />
                   </button>
                </div>

                <div className="h-48 bg-card border border-border rounded-2xl overflow-hidden">
                   <KnowledgeGraph concepts={concepts} />
                </div>

                <div className="space-y-4">
                   <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Mastery Stats</h4>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-card border border-border p-3 rounded-xl text-center">
                         <Target className="w-4 h-4 text-primary mx-auto mb-1" />
                         <p className="text-lg font-bold text-white">{concepts.length}</p>
                         <p className="text-[10px] text-muted uppercase">Nodes</p>
                      </div>
                      <div className="bg-card border border-border p-3 rounded-xl text-center">
                         <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                         <p className="text-lg font-bold text-white">
                            {concepts.length > 0 ? Math.round(concepts.reduce((acc, c) => acc + c.strength, 0) / concepts.length) : 0}%
                         </p>
                         <p className="text-[10px] text-muted uppercase">Avg Power</p>
                      </div>
                   </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col gap-3">
                   <h4 className="text-xs font-bold text-muted uppercase tracking-widest">Topic Retention</h4>
                   <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                      {concepts.slice(0, 8).map(c => (
                         <div key={c.id} className="flex items-center justify-between p-2 bg-card/50 rounded-lg border border-border/50">
                            <span className="text-xs text-white truncate pr-2">{c.subtopic}</span>
                            <div className="w-12 h-1.5 bg-background rounded-full overflow-hidden">
                               <div className="h-full bg-primary" style={{ width: `${c.strength}%` }} />
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </motion.div>
          )}
       </AnimatePresence>
    </div>
  </div>
  );
}
