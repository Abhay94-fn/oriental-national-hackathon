"use client";

import { useEffect, useState } from 'react';
import { useStore } from '../../../store/useStore';
import { PlannerForm } from '../../../components/planner/PlannerForm';
import { WeekCalendar } from '../../../components/planner/WeekCalendar';
import { DayDetail } from '../../../components/planner/DayDetail';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PlanDay } from '../../../types';
import { CalendarDays, Route } from 'lucide-react';

export default function Planner() {
  const { activePlan, setActivePlan } = useStore();
  const [selectedDay, setSelectedDay] = useState<PlanDay | null>(null);

  const fetchPlan = async () => {
    try {
      const res = await fetch('/api/planner');
      if (res.ok) {
        const data = await res.json();
        setActivePlan(data);
        if (data && data.days?.length > 0) {
           setSelectedDay(data.days[0]);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      {!activePlan ? (
        <div className="max-w-4xl mx-auto w-full space-y-8 mt-12 mb-auto">
           <EmptyState 
              icon={CalendarDays}
              title="No Active Study Plan"
              description="Configure your engine parameters below to generate a new AI-optimized 7-day schedule."
           />
           <PlannerForm onPlanGenerated={fetchPlan} />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6 mb-4 shrink-0">
             <div className="flex-1 bg-gradient-to-r from-card to-surface border border-border rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Route className="w-5 h-5" />
                   </div>
                   <h2 className="text-xl font-sora font-bold text-white">Current Trajectory: {activePlan.weeklyTarget}</h2>
                </div>
                <p className="text-muted text-sm">{activePlan.summary}</p>
             </div>
             <div className="md:w-64 bg-card border border-border rounded-3xl p-6 flex flex-col justify-center shrink-0">
                <p className="text-sm font-medium text-muted mb-1">Weekly Load</p>
                <p className="text-3xl font-sora font-bold text-teal-400">{activePlan.weeklyHours} Hrs</p>
             </div>
          </div>

          <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-0 overflow-hidden">
             {/* Left side: DnD Calendar Wrapper */}
             <div className="flex-1 bg-card rounded-3xl border border-border p-6 overflow-hidden flex flex-col relative shadow-xl">
               <div className="flex justify-between items-center mb-4 shrink-0">
                  <h3 className="text-sm font-bold text-muted uppercase tracking-wider">7-Day Horizon</h3>
                  <button 
                    onClick={() => setActivePlan(null as any)} 
                    className="text-xs font-bold text-primary hover:text-white transition-colors"
                  >
                    Regenerate Plan
                  </button>
               </div>
               {/* 
                  The flex-1 here pushes the WeekCalendar wrapper.
                  WeekCalendar internally manages its horizontal scroll height.
               */}
               <div className="flex-1 min-h-0 relative">
                  <WeekCalendar 
                    plan={activePlan} 
                    onDaySelect={setSelectedDay}
                    onPlanUpdate={setActivePlan} 
                  />
               </div>
             </div>

             {/* Right side: Selected Day Detail */}
             <div className="xl:w-[400px] shrink-0 h-full overflow-hidden">
               {selectedDay ? (
                 <DayDetail day={selectedDay} />
               ) : (
                 <div className="h-full bg-card/50 border border-dashed border-border rounded-3xl flex items-center justify-center p-8 text-center text-muted text-sm">
                   Select a day on the calendar to view its session breakdown.
                 </div>
               )}
             </div>
          </div>
        </>
      )}
    </div>
  );
}
