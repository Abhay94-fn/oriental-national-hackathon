import { ElementType } from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-surface/50">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring" }}
        className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center mb-6 border border-border"
      >
        <Icon className="w-8 h-8 text-muted" />
      </motion.div>
      <h3 className="text-xl font-sora font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
