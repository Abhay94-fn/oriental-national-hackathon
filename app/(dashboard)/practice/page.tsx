"use client";

import { useState } from 'react';
import { GeneratorForm } from '../../../components/practice/GeneratorForm';
import { QuestionCard } from '../../../components/practice/QuestionCard';
import { ResultAnalysis } from '../../../components/practice/ResultAnalysis';
import { Question } from '../../../types';
import { useStore } from '../../../store/useStore';

export default function Practice() {
  const { profile } = useStore();
  const [sessionState, setSessionState] = useState<'config' | 'playing' | 'results'>('config');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<any>(null);

  // Tracking
  const [correctCount, setCorrectCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [weakConcepts, setWeakConcepts] = useState<string[]>([]);

  const handleGenerate = async (genConfig: any) => {
    setIsGenerating(true);
    setConfig(genConfig);
    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...genConfig, exam: profile?.exam || 'Competitive Exam' })
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
        setSessionState('playing');
        setCurrentIndex(0);
        setCorrectCount(0);
        setTotalTime(0);
        setWeakConcepts([]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const getTimeAllowed = () => {
    if (!config) return 60;
    if (config.difficulty === 'Easy') return 60;
    if (config.difficulty === 'Medium') return 90;
    return 120;
  };

  const handleNext = async (isCorrect: boolean, timeUsed: number) => {
    const currentQ = questions[currentIndex];
    
    setTotalTime(prev => prev + timeUsed);
    if (isCorrect) setCorrectCount(prev => prev + 1);
    else if (!weakConcepts.includes(currentQ.concept)) {
      setWeakConcepts(prev => [...prev, currentQ.concept]);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      await finishSession(isCorrect ? correctCount + 1 : correctCount, totalTime + timeUsed, weakConcepts);
    }
  };

  const handleSkip = async (timeUsed: number) => {
    setTotalTime(prev => prev + timeUsed);
    const currentQ = questions[currentIndex];
    if (!weakConcepts.includes(currentQ.concept)) {
      setWeakConcepts(prev => [...prev, currentQ.concept]);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      await finishSession(correctCount, totalTime + timeUsed, weakConcepts);
    }
  };

  const finishSession = async (finalCorrect: number, finalTime: number, finalWeak: string[]) => {
    setSessionState('results');
    // Compute stats
    const results = {
       subject: config.subject,
       topic: config.topic,
       difficulty: config.difficulty,
       totalQuestions: questions.length,
       correct: finalCorrect,
       scorePct: Math.round((finalCorrect / questions.length) * 100),
       timePerQAvg: finalTime / questions.length,
       weakConcepts: finalWeak,
       questionsJson: questions
    };

    // Save
    await fetch('/api/practice', {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(results)
    });
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {sessionState === 'config' && (
        <div className="pt-8">
           <GeneratorForm onGenerate={handleGenerate} isGenerating={isGenerating} />
        </div>
      )}

      {sessionState === 'playing' && questions.length > 0 && (
        <div className="py-8">
           <ul className="flex items-center justify-center gap-2 mb-8">
             {questions.map((q, i) => (
                <li key={i} className={`w-8 h-2 rounded-full ${i === currentIndex ? 'bg-primary shadow-[0_0_10px_var(--primary)]' : i < currentIndex ? 'bg-surface border border-border' : 'bg-surface/30'}`} />
             ))}
           </ul>
           <QuestionCard 
             key={currentIndex}
             question={questions[currentIndex]}
             index={currentIndex}
             total={questions.length}
             onNext={handleNext}
             onSkip={handleSkip}
             timeAllowed={getTimeAllowed()}
           />
        </div>
      )}

      {sessionState === 'results' && (
        <div className="py-8">
           <ResultAnalysis 
             results={{
               subject: config.subject,
               topic: config.topic,
               difficulty: config.difficulty,
               totalQuestions: questions.length,
               correct: correctCount,
               scorePct: Math.round((correctCount / questions.length) * 100),
               timePerQAvg: totalTime / questions.length,
               weakConcepts: weakConcepts
             }} 
             onRestart={() => setSessionState('config')} 
           />
        </div>
      )}
    </div>
  );
}
