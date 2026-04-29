import { useEffect, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

export function TimerBar({ durationSeconds, onExpire, isPaused }: { durationSeconds: number, onExpire: () => void, isPaused: boolean }) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const controls = useAnimationControls();

  useEffect(() => {
    setTimeLeft(durationSeconds);
    controls.start({
      width: '0%',
      transition: { duration: durationSeconds, ease: 'linear' }
    });
  }, [durationSeconds, controls]);

  useEffect(() => {
    if (isPaused) {
      controls.stop();
    } else {
      // Resume logic is tricky with framer-motion width percentages without knowing exact pixels left, 
      // but simpler: we just manage time via interval for precise logic.
      const interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
             clearInterval(interval);
             onExpire();
             return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused, onExpire, durationSeconds]);

  // Color logic based on percentage (worse as it gets lower)
  const pct = (timeLeft / durationSeconds) * 100;
  const color = pct > 50 ? 'bg-teal-400' : pct > 20 ? 'bg-yellow-400' : 'bg-red-500';

  return (
    <div className="w-full bg-surface border border-border h-2.5 rounded-full overflow-hidden relative">
      <motion.div
         className={`h-full ${color}`}
         initial={{ width: '100%' }}
         animate={controls}
      />
      {/* Overlay a visual pulse if time < 20% */}
      {pct <= 20 && !isPaused && (
        <div className="absolute inset-0 bg-red-500/30 animate-pulse" />
      )}
    </div>
  );
}
