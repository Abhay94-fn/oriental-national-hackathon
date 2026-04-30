"use client";

import { useEffect, useState } from 'react';
import { useStore } from '../../../store/useStore';
import { StatCard } from '../../../components/ui/StatCard';
import { WeeklyReportCard } from '../../../components/dashboard/WeeklyReportCard';
import { BrainCircuit, Target, Flame, Database, PlayCircle, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MentorLogo from "@/public/Mentor.png";

export default function Dashboard() {
  const { profile, analytics, fetchAnalytics } = useStore();
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    if (profile?.examDate) {
      const daysLeft = Math.ceil((new Date(profile.examDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      setCountdown(daysLeft > 0 ? daysLeft : 0);
    }
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-premium group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
        <div className="relative z-10 space-y-1.5">
          <div className="mb-4 hidden md:block">
             <img src={MentorLogo.src} alt="Mentor" className="h-8 w-auto object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mt-2">
            Namaste, <span className="text-primary">{profile.name}</span>
          </h2>
          <p className="text-muted font-medium">Mission: {profile.exam} • {countdown} days to go</p>
        </div>

        <div className="relative z-10 flex items-center gap-6 bg-surface border border-border p-5 rounded-2xl shadow-sm">
          <div className="text-center px-4 border-r border-border">
            <p className="text-[11px] text-muted mb-1 font-bold uppercase tracking-widest">Countdown</p>
            <p className="text-3xl font-extrabold text-foreground">{countdown} <span className="text-xs text-muted font-bold uppercase tracking-tighter">days</span></p>
          </div>
          <div className="text-center px-4">
            <p className="text-[11px] text-muted mb-1 font-bold uppercase tracking-widest">Daily Pace</p>
            <p className="text-3xl font-extrabold text-foreground">{profile.dailyHours} <span className="text-xs text-muted font-bold uppercase tracking-tighter">hrs</span></p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Due for Review"
          value={analytics?.dueToday || 0}
          icon={BrainCircuit}
        />
        <StatCard
          title="Avg Mastery"
          value={`${analytics?.avgStrength || 0}%`}
          icon={Target}
        />
        <StatCard
          title="Current Streak"
          value={`${profile.streak} Days`}
          icon={Flame}
        />
        <StatCard
          title="Concepts Tracked"
          value={analytics?.totalConcepts || 0}
          icon={Database}
        />
      </div>

      {/* Weekly Report */}
      <WeeklyReportCard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Forgetting Curve Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-8 shadow-premium">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Forgetting Curve</h3>
              <p className="text-xs text-muted font-medium">Memory decay for active concepts</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-[11px] font-bold text-muted uppercase">Retention %</span>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.forgettingCurveData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="retention" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRetention)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-premium">
            <h3 className="text-[12px] font-bold text-muted uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/retention" className="flex items-center justify-between p-4 bg-surface hover:bg-card-2 border border-border hover:border-primary/30 rounded-2xl transition-all duration-300 group shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[14px] font-bold text-foreground">Start Review ({analytics?.dueToday || 0})</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
              </Link>
              <Link href="/tutor" className="flex items-center justify-between p-4 bg-surface hover:bg-card-2 border border-border hover:border-primary/30 rounded-2xl transition-all duration-300 group shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                    <BrainCircuit className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[14px] font-bold text-foreground">Ask AI Tutor</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>

          {/* Subject Mastery */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-premium">
            <h3 className="text-[12px] font-bold text-muted uppercase tracking-widest mb-5">Subject Mastery</h3>
            <div className="space-y-5">
              {analytics?.subjectBreakdown?.map((sub) => (
                <div key={sub.subject}>
                  <div className="flex justify-between text-[13px] mb-2 font-bold">
                    <span className="text-foreground">{sub.subject}</span>
                    <span className="text-primary">{sub.avgStrength}%</span>
                  </div>
                  <div className="w-full bg-surface border border-border h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sub.avgStrength}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    />
                  </div>
                </div>
              ))}
              {(!analytics?.subjectBreakdown || analytics.subjectBreakdown.length === 0) && (
                <p className="text-sm text-muted text-center py-4 font-medium italic">Add concepts to map mastery.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
