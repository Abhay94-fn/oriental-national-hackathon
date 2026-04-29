"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X } from "lucide-react";

export function DynamicIslandNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Compute width based on state
  // On desktop: if scrolled, it shrinks to a pill. If hovered while scrolled, it expands slightly.
  const desktopWidth = isScrolled ? (isHovered ? 600 : 320) : 1000;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
      <motion.nav
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          width: "100%",
          maxWidth: desktopWidth,
          borderRadius: isScrolled ? 32 : 16
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`pointer-events-auto bg-background/80 backdrop-blur-xl border border-border shadow-lg shadow-primary/5 flex flex-col overflow-hidden transition-colors duration-300 ${isScrolled ? 'bg-card/90' : 'bg-background/50'}`}
      >
        <div className="h-14 flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/Mentor.png" alt="Mentor" width={120} height={36} className="h-6 w-auto" priority />
          </Link>

          {/* Desktop Links (Hidden when shrunk, unless hovered) */}
          <div className="hidden md:flex items-center justify-center flex-1 overflow-hidden">
            <AnimatePresence mode="popLayout">
              {(!isScrolled || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-8 text-[13px] font-medium text-muted-foreground whitespace-nowrap"
                >
                  <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
                  <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How it works</a>
                  <a href="#faq" className="hover:text-foreground transition-colors duration-200">FAQ</a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <AnimatePresence mode="popLayout">
              {(!isScrolled || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/login" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">Log in</Link>
                </motion.div>
              )}
            </AnimatePresence>
            <Link href="/register" className="text-[13px] font-bold px-4 py-1.5 bg-foreground text-background rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center gap-1.5">
              Get Started
              {(!isScrolled || isHovered) && <ArrowRight className="w-3.5 h-3.5" />}
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-1.5 text-foreground">
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border bg-background"
            >
              <div className="flex flex-col p-4 space-y-4 text-sm font-medium">
                <a href="#features" onClick={() => setIsMobileOpen(false)} className="text-muted-foreground hover:text-foreground">Features</a>
                <a href="#how-it-works" onClick={() => setIsMobileOpen(false)} className="text-muted-foreground hover:text-foreground">How it works</a>
                <a href="#faq" onClick={() => setIsMobileOpen(false)} className="text-muted-foreground hover:text-foreground">FAQ</a>
                <div className="h-px bg-border my-2" />
                <Link href="/login" onClick={() => setIsMobileOpen(false)} className="text-muted-foreground hover:text-foreground">Log in</Link>
                <Link href="/register" onClick={() => setIsMobileOpen(false)} className="text-primary font-bold">Get Started</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
