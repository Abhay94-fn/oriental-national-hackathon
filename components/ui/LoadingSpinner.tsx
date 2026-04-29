"use client";

import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  const dotSize = { sm: 'w-1 h-1', md: 'w-1.5 h-1.5', lg: 'w-2 h-2' };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeMap[size]} relative`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`absolute ${dotSize[size]} rounded-full bg-black/40`}
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: 'center',
            }}
            animate={{
              x: [0, Math.cos((i * 2 * Math.PI) / 3) * 8, 0],
              y: [0, Math.sin((i * 2 * Math.PI) / 3) * 8, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Simple spinning ring variant
export function SpinnerRing({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${className} border-2 border-black/10 border-t-black/50 rounded-full`}
    />
  );
}
