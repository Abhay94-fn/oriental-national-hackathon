"use client";

import { useState, useEffect } from 'react';
import { useStore } from '../../../store/useStore';
import { RecommendationCard } from '../../../components/recommendations/RecommendationCard';
import { Recommendation } from '../../../types';
import { Sparkles, Loader2, Target, AlertCircle } from 'lucide-react';

export default function Recommendations() {
  const { profile, analytics } = useStore();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [goal, setGoal] = useState('');

  const generateRecommendations = async () => {
    setIsLoading(true);
    setError('');
    
    // Get weak areas from analytics if available
    const weakAreas = analytics?.subjectBreakdown
      ?.filter(s => s.avgStrength < 60)
      ?.map(s => s.subject) || [];

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetExam: goal || profile?.exam || 'Competitive Exams',
          weakAreas: weakAreas.length > 0 ? weakAreas : undefined,
          currentLevel: 'Intermediate' // Can be inferred or asked
        })
      });

      if (!res.ok) throw new Error('Failed to generate recommendations');
      
      const data = await res.json();
      setRecommendations(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      <div className="bg-gradient-to-br from-card-2 to-surface border border-border rounded-3xl p-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10 max-w-2xl">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-primary/20 text-primary rounded-xl">
               <Sparkles className="w-6 h-6" />
             </div>
             <h1 className="text-3xl font-sora font-bold text-white">AI Resource Engine</h1>
           </div>
           <p className="text-muted text-lg mb-8">
             Get highly curated courses, projects, and tutorials tailored to your weak areas and exam goals. Let AI find the exact resources you need to level up.
           </p>

           <div className="flex gap-4">
             <div className="flex-1 relative">
               <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
               <input 
                 type="text" 
                 placeholder="Specific goal (e.g., Master React, Clear JEE Mains Math)"
                 value={goal}
                 onChange={(e) => setGoal(e.target.value)}
                 className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
               />
             </div>
             <button
               onClick={generateRecommendations}
               disabled={isLoading}
               className="bg-primary text-bg font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
             >
               {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
               {isLoading ? 'Scanning...' : 'Find Resources'}
             </button>
           </div>
         </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
            Recommended For You
            <span className="text-sm font-normal text-muted bg-surface px-2 py-1 rounded-md border border-border">
              {recommendations.length} found
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, idx) => (
              <div key={rec.id || idx} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                <RecommendationCard recommendation={rec} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
