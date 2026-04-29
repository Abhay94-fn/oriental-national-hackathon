"use client";

import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { PathTimeline } from '../../../components/learning-path/PathTimeline';
import { LearningPath } from '../../../types';
import { Route, Loader2, Target, GraduationCap, AlertCircle } from 'lucide-react';

export default function LearningPathPage() {
  const { profile, analytics } = useStore();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [exam, setExam] = useState(profile?.exam || '');
  const [level, setLevel] = useState('Beginner');

  const generatePath = async () => {
    if (!exam) {
      setError('Please enter a target exam or goal');
      return;
    }

    setIsLoading(true);
    setError('');
    
    const weakAreas = analytics?.subjectBreakdown
      ?.filter(s => s.avgStrength < 60)
      ?.map(s => s.subject) || [];

    try {
      const res = await fetch('/api/learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetExam: exam,
          currentLevel: level,
          weakAreas: weakAreas.length > 0 ? weakAreas : undefined
        })
      });

      if (!res.ok) throw new Error('Failed to generate learning path');
      
      const data = await res.json();
      setPath(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      <div className="bg-gradient-to-r from-card-2 to-surface border border-border rounded-3xl p-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-teal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-teal/20 text-teal-400 rounded-xl">
               <Route className="w-6 h-6" />
             </div>
             <h1 className="text-3xl font-sora font-bold text-foreground">Dynamic Learning Path</h1>
           </div>
           <p className="text-muted text-lg mb-8 max-w-2xl">
             Generate a personalized, step-by-step roadmap to achieve your target. The AI adjusts the curriculum based on your current level and past performance.
           </p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
             <div className="space-y-2">
               <label className="text-sm text-muted font-medium ml-1 flex items-center gap-2">
                 <Target className="w-4 h-4" /> Target Goal / Exam
               </label>
               <input 
                 type="text" 
                 value={exam}
                 onChange={(e) => setExam(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted focus:outline-none focus:border-teal-400 transition-colors"
                 placeholder="e.g., JEE Advanced 2026"
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm text-muted font-medium ml-1 flex items-center gap-2">
                 <GraduationCap className="w-4 h-4" /> Current Level
               </label>
               <select 
                 value={level}
                 onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-teal-400 transition-colors appearance-none"
               >
                 <option value="Absolute Beginner">Absolute Beginner</option>
                 <option value="Beginner">Beginner</option>
                 <option value="Intermediate">Intermediate</option>
                 <option value="Advanced">Advanced (Just need revision)</option>
               </select>
             </div>
           </div>

           <button
             onClick={generatePath}
             disabled={isLoading}
             className="w-full bg-teal-500 text-bg font-bold px-6 py-3.5 rounded-xl hover:bg-teal-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
           >
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Route className="w-5 h-5" />}
             {isLoading ? 'Architecting your path...' : 'Generate Roadmap'}
           </button>
         </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {path && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <PathTimeline path={path} />
        </div>
      )}
    </div>
  );
}
