"use client";

import { useDroppable, useDraggable, DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { StudyPlan, PlanDay, StudySession } from '../../types';
import { SessionCard } from './SessionCard';
import { useState } from 'react';

function DraggableSession({ id, session }: { id: string, session: StudySession }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: { session }
  });

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      className={`${isDragging ? 'opacity-50 grayscale' : ''} cursor-grab active:cursor-grabbing`}
    >
      <SessionCard session={session} />
    </div>
  );
}

function DroppableColumn({ id, day, onSelect }: { id: string, day: PlanDay, onSelect: () => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: { dayIndex: parseInt(id) }
  });

  return (
    <div 
      ref={setNodeRef}
      onClick={onSelect}
      className={`min-w-[280px] w-[280px] shrink-0 h-full flex flex-col bg-surface/50 border rounded-2xl p-3 transition-colors ${isOver ? 'border-primary bg-primary/5' : 'border-border hover:border-border-hover cursor-pointer'}`}
    >
      <div className="flex justify-between items-center mb-3 px-1 sticky top-0 z-10 bg-surface/80 backdrop-blur-sm py-1">
         <h4 className="font-sora font-bold text-white">{day.day}</h4>
         <span className="text-xs text-muted font-medium">{day.date.slice(5)}</span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pb-2 pr-1">
        {day.sessions.map((session: any, i: number) => (
          <DraggableSession key={`${id}-${i}`} id={`${id}-${i}`} session={session} />
        ))}
      </div>
    </div>
  );
}

export function WeekCalendar({ plan, onDaySelect, onPlanUpdate }: { plan: StudyPlan, onDaySelect: (day: PlanDay) => void, onPlanUpdate: (plan: StudyPlan) => void }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    setActiveSession(event.active.data.current.session);
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    setActiveSession(null);
    const { active, over } = event;

    if (!over) return;

    // source
    const sourceString = active.id as string;
    const [sourceDayIndexStr, sourceSessionIndexStr] = sourceString.split('-');
    const sourceDayIndex = parseInt(sourceDayIndexStr);
    const sourceSessionIndex = parseInt(sourceSessionIndexStr);

    // dest
    const destDayIndex = over.data.current.dayIndex;

    if (sourceDayIndex === destDayIndex) return; // ignore same column drops for now

    const newPlan = structuredClone(plan);
    const movedSession = newPlan.days[sourceDayIndex].sessions.splice(sourceSessionIndex, 1)[0];
    newPlan.days[destDayIndex].sessions.push(movedSession);
    
    // Sort dest sessions by time naive
    newPlan.days[destDayIndex].sessions.sort((a: any, b: any) => a.time.localeCompare(b.time));

    onPlanUpdate(newPlan);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
       <div className="flex gap-4 w-full h-[600px] overflow-x-auto pb-4 custom-scrollbar">
         {plan.days.map((day: any, i: number) => (
           <DroppableColumn 
              key={i.toString()} 
              id={i.toString()} 
              day={day} 
              onSelect={() => onDaySelect(day)} 
           />
         ))}
       </div>

       <DragOverlay>
         {activeId && activeSession ? (
            <div className="rotate-3 scale-105 shadow-2xl opacity-90 cursor-grabbing">
               <SessionCard session={activeSession} />
            </div>
         ) : null}
       </DragOverlay>
    </DndContext>
  );
}
