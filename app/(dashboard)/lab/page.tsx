"use client";

import { useState } from 'react';
import { VideoProcessor } from '../../../components/lab/VideoProcessor';
import { StructuredNotes } from '../../../components/lab/StructuredNotes';
import { LabNotes } from '../../../types';

export default function Lab() {
  const [notes, setNotes] = useState<LabNotes | null>(null);
  const [error, setError] = useState('');

  const handleProcess = async (url: string, language: string) => {
    setError('');
    try {
      const res = await fetch('/api/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, language })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process video');
      }
      
      setNotes(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pt-12 pb-24">
      {!notes ? (
        <>
           <VideoProcessor onProcess={handleProcess} />
           {error && (
             <div className="max-w-3xl mx-auto mt-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm font-medium animate-in fade-in">
                {error}
             </div>
           )}
        </>
      ) : (
        <StructuredNotes notes={notes} onReset={() => setNotes(null)} />
      )}
    </div>
  );
}
