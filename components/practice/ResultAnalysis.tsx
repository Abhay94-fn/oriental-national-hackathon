import { MasteryRing } from '../ui/MasteryRing';
import { Target, Clock, AlertTriangle } from 'lucide-react';

export function ResultAnalysis({ results, onRestart }: { results: any, onRestart: () => void }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-8">
      <div className="text-center mb-8">
         <h2 className="text-3xl font-sora font-bold text-white mb-2">Session Analysis</h2>
         <p className="text-muted">Targeted insights to tune your retention algorithm.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-card border border-border rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Accuracy Score</h3>
            <MasteryRing percentage={results.scorePct} size={150} strokeWidth={12} />
            <p className="mt-4 text-white font-bold">{results.correct} of {results.totalQuestions} Correct</p>
         </div>

         <div className="md:col-span-2 grid grid-cols-2 gap-6">
            <div className="bg-surface/50 border border-border rounded-2xl p-6 flex flex-col justify-center">
               <Target className="w-6 h-6 text-primary mb-3" />
               <p className="text-2xl font-sora font-bold text-white mb-1">{results.subject}</p>
               <p className="text-sm text-muted">{results.difficulty} Tier • {results.topic || 'Mixed'}</p>
            </div>
            <div className="bg-surface/50 border border-border rounded-2xl p-6 flex flex-col justify-center">
               <Clock className="w-6 h-6 text-teal-400 mb-3" />
               <p className="text-2xl font-sora font-bold text-white mb-1">{Math.round(results.timePerQAvg)}s</p>
               <p className="text-sm text-muted">Average Time per Question</p>
            </div>
            <div className="col-span-2 bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-2xl p-6">
               <div className="flex gap-2 items-center mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-white">Weak Concepts Detected</h3>
               </div>
               {results.weakConcepts.length > 0 ? (
                 <div className="flex flex-wrap gap-2">
                    {results.weakConcepts.map((wc: string) => (
                      <span key={wc} className="bg-red-500/20 text-red-300 px-3 py-1 rounded-md text-sm border border-red-500/30">
                        {wc}
                      </span>
                    ))}
                 </div>
               ) : (
                 <p className="text-sm text-green-400">Excellent! No major weak concepts detected in this session.</p>
               )}
            </div>
         </div>
      </div>

      <div className="flex justify-center mt-12">
         <button onClick={onRestart} className="bg-primary text-black font-bold px-8 py-3.5 rounded-xl hover:opacity-90 shadow-lg shadow-primary/20">
            Generate Targeted Practice
         </button>
      </div>
    </div>
  );
}
