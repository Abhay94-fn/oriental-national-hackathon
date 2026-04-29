"use client";

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClassName?: string;
}

export function StatCard({ title, value, icon: Icon, colorClassName = 'text-black/60 bg-black/[0.04]' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="bg-black/[0.02] border border-black/[0.06] rounded-2xl p-5 hover:bg-black/[0.04] hover:border-black/[0.1] transition-all duration-200 group"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-medium text-black/40 uppercase tracking-wider">{title}</p>
        <div className={`p-2 rounded-lg ${colorClassName} group-hover:scale-105 transition-transform duration-200`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-black tracking-tight">{value}</p>
    </motion.div>
  );
}
