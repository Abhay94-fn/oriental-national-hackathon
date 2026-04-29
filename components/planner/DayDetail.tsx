import { useStore } from '../../store/useStore';
import { PlanDay } from '../../types';
import { SessionCard } from './SessionCard';
import { Target, CheckCircle } from 'lucide-react';

export function DayDetail({ day }: { day: PlanDay }) {
  if (!day) return null;

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-2xl h-full flex flex-col">
       <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-sora font-bold text-white mb-1">{day.day}</h3>
            <p className="text-muted text-sm">{day.date} • {day.totalHours} Hours</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shadow-inner">
             {day.completionPct}%
          </div>
       </div>

       <div className="bg-gradient-to-r from-surface to-background border border-border rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
             <Target className="w-4 h-4 text-teal-400" />
             <span className="font-bold text-sm text-white">Daily Target</span>
          </div>
          <p className="text-sm text-gray-300 mb-4">{day.target}</p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm text-primary flex items-start gap-2">
             <span className="text-lg">💡</span>
             <p className="leading-tight pt-1">{day.motiveTip}</p>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
          <h4 className="font-bold text-muted text-sm uppercase tracking-wider sticky top-0 bg-card py-2 z-20">Session Breakdown</h4>
          {day.sessions.map((session: any, i: number) => (
            <SessionCard key={i} session={session} />
          ))}
       </div>
    </div>
  );
}
