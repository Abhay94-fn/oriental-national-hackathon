"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Image from 'next/image';
import { BrainCircuit, LineChart, CheckCircle2, Zap, Target, Sparkles, ArrowRight, Plus } from 'lucide-react';
import { SplashScreen } from '../components/ui/SplashScreen';
import { DynamicIslandNav } from '../components/layout/DynamicIslandNav';
import { LogoCarousel } from '../components/ui/LogoCarousel';
import { MockBrowserWindow } from '../components/ui/MockBrowserWindow';

// ─── Scroll-reveal wrapper ───
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── FAQ Item ───
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="text-[15px] font-bold text-muted-foreground group-hover:text-foreground transition-colors pr-8">{question}</span>
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus className="w-4 h-4 text-primary shrink-0" />
        </motion.div>
      </button>
      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
        <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{answer}</p>
      </motion.div>
    </div>
  );
}

// ─── Feature Card ───
function FeatureCard({ icon, title, desc, index }: { icon: React.ReactNode; title: string; desc: string; index: number }) {
  return (
    <Reveal delay={index * 0.08}>
      <div className="group p-8 rounded-3xl bg-card border border-border hover:bg-card-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-default h-full flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:-rotate-12 duration-500 pointer-events-none">
          {icon}
        </div>
        <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300 shadow-sm">
          {icon}
        </div>
        <h3 className="text-[17px] font-extrabold text-foreground mb-3 tracking-tight">{title}</h3>
        <p className="text-[15px] text-muted-foreground leading-relaxed mt-auto">{desc}</p>
      </div>
    </Reveal>
  );
}

// ─── Terminal ───
function TerminalBlock() {
  const lines = [
    { text: '> mentor start --mode mentor', style: 'text-muted-foreground/60' },
    { text: '', style: '' },
    { text: '  Initializing Socratic AI Engine...', style: 'text-muted-foreground/80' },
    { text: '  ✓ Context loaded: JEE Physics', style: 'text-primary font-medium' },
    { text: '  ✓ Mode: Adaptive Mentor', style: 'text-primary font-medium' },
    { text: '', style: '' },
    { text: '  Tutor: "What happens to internal energy', style: 'text-foreground font-semibold' },
    { text: '          when gas expands adiabatically?"', style: 'text-foreground font-semibold' },
  ];
  const [visibleCount, setVisibleCount] = useState(0);
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    lines.forEach((_, i) => { timers.push(setTimeout(() => setVisibleCount(i + 1), 600 + i * 350)); });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="p-8 font-mono text-[14px] space-y-1.5 min-h-[300px] bg-card/50">
      {lines.map((line, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={i < visibleCount ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.25, ease: 'easeOut' }} className={line.style}>
          {line.text || '\u00A0'}
        </motion.div>
      ))}
      {visibleCount >= lines.length && (
        <div className="flex items-center mt-3">
          <span className="text-primary mr-2">{'>'}</span>
          <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="inline-block w-2.5 h-5 bg-primary" />
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <SplashScreen />
      <DynamicIslandNav />
      
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-x-hidden pt-20">
        <main className="relative z-10">
          
          {/* ─── Hero ─── */}
          <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 lg:pt-32 lg:pb-24 grid lg:grid-cols-12 gap-16 items-center min-h-[85vh]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="space-y-8 lg:col-span-5 relative z-10">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[12px] font-bold tracking-wide uppercase shadow-[0_0_15px_rgba(79,70,229,0.1)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Now in public beta
              </div>

              <h1 className="text-[clamp(3rem,6vw,5rem)] font-extrabold tracking-[-0.04em] leading-[1.05]">
                The AI Mentor<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-violet-500">You Deserve.</span>
              </h1>

              <p className="text-[17px] text-muted-foreground max-w-lg leading-relaxed font-medium">
                Stop memorizing. Start understanding. Socratic AI tutoring, personalized learning paths, and instant evaluations — built for competitive exams.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-[15px] hover:bg-primary/90 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40">
                  Start Learning Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="#features" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-[15px] text-foreground bg-card border border-border hover:bg-card-2 hover:border-border-hover transition-all text-center shadow-sm">
                  Explore Features
                </Link>
              </div>
              
              {/* Subtle users proof */}
              <div className="flex items-center gap-4 pt-6 opacity-70">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-card-2 flex items-center justify-center overflow-hidden">
                       <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=f1f5f9`} alt="User" width={32} height={32} />
                    </div>
                  ))}
                </div>
                <div className="text-xs font-semibold text-muted-foreground">
                  Joined by 10,000+ students
                </div>
              </div>

            </motion.div>

            <div className="lg:col-span-7 relative z-10 w-full">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-violet-500/20 blur-3xl -z-10 rounded-full transform scale-90 translate-y-10" />
               <MockBrowserWindow title="terminal — mentor">
                 <TerminalBlock />
               </MockBrowserWindow>
            </div>
          </section>

          {/* ─── Logo Carousel ─── */}
          <LogoCarousel />

          {/* ─── Features ─── */}
          <section id="features" className="max-w-7xl mx-auto px-6 py-32 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-3xl rounded-full pointer-events-none -z-10" />
            
            <Reveal>
              <div className="text-center mb-20 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-muted-foreground text-[11px] font-bold tracking-widest uppercase mb-4">
                  Ecosystem
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Everything you need to master.</h2>
                <p className="text-muted-foreground text-[17px] max-w-2xl mx-auto font-medium">A complete learning ecosystem powered by state-of-the-art AI, designed to replace generic study apps.</p>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard index={0} icon={<BrainCircuit className="w-6 h-6" />} title="Socratic AI Mentor" desc="Doesn't give answers — asks probing questions, gives hints, and guides you to the 'aha' moment." />
              <FeatureCard index={1} icon={<Target className="w-6 h-6" />} title="Dynamic Learning Paths" desc="Generates customized day-by-day roadmaps based on your knowledge level and exam date." />
              <FeatureCard index={2} icon={<LineChart className="w-6 h-6" />} title="Weekly Progress Reports" desc="Aggregates chat history and test scores to generate personalized weekly analytics." />
              <FeatureCard index={3} icon={<CheckCircle2 className="w-6 h-6" />} title="Smart Evaluator" desc="Upload written answers. AI scores you out of 100 and points out logical flaws." />
              <FeatureCard index={4} icon={<Zap className="w-6 h-6" />} title="Forgetting Curve Tracking" desc="Spaced repetition algorithms predict when you'll forget and prompt timely reviews." />
              <FeatureCard index={5} icon={<Sparkles className="w-6 h-6" />} title="Study Notes Generator" desc="Compiles structured study notes from any topic or YouTube video instantly." />
            </div>
          </section>

          {/* ─── How it works ─── */}
          <section id="how-it-works" className="bg-card-2 py-32 border-y border-border">
            <div className="max-w-5xl mx-auto px-6">
              <Reveal>
                <div className="text-center mb-20 space-y-4">
                  <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">How it works</h2>
                  <p className="text-muted-foreground text-[17px] font-medium">Three steps to smarter, faster learning.</p>
                </div>
              </Reveal>
              <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10" />
                
                {[
                  { step: '01', title: 'Create your profile', desc: 'Tell us your target exam, subjects, and current baseline level.' },
                  { step: '02', title: 'Get your roadmap', desc: 'AI generates a personalized study plan perfectly calibrated to your timeline.' },
                  { step: '03', title: 'Learn & iterate', desc: 'Study with the AI tutor, track retention, and adapt in real-time.' }
                ].map((item, i) => (
                  <Reveal key={i} delay={i * 0.15}>
                    <div className="text-center relative z-10">
                      <div className="w-24 h-24 mx-auto bg-card rounded-3xl border-2 border-primary/20 flex items-center justify-center mb-6 shadow-xl shadow-primary/10 transform transition-transform hover:scale-110 hover:-rotate-3">
                        <span className="text-3xl font-extrabold text-primary">{item.step}</span>
                      </div>
                      <h3 className="text-[19px] font-bold text-foreground mb-3">{item.title}</h3>
                      <p className="text-[15px] text-muted-foreground leading-relaxed max-w-sm mx-auto">{item.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ─── FAQ ─── */}
          <section id="faq" className="max-w-3xl mx-auto px-6 py-32">
            <Reveal>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold tracking-tight">Frequently asked questions</h2>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="bg-card border border-border rounded-3xl p-8 shadow-lg shadow-black/5">
                <FAQItem question="Is Mentor completely free?" answer="Yes! Our core features are completely free during our beta period. We believe in democratizing high-quality education." />
                <FAQItem question="How does Mentor Mode differ from ChatGPT?" answer="Standard AI models quickly give you the answer. Mentor Mode acts like a strict human tutor — it refuses to give direct answers and instead provides hints to force critical thinking." />
                <FAQItem question="Which exams do you support?" answer="We specialize in Indian competitive exams like JEE, NEET, and UPSC, but the AI can tutor any global curriculum." />
                <FAQItem question="How does the forgetting curve work?" answer="We track every concept you study and use spaced repetition algorithms to predict when you'll forget. You get timely reminders to review." />
              </div>
            </Reveal>
          </section>

          {/* ─── CTA ─── */}
          <section className="max-w-4xl mx-auto px-6 py-24 mb-12">
            <Reveal>
              <div className="p-16 rounded-[40px] bg-foreground text-background relative overflow-hidden shadow-2xl shadow-foreground/20 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent mix-blend-overlay" />
                <h2 className="relative z-10 text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">Ready to ace your exams?</h2>
                <p className="relative z-10 text-[17px] text-muted-foreground/90 mb-10 max-w-lg mx-auto font-medium">Join thousands of students using our AI to learn faster, retain more, and completely master their syllabus.</p>
                <Link href="/register" className="relative z-10 inline-flex items-center gap-3 px-10 py-5 bg-background text-foreground rounded-full font-extrabold text-[16px] hover:bg-primary hover:text-primary-foreground transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl">
                  Create Free Account <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </Reveal>
          </section>
        </main>

        {/* ─── Footer ─── */}
        <footer className="border-t border-border bg-card/50 py-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Image src="/MENTOR.svg" alt="Mentor" width={100} height={30} className="h-6 w-auto opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
            </div>
            <div className="flex items-center gap-8 text-sm font-semibold text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-[13px] text-muted-foreground font-medium">© 2026 Mentor. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
