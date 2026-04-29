"use client";

import { StudySession } from '../../types';
import { Badge } from '../ui/Badge';
import { BookOpen, RefreshCcw, Dumbbell, FileSignature, Coffee, Clock } from 'lucide-react';

export function SessionCard({ session }: { session: StudySession }) {
  const getTypeColor = () => {
    switch (session.type) {
      case 'Learn': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'Revise': return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
      case 'Practice': return 'bg-teal-500/10 border-teal-500/20 text-teal-400';
      case 'Mock Test': return 'bg-red-500/10 border-red-500/20 text-red-500';
      case 'Break': return 'bg-surface border-border text-muted';
      default: return 'bg-surface border-border text-white';
    }
  };

  const getIcon = () => {
    switch (session.type) {
      case 'Learn': return BookOpen;
      case 'Revise': return RefreshCcw;
      case 'Practice': return Dumbbell;
      case 'Mock Test': return FileSignature;
      case 'Break': return Coffee;
      default: return BookOpen;
    }
  };

  const Icon = getIcon();

  return (
    <div className={`p-4 rounded-xl border ${getTypeColor()} flex flex-col gap-3 relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-[0.06] transition-opacity" />
      
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-2">
           <Icon className="w-4 h-4" />
           <span className="text-xs font-bold uppercase tracking-wider">{session.type}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold opacity-80 backdrop-blur-sm bg-black/20 px-2 py-1 rounded-md">
           <Clock className="w-3 h-3" />
           {session.time}
        </div>
      </div>

      <div className="relative z-10">
        <h4 className="font-sora font-semibold text-lg text-white group-hover:text-current transition-colors">
          {session.subject} {session.topic && `: ${session.topic}`}
        </h4>
        <p className="text-sm opacity-80 mt-1 line-clamp-2 leading-relaxed">{session.description}</p>
      </div>

      <div className="flex justify-between items-end mt-auto pt-2 relative z-10">
         <div className="flex gap-2">
            {session.priority === 'High' && <Badge variant="danger">High Prio</Badge>}
            <Badge variant="neutral">{session.pomodoroCount} Pomo</Badge>
         </div>
      </div>
    </div>
  );
}
