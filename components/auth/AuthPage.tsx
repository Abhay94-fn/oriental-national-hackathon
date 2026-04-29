"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, Github } from 'lucide-react';
import Image from 'next/image';

// ─── Animated blob background for the visual side ───
function AnimatedBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          x: [0, 60, -60, 0],
          y: [0, -60, 60, 0],
          scale: [1, 1.15, 0.85, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="auth-blob absolute top-[15%] left-[20%] w-[340px] h-[340px] rounded-full bg-primary/20 blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -60, 60, 0],
          y: [0, 60, -60, 0],
          scale: [1, 0.85, 1.15, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="auth-blob absolute top-[50%] right-[15%] w-[280px] h-[280px] rounded-full bg-indigo-500/20 blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, 40, -40, 0],
          y: [0, 40, -40, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="auth-blob absolute bottom-[10%] left-[35%] w-[220px] h-[220px] rounded-full bg-violet-500/20 blur-[80px]"
      />
    </div>
  );
}

// ─── Floating grid pattern ───
function GridPattern() {
  return (
    <div className="absolute inset-0 w-full h-full opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
  );
}

// ─── Visual side with Holographic Cards animation ───
function VisualSide({ view }: { view: 'login' | 'register' }) {
  const cards = [
    { title: "Socratic Engine", desc: "Adaptive questioning based on your weak points.", icon: "🧠" },
    { title: "Knowledge Graph", desc: "Visualizing your retention across all chapters.", icon: "📊" },
    { title: "AI Evaluator", desc: "Instant grading and feedback on assignments.", icon: "⚡" },
  ];

  return (
    <motion.div layout className="relative w-full h-full flex flex-col items-center justify-center p-12 overflow-hidden bg-card border border-border rounded-[40px] shadow-2xl z-10">
      <GridPattern />
      <AnimatedBlobs />

      <motion.div
        key={view}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md flex flex-col items-center"
      >
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <Image src="/MENTOR.svg" alt="Mentor" width={160} height={48} className="h-12 w-auto drop-shadow-md" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-extrabold text-foreground tracking-tight"
          >
            {view === 'login' ? 'Welcome back' : 'Start your journey'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-muted-foreground mt-3 text-[15px] font-medium leading-relaxed max-w-xs mx-auto"
          >
            {view === 'login'
              ? 'Your AI mentor is ready. Pick up where you left off.'
              : 'Join thousands of students learning smarter with AI.'}
          </motion.p>
        </div>

        {/* Dynamic Holographic Cards */}
        <div className="relative w-full h-[240px] flex items-center justify-center perspective-[1000px]">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, rotateX: 45, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                y: i * 20 - 20, 
                rotateX: 0, 
                scale: 1 - i * 0.05,
                zIndex: cards.length - i
              }}
              transition={{ 
                duration: 0.8, 
                delay: 0.3 + i * 0.15, 
                type: "spring", 
                bounce: 0.4 
              }}
              className="absolute w-[320px] bg-background/80 backdrop-blur-xl border border-border shadow-xl rounded-2xl p-5 flex items-start gap-4"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                {card.icon}
              </div>
              <div>
                <h3 className="text-foreground font-bold text-[15px]">{card.title}</h3>
                <p className="text-muted-foreground text-[13px] leading-relaxed mt-1 font-medium">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Custom input with focus glow ───
function AuthInput({
  icon: Icon,
  type = 'text',
  showToggle = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ElementType;
  showToggle?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const actualType = showToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-300" />
      <input
        type={actualType}
        className="w-full h-14 pl-12 pr-12 bg-card-2 border border-border rounded-2xl text-foreground font-medium text-[15px] placeholder:text-muted-foreground/50 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10 hover:border-border-hover shadow-sm"
        {...props}
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
        </button>
      )}
    </div>
  );
}

// ─── Main Auth Page ───
export function AuthPage({ initialView = 'login' }: { initialView?: 'login' | 'register' }) {
  const [view, setView] = useState(initialView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (view === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        router.push('/dashboard');
        router.refresh();
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const switchView = () => {
    setError('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setView(view === 'login' ? 'register' : 'login');
  };

  // Stagger children variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 }
    },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  const formContent = (
    <div className="flex-1 flex items-center justify-center p-8 md:p-16 relative">
      <div className="w-full max-w-[420px] relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Mobile logo */}
            <motion.div variants={itemVariants} className="md:hidden flex items-center justify-center mb-10">
              <Image src="/MENTOR.svg" alt="Mentor" width={140} height={42} className="h-9 w-auto" />
            </motion.div>

            {/* Header */}
            <motion.div variants={itemVariants} className="mb-10 text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
                {view === 'login' ? 'Sign in' : 'Create account'}
              </h1>
              <p className="text-muted-foreground text-[15px] font-medium">
                {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={switchView}
                  className="text-primary font-bold transition-colors duration-200 hover:text-primary/80 hover:underline underline-offset-4"
                >
                  {view === 'login' ? 'Create one' : 'Sign in'}
                </button>
              </p>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold flex items-center gap-2 shadow-sm">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5"
              animate={shake ? { x: [0, -10, 10, -10, 10, -5, 5, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              {/* Name (register only) */}
              <AnimatePresence>
                {view === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <motion.div variants={itemVariants}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-2 ml-1">Full Name</label>
                      <AuthInput
                        icon={User}
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required={view === 'register'}
                        autoComplete="name"
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-2 ml-1">Email</label>
                <AuthInput
                  icon={Mail}
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Password</label>
                  {view === 'login' && (
                    <Link href="#" className="text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <AuthInput
                  icon={Lock}
                  type="password"
                  placeholder="••••••••"
                  showToggle
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                />
              </motion.div>

              <AnimatePresence>
                {view === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <motion.div variants={itemVariants}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-2 ml-1">Confirm Password</label>
                      <AuthInput
                        icon={Lock}
                        type="password"
                        placeholder="••••••••"
                        showToggle
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required={view === 'register'}
                        autoComplete="new-password"
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.div variants={itemVariants} className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-primary text-primary-foreground font-bold text-[15px] rounded-2xl transition-all duration-300 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      {view === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="relative py-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[12px] font-bold uppercase tracking-widest">
                  <span className="px-4 bg-background text-muted-foreground/50">or continue with</span>
                </div>
              </motion.div>

              {/* Social Buttons */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="h-12 flex items-center justify-center gap-2.5 bg-card border border-border rounded-xl text-foreground text-[14px] font-bold transition-all duration-200 hover:bg-card-2 hover:border-border-hover shadow-sm"
                >
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="h-12 flex items-center justify-center gap-2.5 bg-card border border-border rounded-xl text-foreground text-[14px] font-bold transition-all duration-200 hover:bg-card-2 hover:border-border-hover shadow-sm"
                >
                  <Github className="w-[18px] h-[18px]" />
                  GitHub
                </button>
              </motion.div>

              {/* Terms */}
              <motion.p variants={itemVariants} className="text-[12px] text-muted-foreground/60 text-center pt-6 font-medium leading-relaxed">
                By continuing, you agree to our{' '}
                <Link href="#" className="text-foreground hover:underline underline-offset-4">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className="text-foreground hover:underline underline-offset-4">Privacy Policy</Link>
              </motion.p>
            </motion.form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  const visualContent = (
    <div className="hidden md:flex w-1/2 p-4 pb-4">
      <AnimatePresence mode="wait">
        <VisualSide key={view} view={view} />
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex overflow-hidden items-center justify-center p-4 sm:p-8">
      {/* Bento Box Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
        className="w-full max-w-6xl min-h-[700px] flex rounded-[48px] bg-background border border-border shadow-2xl shadow-primary/5 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            className="flex w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {view === 'login' ? (
              <>
                {visualContent}
                {formContent}
              </>
            ) : (
              <>
                {formContent}
                {visualContent}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
