"use client";

import { motion } from "framer-motion";

const logos = [
  "React", "Next.js", "TailwindCSS", "Framer Motion", "TypeScript", "Vercel",
  "OpenAI", "Claude", "Stripe", "Supabase", "PostgreSQL", "Prisma"
];

export function LogoCarousel() {
  return (
    <div className="w-full py-12 overflow-hidden bg-background relative border-y border-border/50">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
      
      <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-8">
        Powered by modern industry standards
      </p>

      <div className="flex w-[200%]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          className="flex w-full items-center justify-around gap-16 px-8"
        >
          {/* Double the array for seamless infinite scroll */}
          {[...logos, ...logos].map((logo, i) => (
            <div key={i} className="flex items-center justify-center shrink-0">
              <span className="text-2xl md:text-3xl font-extrabold text-muted-foreground/20 uppercase tracking-tighter mix-blend-multiply dark:mix-blend-screen">
                {logo}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
