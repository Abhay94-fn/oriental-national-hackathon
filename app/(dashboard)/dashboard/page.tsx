"use client";

import { useEffect, useState } from 'react';
import { useStore } from '../../../store/useStore';
import { StatCard } from '../../../components/ui/StatCard';
import { WeeklyReportCard } from '../../../components/dashboard/WeeklyReportCard';
import { BrainCircuit, Target, Flame, Database, PlayCircle, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
        className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end bg-black/[0.02] border border-black/[0.06] rounded-2xl p-7 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-1.5">
          <h2 className="text-xl font-semibold text-black tracking-tight">
            Welcome back, <span className="text-black/60">{profile.name}</span>
          </h2>
          <p className="text-sm text-black/40">Targeting {profile.exam} • Ready for your next session.</p>
        </div>

        <div className="relative z-10 flex items-center gap-6 bg-black/[0.03] border border-black/[0.06] p-4 rounded-xl">
          <div className="text-center px-4 border-r border-black/[0.06]">
            <p className="text-[11px] text-black/40 mb-0.5 font-medium uppercase tracking-wider">Exam In</p>
            <p className="text-2xl font-semibold text-black">{countdown} <span className="text-sm text-black/40 font-normal">days</span></p>
          </div>
          <div className="text-center px-4">
            <p className="text-[11px] text-black/40 mb-0.5 font-medium uppercase tracking-wider">Daily Target</p>
            <p className="text-2xl font-semibold text-black">{profile.dailyHours} <span className="text-sm text-black/40 font-normal">hrs</span></p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Due for Review"
          value={analytics?.dueToday || 0}
          icon={BrainCircuit}
          colorClassName="text-black/60 bg-black/[0.04]"
        />
        <StatCard
          title="Avg Mastery"
          value={`${analytics?.avgStrength || 0}%`}
          icon={Target}
          colorClassName="text-black/60 bg-black/[0.04]"
        />
        <StatCard
          title="Current Streak"
          value={`${profile.streak} Days`}
          icon={Flame}
          colorClassName="text-black/60 bg-black/[0.04]"
        />
        <StatCard
          title="Concepts Tracked"
          value={analytics?.totalConcepts || 0}
          icon={Database}
          colorClassName="text-black/60 bg-black/[0.04]"
        />
      </div>

      {/* Weekly Report */}
      <WeeklyReportCard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Forgetting Curve Chart */}
        <div className="lg:col-span-2 bg-black/[0.02] rounded-2xl border border-black/[0.06] p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-semibold text-black">Forgetting Curve</h3>
              <p className="text-[12px] text-black/40 mt-0.5">Memory decay for active concepts</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-black/20" />
              <span className="text-[11px] text-black/40">Retention %</span>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.forgettingCurveData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(0,0,0,0.15)" stopOpacity={1}/>
                    <stop offset="95%" stopColor="rgba(0,0,0,0)" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(0,0,0,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(0,0,0,0.2)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.1)', borderRadius: '8px', color: '#000', fontSize: '12px' }}
                  itemStyle={{ color: '#000', fontWeight: '500' }}
                />
                <Area type="monotone" dataKey="retention" stroke="rgba(0,0,0,0.6)" strokeWidth={2} fillOpacity={1} fill="url(#colorRetention)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-black/[0.02] rounded-2xl border border-black/[0.06] p-5">
            <h3 className="text-[12px] font-semibold text-black/40 uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/retention" className="flex items-center justify-between p-3.5 bg-white hover:bg-black/[0.02] border border-black/[0.06] hover:border-black/[0.1] rounded-xl transition-all duration-200 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black/[0.04] rounded-lg group-hover:scale-105 transition-transform">
                    <PlayCircle className="w-4 h-4 text-black/60" />
                  </div>
                  <span className="text-[13px] font-medium text-black">Start Review ({analytics?.dueToday || 0})</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-black/20 group-hover:text-black/40 transition-colors" />
              </Link>
              <Link href="/tutor" className="flex items-center justify-between p-3.5 bg-white hover:bg-black/[0.02] border border-black/[0.06] hover:border-black/[0.1] rounded-xl transition-all duration-200 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black/[0.04] rounded-lg group-hover:scale-105 transition-transform">
                    <BrainCircuit className="w-4 h-4 text-black/60" />
                  </div>
                  <span className="text-[13px] font-medium text-black">Ask AI Tutor</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-black/20 group-hover:text-black/40 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Subject Mastery */}
          <div className="bg-black/[0.02] rounded-2xl border border-black/[0.06] p-5">
            <h3 className="text-[12px] font-semibold text-black/40 uppercase tracking-wider mb-4">Subject Mastery</h3>
            <div className="space-y-3.5">
              {analytics?.subjectBreakdown?.map((sub) => (
                <div key={sub.subject}>
                  <div className="flex justify-between text-[13px] mb-1.5">
                    <span className="font-medium text-black/70">{sub.subject}</span>
                    <span className="text-black/50 font-medium">{sub.avgStrength}%</span>
                  </div>
                  <div className="w-full bg-black/[0.06] h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sub.avgStrength}%` }}
                      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-black h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
              {(!analytics?.subjectBreakdown || analytics.subjectBreakdown.length === 0) && (
                <p className="text-[13px] text-black/40 text-center py-3">Add concepts to see mastery.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
