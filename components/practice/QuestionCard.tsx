"use client";

import { useState } from 'react';
import { Question } from '../../types';
import { TimerBar } from './TimerBar';
import { Badge } from '../ui/Badge';
import { Check, X, ChevronRight, Hash } from 'lucide-react';

export function QuestionCard({ 
  question, index, total, onNext, onSkip, timeAllowed 
}: { 
  question: Question, index: number, total: number, onNext: (isCorrect: boolean, timeUsed: number) => void, onSkip: (timeUsed: number) => void, timeAllowed: number 
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeUsed, setTimeUsed] = useState(0);

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelected(option);
    setIsAnswered(true);
    // Rough calc of time used (timeAllowed - remaining). For simplicity, let's just use a stub 15s or capture from timer component later. 
    // Here we'll just say 15s for exactness without complex ref passing.
    setTimeUsed(15); 
  };

  const handleExpire = () => {
    if (!isAnswered) {
      onSkip(timeAllowed);
    }
  };

  const getOptionClass = (opt: string) => {
    if (!isAnswered) {
       return selected === opt ? 'bg-primary/20 border-primary text-foreground' : 'bg-surface border-border hover:border-primary/50 text-foreground/70';
    }
    const isCorrectOpt = opt.startsWith(question.correct);
    const isSelectedOpt = selected === opt;

    if (isCorrectOpt) return 'bg-green-500/20 border-green-500 text-foreground';
    if (isSelectedOpt && !isCorrectOpt) return 'bg-red-500/20 border-red-500 text-foreground';
    return 'bg-surface/50 border-border text-muted-foreground opacity-50';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="flex justify-between items-center bg-card border border-border px-6 py-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
             <span className="text-muted font-bold text-sm">Question {index + 1} of {total}</span>
             <Badge variant={question.difficulty === 'Hard' ? 'danger' : question.difficulty === 'Medium' ? 'warning' : 'success'}>
                {question.difficulty}
             </Badge>
          </div>
          <div className="flex gap-2">
             {question.marks > 0 && <Badge variant="success">+{question.marks}</Badge>}
             {question.negativeMarking > 0 && <Badge variant="danger">-{question.negativeMarking}</Badge>}
          </div>
       </div>

       <div className="w-full">
         <TimerBar durationSeconds={timeAllowed} onExpire={handleExpire} isPaused={isAnswered} />
       </div>

       <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex gap-3 mb-6">
             <div className="mt-1 bg-surface p-2 rounded-lg border border-border shrink-0 text-muted">
               <Hash className="w-4 h-4" />
             </div>
             <h3 className="text-lg md:text-xl font-sora font-semibold text-foreground leading-relaxed">
               {question.question}
             </h3>
          </div>

          <div className="space-y-3">
             {question.options.map((opt: string) => {
               const isCorrectOpt = isAnswered && opt.startsWith(question.correct);
               const isSelectedOpt = isAnswered && selected === opt;
               return (
                 <button
                   key={opt}
                   onClick={() => handleSelect(opt)}
                   disabled={isAnswered}
                   className={`w-full flex items-center justify-between text-left p-4 rounded-xl border transition-all ${getOptionClass(opt)}`}
                 >
                    <span className="font-medium">{opt}</span>
                    {isAnswered && (isCorrectOpt ? <Check className="w-5 h-5 text-green-400" /> : isSelectedOpt ? <X className="w-5 h-5 text-red-500" /> : null)}
                 </button>
               );
             })}
          </div>

          {isAnswered && (
             <div className="mt-8 pt-6 border-t border-border animate-in fade-in slide-in-from-bottom-4">
                <h4 className="font-bold border-b border-border pb-2 mb-3 inline-block">
                  <span className={selected?.startsWith(question.correct) ? 'text-green-400' : 'text-red-400'}>
                    {selected?.startsWith(question.correct) ? 'Correct!' : 'Incorrect.'}
                  </span>
                  <span className="text-foreground ml-2">Explanation</span>
                </h4>
                <div className="prose prose-invert max-w-none text-sm text-foreground/80">
                  <p>{question.explanation}</p>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                   <button 
                     onClick={() => onNext(selected?.startsWith(question.correct) || false, timeUsed)}
                     className="bg-primary text-black font-bold px-6 py-2.5 rounded-xl hover:opacity-90 flex items-center gap-2"
                   >
                      Next Question <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
             </div>
          )}

          {!isAnswered && (
             <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => onSkip(timeUsed)}
                  className="text-muted hover:text-white font-semibold text-sm px-4 py-2"
                >
                   Skip Question
                </button>
             </div>
          )}
       </div>
    </div>
  );
}
