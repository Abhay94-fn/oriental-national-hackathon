"use client";

import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Calendar, Clock, Crosshair, Loader2 } from 'lucide-react';

export function PlannerForm({ onPlanGenerated }: { onPlanGenerated: () => void }) {
  const { profile, concepts, fetchConcepts } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [weakAreas, setWeakAreas] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsGenerating(true);
    try {
      const areas = weakAreas.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examDate: profile.examDate,
          dailyHours: profile.dailyHours,
          weakAreas: areas.length > 0 ? areas : ['General Revision'],
          exam: profile.exam,
          existingConcepts: concepts.map(c => c.subtopic)
        })
      });
      if (res.ok) {
        onPlanGenerated();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div>
         <h2 className="text-2xl font-sora font-bold text-white mb-2">Configure Engine</h2>
         <p className="text-muted text-sm">Targeted scheduling algorithm will optimize your next 3 days.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
         <div className="space-y-4">
            <div>
               <label className="text-sm font-medium text-muted mb-2 flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-primary" /> Exam Date
               </label>
               <input 
                 type="date"
                 disabled
                 value={profile?.examDate || ''}
                 className="w-full bg-surface/50 border border-border rounded-xl px-4 py-3 text-muted cursor-not-allowed"
               />
               <p className="text-[10px] text-muted mt-1">Change in Profile Settings</p>
            </div>
            <div>
               <label className="text-sm font-medium text-muted mb-2 flex items-center gap-2">
                 <Clock className="w-4 h-4 text-teal-400" /> Daily Capacity
               </label>
               <div className="flex items-center gap-4 bg-surface border border-border rounded-xl px-4 h-12">
                  <input 
                    type="range" min="2" max="16" step="1"
                    disabled
                    value={profile?.dailyHours || 6}
                    className="flex-1 accent-teal-400 opacity-50 cursor-not-allowed"
                  />
                  <span className="font-bold text-white w-12 text-right">{profile?.dailyHours} hrs</span>
               </div>
            </div>
         </div>

         <div>
            <label className="text-sm font-medium text-muted mb-2 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-red-400" /> Focus Weak Areas
            </label>
            <textarea
               value={weakAreas}
               onChange={e => setWeakAreas(e.target.value)}
               placeholder="e.g. Organic Chemistry, Integration, Magnetism..."
               rows={4}
               className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary custom-scrollbar resize-none h-[116px]"
            />
         </div>
      </div>

      <button
        type="submit"
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-black font-bold text-sm sm:text-base py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 relative z-10"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Synthesizing Plan...
          </>
        ) : (
          'Generate 3-Day Plan'
        )}
      </button>
    </form>
  );
}
