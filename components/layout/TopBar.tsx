"use client";

import { useStore } from '../../store/useStore';
import { Menu, Flame } from 'lucide-react';

export function TopBar() {
  const { toggleSidebar, currentModule, profile } = useStore();

  const getTitle = () => {
    switch(true) {
        case currentModule.startsWith('/dashboard'): return 'Dashboard';
        case currentModule.startsWith('/retention'): return 'Retention';
        case currentModule.startsWith('/planner'): return 'Planner';
        case currentModule.startsWith('/practice'): return 'Practice';
        case currentModule.startsWith('/tutor'): return 'AI Tutor';
        case currentModule.startsWith('/lab'): return 'Content Lab';
        case currentModule.startsWith('/recommendations'): return 'Recommendations';
        case currentModule.startsWith('/learning-path'): return 'Learning Path';
        case currentModule.startsWith('/notes'): return 'Study Notes';
        case currentModule.startsWith('/evaluate'): return 'Assignment Eval';
        case currentModule.startsWith('/archive'): return 'Archive';
        default: return 'Mentor';
    }
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card-2 transition-colors md:inline-flex"
        >
          <Menu className="w-4 h-4" />
        </button>
        <h1 className="text-sm font-bold text-foreground tracking-tight">
          {getTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {profile && (
          <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm">
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span className="text-[12px] font-semibold text-muted-foreground">{profile.streak} day streak</span>
          </div>
        )}
      </div>
    </header>
  );
}
