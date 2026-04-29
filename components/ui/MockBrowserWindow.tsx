import React from "react";
import { motion } from "framer-motion";

export function MockBrowserWindow({ children, title = "mentor.com" }: { children: React.ReactNode, title?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="w-full rounded-2xl overflow-hidden bg-card border border-border shadow-2xl shadow-primary/10"
    >
      {/* Browser Toolbar */}
      <div className="h-12 bg-card-2 border-b border-border flex items-center px-4 gap-4">
        {/* Mac OS Buttons */}
        <div className="flex gap-2 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
        </div>
        
        {/* Address Bar */}
        <div className="flex-1 max-w-md mx-auto flex items-center justify-center h-7 bg-background border border-border rounded-md px-3">
          <span className="text-[11px] font-medium text-muted-foreground/80 flex items-center gap-2">
            <svg className="w-3 h-3 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            {title}
          </span>
        </div>
        
        <div className="w-[44px] shrink-0" /> {/* Spacer to balance the buttons */}
      </div>

      {/* Browser Content */}
      <div className="relative bg-background">
        {children}
      </div>
    </motion.div>
  );
}
