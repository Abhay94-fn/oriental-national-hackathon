import { useState } from 'react';
import { motion } from 'framer-motion';

export function FlashCard({ concept, onFlip }: { concept: any, onFlip?: (isFlipped: boolean) => void }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    const newState = !isFlipped;
    setIsFlipped(newState);
    if (onFlip) onFlip(newState);
  };

  return (
    <div 
      className="relative w-full aspect-[4/3] cursor-pointer perspective-1000 mx-auto"
      onClick={handleFlip}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-card border border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-6">
            {concept.topic}
          </span>
          <h2 className="text-3xl md:text-4xl font-sora font-bold text-white leading-tight">
            {concept.subtopic}
          </h2>
          <p className="mt-8 text-sm text-muted animate-pulse">Click to flip side</p>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden bg-card-2 border border-primary/30 rounded-3xl p-8 flex flex-col justify-center overflow-y-auto custom-scrollbar shadow-2xl shadow-primary/10"
          style={{ transform: 'rotateY(180deg)' }}
        >
           <h3 className="text-lg font-bold text-primary mb-4 border-b border-border pb-2 inline-block">Explanation</h3>
           <div className="prose prose-invert max-w-none text-base leading-relaxed text-gray-300">
             {concept.summary}
           </div>
           
           {concept.tags && concept.tags.length > 0 && (
             <div className="mt-8 flex flex-wrap gap-2">
               {concept.tags.map((tag: string) => (
                 <span key={tag} className="text-xs bg-surface border border-border text-muted px-2 py-1 rounded-md">#{tag}</span>
               ))}
             </div>
           )}
        </div>
      </motion.div>
    </div>
  );
}
