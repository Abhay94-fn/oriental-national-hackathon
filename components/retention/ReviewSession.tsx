"use client";

import { useState } from 'react';
import { Concept } from '../../types';
import { FlashCard } from './FlashCard';
import { ProgressBar } from '../ui/ProgressBar';

export function ReviewSession({ queue, onComplete }: { queue: Concept[], onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentConcept = queue[currentIndex];

  const handleScore = async (quality: number) => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/concepts/${currentConcept.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality })
      });
      // Move next
      if (currentIndex + 1 < queue.length) {
        setCurrentIndex(v => v + 1);
        setIsFlipped(false);
      } else {
        onComplete();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentIndex) / queue.length) * 100;

  if (!currentConcept) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-muted">Card {currentIndex + 1} of {queue.length}</span>
        <div className="w-1/2">
          <ProgressBar progress={progress} showLabel={false} color="bg-primary" />
        </div>
      </div>

      <FlashCard 
        key={currentConcept.id} // force re-render on new card
        concept={currentConcept} 
        onFlip={setIsFlipped} 
      />

      <div className={`grid grid-cols-4 gap-4 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button
          disabled={isSubmitting}
          onClick={() => handleScore(1)}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3 rounded-xl font-bold transition-colors"
        >
          Again (1)
        </button>
        <button
          disabled={isSubmitting}
          onClick={() => handleScore(3)}
          className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 py-3 rounded-xl font-bold transition-colors"
        >
          Hard (3)
        </button>
        <button
          disabled={isSubmitting}
          onClick={() => handleScore(4)}
          className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 py-3 rounded-xl font-bold transition-colors"
        >
          Good (4)
        </button>
        <button
          disabled={isSubmitting}
          onClick={() => handleScore(5)}
          className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 py-3 rounded-xl font-bold transition-colors"
        >
          Easy (5)
        </button>
      </div>

      {isFlipped && (
          <p className="text-center text-xs text-muted">Rating updates the SuperMemo-2 interval and memory strength.</p>
      )}
    </div>
  );
}
