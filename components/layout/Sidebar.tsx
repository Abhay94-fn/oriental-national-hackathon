"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../../store/useStore';
import { LayoutDashboard, Brain, CalendarDays, Dumbbell, Bot, Youtube, BookOpen, Route, FileText, CheckSquare, Archive } from 'lucide-react';
import MentorLogo from "@/public/Mentor.png";
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STUDENT_MODULES = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Recommendations', path: '/recommendations', icon: BookOpen },
  { name: 'Learning Path', path: '/learning-path', icon: Route },
  { name: 'Study Notes', path: '/notes', icon: FileText },
  { name: 'Assignment Eval', path: '/evaluate', icon: CheckSquare },
  { name: 'Retention', path: '/retention', icon: Brain },
  { name: 'Planner', path: '/planner', icon: CalendarDays },
  { name: 'Practice', path: '/practice', icon: Dumbbell },
  { name: 'AI Tutor', path: '/tutor', icon: Bot },
  { name: 'Content Lab', path: '/lab', icon: Youtube },
  { name: 'Archive', path: '/archive', icon: Archive },
];

const TEACHER_MODULES = [
  { name: 'Teacher Portal', path: '/teacher-dashboard', icon: LayoutDashboard },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, setCurrentModule, profile } = useStore();

  useEffect(() => { setCurrentModule(pathname); }, [pathname, setCurrentModule]);

  return (
    <motion.div
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0 bg-card border-r border-border flex flex-col overflow-hidden shadow-sm"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-border shrink-0 bg-card/50">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed ? (
            <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5">
              <img src={MentorLogo.src} alt="Mentor" className="h-6 w-auto" />
            </motion.div>
          ) : (
            <motion.div key="mini" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto">
              <img src={MentorLogo.src} alt="Mentor" className="h-6 w-auto" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 custom-scrollbar">
        {(profile?.role === 'teacher' ? TEACHER_MODULES : STUDENT_MODULES).map((mod) => {
          const Icon = mod.icon;
          const isActive = pathname.startsWith(mod.path);
          return (
            <Link key={mod.name} href={mod.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative ${
                isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-card-2 font-medium'
              } ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}
              title={sidebarCollapsed ? mod.name : undefined}
            >
              {isActive && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full shadow-[0_0_8px_var(--primary)]" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <Icon className={`w-[18px] h-[18px] shrink-0 transition-transform duration-150 group-hover:scale-105 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              {!sidebarCollapsed && <span className="text-[13px] whitespace-nowrap">{mod.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className={`p-3 border-t border-border shrink-0 bg-card/50 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 bg-background p-2.5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow'}`}>
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {profile?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{profile?.exam || 'Exam'}</p>
              <button
                id="sign-out-btn"
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  localStorage.removeItem('mentor_profile');
                  useStore.setState({ profile: null });
                  window.location.href = '/login';
                }}
                className="text-[11px] text-muted-foreground hover:text-red-500 font-semibold transition-colors cursor-pointer text-left w-full py-0.5"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
