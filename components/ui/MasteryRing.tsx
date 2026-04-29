import { motion } from 'framer-motion';

export function MasteryRing({ percentage, size = 120, strokeWidth = 10 }: { percentage: number, size?: number, strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage < 30) return 'stroke-red-500';
    if (percentage < 70) return 'stroke-primary';
    return 'stroke-green-500';
  };

  return (
    <div className="relative flex items-center justify-center p-4">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-surface fill-transparent"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`fill-transparent transition-colors duration-500 ease-in-out ${getColor()}`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-sora font-bold text-white">{percentage}%</span>
        <span className="text-[10px] uppercase tracking-widest text-muted">Mastery</span>
      </div>
    </div>
  );
}
