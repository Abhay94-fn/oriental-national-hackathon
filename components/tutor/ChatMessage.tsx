import { Bot, User, Volume2 } from 'lucide-react';
import { Message } from '../../types';
import { NarratorPreference, pickNarratorVoice, resolveNarrationLang } from '../../lib/speech';

export function ChatMessage({
  message,
  language,
  narrator
}: {
  message: Message;
  language: string;
  narrator: NarratorPreference;
}) {
  const isUser = message.role === 'user';

  const speak = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message.content);
    const selectedVoice = pickNarratorVoice(window.speechSynthesis.getVoices(), language, narrator);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = resolveNarrationLang(language);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex gap-4 p-4 ${isUser ? 'bg-transparent flex-row-reverse' : 'bg-surface/50 border border-border rounded-2xl'}`}>
       <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-gradient-to-tr from-violet-500 to-fuchsia-500' : 'bg-teal-500/20 text-teal-400'}`}>
          {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5" />}
       </div>
       <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
          <div className="prose max-w-none text-[15px] leading-relaxed">
             {/* Using simple formatting for raw text to markdown-ish display. 
                 A real app might use react-markdown, but we'll simulate basic parsing for the prototype. */}
             {message.content.split('\n').map((line: string, i: number) => {
                 if (line.startsWith('💡')) {
                    return <p key={i} className="text-primary font-bold bg-primary/10 p-2 rounded-md inline-block mt-2">{line}</p>;
                 }
                 if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4 list-disc text-foreground">{line.substring(2)}</li>;
                  }
                  if (line.match(/^\d+\./)) {
                    return <li key={i} className="ml-4 list-decimal text-foreground font-semibold">{line}</li>;
                  }
                 return <p key={i} className="text-foreground">{line}</p>;
              })}
           </div>
          {!isUser && (
             <button 
               onClick={speak}
               className="mt-3 flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
             >
               <Volume2 className="w-3.5 h-3.5" />
               Read Aloud
             </button>
          )}
       </div>
    </div>
  );
}
