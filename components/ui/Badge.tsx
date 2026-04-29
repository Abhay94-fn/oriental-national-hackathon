interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral' | 'violet';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variants = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    success: 'bg-green-500/10 text-green-400 border border-green-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    neutral: 'bg-surface text-muted border border-border',
    violet: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
