"use client";

import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { EvaluationResult } from '../../../types';
import { CheckSquare, Loader2, BookOpen, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { getSubjectsForExam } from '../../../lib/subjects';
import ReactMarkdown from 'react-markdown';

export default function EvaluatePage() {
  const { profile } = useStore();
  
  const dynamicSubjects = getSubjectsForExam(profile?.exam);
  const [subject, setSubject] = useState(dynamicSubjects[0]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const evaluateAnswer = async () => {
    if (!question || !answer) {
      setError('Please provide both the question and your answer.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          question,
          answer
        })
      });

      if (!res.ok) throw new Error('Failed to evaluate answer');
      
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (score >= 60) return 'text-primary bg-primary/10 border-primary/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      <div className="bg-gradient-to-r from-card-2 to-surface border border-border rounded-3xl p-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
               <CheckSquare className="w-6 h-6" />
             </div>
             <h1 className="text-3xl font-sora font-bold text-white">AI Assignment Evaluator</h1>
           </div>
           <p className="text-muted text-lg mb-8 max-w-2xl">
             Get instant, detailed feedback on your subjective answers. The AI examiner scores your response and shows you how to improve.
           </p>

           <div className="grid grid-cols-1 gap-6 mb-6">
             <div className="space-y-2 max-w-sm">
               <label className="text-sm text-muted font-medium ml-1 flex items-center gap-2">
                 <BookOpen className="w-4 h-4" /> Subject
               </label>
               <select 
                 value={subject}
                 onChange={(e) => setSubject(e.target.value)}
                 className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-400 transition-colors appearance-none"
               >
                 {dynamicSubjects.map(s => (
                   <option key={s} value={s}>{s}</option>
                 ))}
               </select>
             </div>
             
             <div className="space-y-2">
               <label className="text-sm text-muted font-medium ml-1 flex items-center gap-2">
                 <FileText className="w-4 h-4" /> Question
               </label>
               <textarea 
                 value={question}
                 onChange={(e) => setQuestion(e.target.value)}
                 className="w-full h-24 bg-surface border border-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-400 transition-colors resize-none"
                 placeholder="Enter the assignment or test question here..."
               />
             </div>

             <div className="space-y-2">
               <label className="text-sm text-muted font-medium ml-1 flex items-center gap-2">
                 <FileText className="w-4 h-4" /> Your Answer
               </label>
               <textarea 
                 value={answer}
                 onChange={(e) => setAnswer(e.target.value)}
                 className="w-full h-48 bg-surface border border-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-400 transition-colors resize-none"
                 placeholder="Type your complete answer here..."
               />
             </div>
           </div>

           <button
             onClick={evaluateAnswer}
             disabled={isLoading}
             className="w-full md:w-auto bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
           >
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckSquare className="w-5 h-5" />}
             {isLoading ? 'Evaluating...' : 'Evaluate My Answer'}
           </button>
         </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 text-center shadow-xl">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">AI Score</h3>
              <div className={`w-32 h-32 mx-auto rounded-full border-[6px] flex items-center justify-center ${getScoreColor(result.score).replace('bg-', 'border-').replace('/10', '/30')}`}>
                 <span className={`text-4xl font-sora font-bold ${getScoreColor(result.score).split(' ')[0]}`}>
                   {result.score}
                 </span>
              </div>
              <p className="text-sm text-muted mt-4">Out of 100</p>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">How to Improve</h3>
              <ul className="space-y-3">
                {result.improvements.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-white">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Examiner's Feedback</h3>
              <p className="text-white text-lg leading-relaxed">
                {result.feedback}
              </p>
            </div>

            <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-4">Model Answer</h3>
              <div className="prose prose-invert prose-p:text-muted prose-headings:text-white max-w-none">
                <ReactMarkdown>{result.modelAnswer}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
