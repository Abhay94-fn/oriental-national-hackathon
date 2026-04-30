"use client";

import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import MentorLogo from "@/public/Mentor.png";

export function OnboardingModal() {
  const { profile, setProfile } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [exam, setExam] = useState('');
  const [examDate, setExamDate] = useState('');
  const [hours, setHours] = useState('6');

  useEffect(() => {
    const localProfile = localStorage.getItem('mentor_profile');
    if (localProfile) {
      const parsedProfile = JSON.parse(localProfile);
      
      // Teachers skip the student onboarding flow
      if (parsedProfile.role === 'teacher') {
        setProfile({ ...parsedProfile, id: parsedProfile.id || 1, exam: parsedProfile.exam || 'Teacher', examDate: parsedProfile.examDate || '', dailyHours: parsedProfile.dailyHours || 0, streak: 0, lastActive: new Date().toISOString() });
        return;
      }

      // Check if student has completed onboarding
      if (!parsedProfile.exam || !parsedProfile.examDate) {
        if (parsedProfile.name) setName(parsedProfile.name);
        setIsOpen(true);
        return;
      }

      // Calculate real-time streak
      const now = new Date();
      const lastActiveDate = new Date(parsedProfile.lastActive);
      
      // Reset time to midnight for comparison
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastActive = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());
      
      const diffTime = Math.abs(today.getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      let newStreak = parsedProfile.streak || 0;
      
      if (diffDays === 1) {
        // Logged in consecutive day
        newStreak += 1;
      } else if (diffDays > 1) {
        // Missed a day
        newStreak = 0; // or 1 if you consider current day as start
      }
      // if diffDays === 0, same day, streak unchanged
      
      const updatedProfile = {
        ...parsedProfile,
        streak: newStreak,
        lastActive: now.toISOString()
      };
      
      localStorage.setItem('mentor_profile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
    } else {
      setIsOpen(true);
    }
  }, [setProfile]);

  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/register') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem('mentor_profile') || '{}');
    const newProfile = {
      ...existing,
      id: 1,
      name: name || existing.name || 'Aspirant',
      exam,
      examDate: examDate || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().slice(0, 10),
      dailyHours: parseInt(hours) || 6,
      streak: existing.streak || 0,
      lastActive: new Date().toISOString()
    };
    localStorage.setItem('mentor_profile', JSON.stringify(newProfile));
    setProfile(newProfile);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-md rounded-2xl border border-black/[0.06] overflow-hidden shadow-2xl"
        >
          <div className="bg-black/[0.02] p-6 flex flex-col items-center text-center border-b border-black/[0.06]">
            <div className="w-full flex items-center justify-center mb-4">
              <img src={MentorLogo.src} alt="Mentor" className="h-10 w-auto object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-black tracking-tight mb-2">Welcome</h2>
            <p className="text-sm text-black/60">Let's configure your study engine to maximize retention.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-black/60 mb-1.5">Your Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2.5 text-black placeholder:text-black/20 focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/20 transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black/60 mb-1.5">Target Exam</label>
              <input 
                type="text" 
                value={exam}
                onChange={e => setExam(e.target.value)}
                placeholder="e.g. UPSC, GATE, CAT, SSC CGL"
                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2.5 text-black placeholder:text-black/20 focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/20 transition-all text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black/60 mb-1.5">Exam Date</label>
                  <input 
                    type="date" 
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2.5 text-black focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/20 transition-all text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/60 mb-1.5">Study Hrs / Day</label>
                  <input 
                    type="number" 
                    min="1" max="16"
                    value={hours}
                    onChange={e => setHours(e.target.value)}
                    className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2.5 text-black focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/20 transition-all text-sm"
                    required
                  />
                </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              Initialize Engine
              <Rocket className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
