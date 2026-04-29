"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

function DiaTextReveal({ text, colors, className }: { text: string; colors: string[]; className?: string }) {
  return (
    <div className="relative inline-block overflow-hidden pb-4">
      <motion.div
        className="absolute inset-0 z-10 mix-blend-screen pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${colors[0]} 20%, ${colors[1]} 40%, ${colors[2]} 60%, ${colors[3]} 80%, transparent 100%)`,
          backgroundSize: "200% auto",
        }}
        animate={{
          backgroundPosition: ["200% center", "-200% center"],
        }}
        transition={{
          duration: 2.5,
          ease: "easeInOut",
        }}
      />
      <motion.h1
        className={className}
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {text}
      </motion.h1>
    </div>
  );
}

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [showSlogan, setShowSlogan] = useState(false);

  useEffect(() => {
    // Show slogan after the DiaTextReveal sweeps past
    const sloganTimer = setTimeout(() => setShowSlogan(true), 1000);
    // Hide splash screen entirely
    const hideTimer = setTimeout(() => setIsVisible(false), 3000);

    return () => {
      clearTimeout(sloganTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
        >
          <div className="relative flex flex-col items-center justify-center p-8">
            <DiaTextReveal
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground relative z-20"
              text="Mentor"
              colors={["#22d3ee", "#818cf8", "#f472b6", "#34d399"]}
            />

            <AnimatePresence>
              {showSlogan && (
                <motion.div
                  initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="mt-2 text-muted-foreground font-bold text-lg tracking-widest uppercase relative z-20"
                >
                  Guidance when you need it most
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Background Glow */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 0.15, scale: 1 }}
               transition={{ duration: 1.5 }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-400 via-indigo-400 to-pink-400 blur-[100px] rounded-full z-0"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
