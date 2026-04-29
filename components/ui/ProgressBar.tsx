import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  color?: string; // e.g: "bg-green-500"
  height?: string; // e.g: "h-2"
  showLabel?: boolean;
}

export function ProgressBar({ progress, color = "bg-primary", height = "h-2", showLabel = false }: ProgressBarProps) {
  // Determine color based on value if not explicitly passed
  const getAutoColor = () => {
    if (progress < 30) return 'bg-red-500 text-red-500';
    if (progress < 70) return 'bg-primary text-primary';
    return 'bg-green-500 text-green-500';
  };

  const finalColor = color || getAutoColor();
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full flex items-center gap-3">
      <div className={`flex-1 bg-surface rounded-full overflow-hidden ${height}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full shadow-[0_0_10px_currentColor] ${finalColor.split(' ')[0]}`}
          style={{ color: 'inherit' }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-bold w-9 text-right ${finalColor.split(' ')[1] || 'text-white'}`}>
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  );
}
