import { LabNotes } from '../../types';
import { Badge } from '../ui/Badge';
import { FileText, Clock, Compass, BookOpen, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function StructuredNotes({ notes, onReset }: { notes: LabNotes, onReset: () => void }) {
  if (!notes) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 pb-12">
      {/* Header Panel */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 shadow-xl relative overflow-hidden items-start md:items-center">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         
         <div className="flex-1 relative z-10">
            <div className="flex items-center gap-3 mb-3">
               <Badge variant="violet" className="px-3 py-1 text-sm">{notes.subject}</Badge>
               <Badge variant={notes.examRelevance === 'High' ? 'danger' : 'warning'} className="px-3 py-1 text-sm flex items-center gap-1">
                 <AlertTriangle className="w-3 h-3" /> Rel: {notes.examRelevance}
               </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-sora font-bold text-white leading-tight mb-2">{notes.title}</h1>
            <p className="text-muted flex items-center gap-4 text-sm font-medium">
               <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-teal-400" /> {notes.estimatedStudyTime}</span>
               {notes.ncertReference && <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-primary" /> {notes.ncertReference}</span>}
            </p>
         </div>

         <div className="shrink-0 relative z-10 w-full md:w-auto flex flex-col items-center">
            {notes.videoId && (
               <a href={`https://youtube.com/watch?v=${notes.videoId}`} target="_blank" rel="noreferrer" className="w-full">
                  <div className="relative w-full md:w-[240px] aspect-video rounded-xl overflow-hidden border border-border group">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={`https://img.youtube.com/vi/${notes.videoId}/hqdefault.jpg`} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                     <div className="absolute inset-0 flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-black/20 transition-all">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center pl-1 shadow-lg backdrop-blur-sm">
                           <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                     </div>
                  </div>
               </a>
            )}
            <button onClick={onReset} className="text-xs font-bold text-muted hover:text-white mt-4 border border-border px-4 py-1.5 rounded-full hover:bg-surface transition-colors">
               Extract New Video
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Col: Main Notes */}
         <div className="lg:col-span-2 space-y-8">
            <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
               <h2 className="text-xl font-sora font-bold text-white mb-6 flex items-center gap-3">
                 <FileText className="w-5 h-5 text-primary" /> Executive Summary
               </h2>
               <div className="prose prose-invert max-w-none text-gray-300">
                  <p className="lead text-lg">{notes.summary}</p>
               </div>
            </section>

            <section className="bg-gradient-to-b from-card to-background border border-border rounded-3xl p-6 md:p-8 shadow-sm">
               <h2 className="text-xl font-sora font-bold text-white mb-6 flex items-center gap-3">
                 <Compass className="w-5 h-5 text-teal-400" /> Core Concepts
               </h2>
               <div className="space-y-6">
                  {notes.concepts?.map((c: any, i: number) => (
                    <div key={i} className="bg-surface/50 border border-border rounded-2xl p-5 hover:border-teal-500/30 transition-colors">
                       <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-lg text-white font-sora">{c.name}</h3>
                          <Badge variant={c.difficulty === 'Hard' ? 'danger' : 'neutral'} className="shadow-sm">{c.difficulty}</Badge>
                       </div>
                       <p className="text-sm text-gray-300 mb-4">{c.explanation}</p>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                          {c.formula && (
                             <div className="bg-black/40 border border-primary/20 rounded-xl p-3 flex flex-col justify-center">
                                <span className="text-[10px] uppercase font-bold text-primary/70 mb-1">Formula</span>
                                <code className="text-primary font-mono text-xs">{c.formula}</code>
                             </div>
                          )}
                          {c.mnemonic && (
                             <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex flex-col justify-center text-amber-500 text-xs italic">
                                <span className="text-[10px] uppercase font-bold text-amber-500/70 mb-1 not-italic">Mnemonic Tracker</span>
                                "{c.mnemonic}"
                             </div>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </section>
         </div>

         {/* Right Col: Meta & Review */}
         <div className="space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm sticky top-6">
               <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 border-b border-border pb-2">Exam Targeting</h3>
               <p className="text-sm text-gray-300 mb-6 leading-relaxed bg-primary/5 p-3 rounded-xl border border-primary/10">
                  {notes.importantForExam}
               </p>

               {notes.keyFormulas && notes.keyFormulas.length > 0 && (
                  <>
                     <h3 className="text-sm font-bold text-muted uppercase tracking-wider mt-6 mb-4 border-b border-border pb-2">Cheat Sheet</h3>
                     <ul className="space-y-2 mb-6">
                        {notes.keyFormulas.map((f: string, i: number) => (
                          <li key={i} className="bg-black/50 border border-border rounded-lg p-2 text-xs font-mono text-teal-400">
                            {f}
                          </li>
                        ))}
                     </ul>
                  </>
               )}

               {notes.practiceQuestions && notes.practiceQuestions.length > 0 && (
                  <>
                     <h3 className="text-sm font-bold text-muted uppercase tracking-wider mt-6 mb-4 border-b border-border pb-2">Quick Checks</h3>
                     <div className="space-y-4">
                        {notes.practiceQuestions.map((q: any, i: number) => (
                           <details key={i} className="group bg-surface border border-border rounded-xl">
                              <summary className="p-3 text-sm font-medium text-white cursor-pointer select-none">
                                 {q.question}
                              </summary>
                              <div className="p-3 pt-0 border-t border-border mt-1">
                                 <p className="text-xs text-muted mb-2"><span className="font-bold text-teal-400">Hint:</span> {q.hint}</p>
                                 <p className="text-sm font-bold text-green-400">{q.answer}</p>
                              </div>
                           </details>
                        ))}
                     </div>
                  </>
               )}

               <button 
                 className="w-full mt-8 bg-surface border border-primary text-primary font-bold py-3 rounded-xl hover:bg-primary hover:text-black transition-all"
                 onClick={() => alert("Concept injected to Knowledge Base. Go to Retention tab.")}
               >
                 Inject to Memory Engine
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
