"use client";

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card border border-border rounded-2xl p-6 hover:bg-card-2 hover:border-primary/30 transition-all duration-200 group shadow-premium"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] font-bold text-muted uppercase tracking-widest">{title}</p>
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-foreground tracking-tight">{value}</p>
    </motion.div>
  );
}
