"use client";

import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Bot, Save } from 'lucide-react';

export function AddConceptForm() {
  const { addConcept } = useStore();
  const [topic, setTopic] = useState('Physics');
  const [subtopic, setSubtopic] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch('/api/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, subtopic, summary, tags: parsedTags })
      });
      if (res.ok) {
        const newConcept = await res.json();
        addConcept(newConcept);
        setSubtopic('');
        setSummary('');
        setTags('');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const enhanceSummary = async () => {
    if (!subtopic || !summary) return;
    setIsEnhancing(true);
    try {
      // Direct call to an internal route or use a simulated response if no route exists
       const prompt = `Topic: ${topic}\nSubtopic: ${subtopic}\nMy notes: ${summary}`;
       const res = await fetch('/api/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
             subject: topic, 
             language: 'English',
             // We use tutor endpoint but we tell it we need standard text back, wait tutor is streaming. 
             // We can just use complete via a new API or simulate it. 
             // For DevClash prototype, we will just call a mock or a separate simple API. 
             messages: [{ role: 'user', content: `Improve these study notes nicely: ${prompt}` }]
          })
       });
       // Read stream ... Since it's a stream, we can just append.
       const reader = res.body?.getReader();
       const decoder = new TextDecoder();
       if (reader) {
          setSummary('');
          let done = false;
          while (!done) {
             const { value, done: doneReading } = await reader.read();
             done = doneReading;
             const chunk = decoder.decode(value);
             setSummary(prev => prev + chunk);
          }
       }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Subject</label>
          <select 
            value={topic} 
            onChange={e => setTopic(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {['Physics', 'Chemistry', 'Maths', 'Biology', 'History', 'Geography', 'Polity', 'Economics'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Topic Name</label>
          <input 
            type="text" 
            value={subtopic}
            onChange={e => setSubtopic(e.target.value)}
            placeholder="e.g. Newton's Third Law"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-muted">Summary & Notes</label>
          <button 
            type="button" 
            onClick={enhanceSummary}
            disabled={isEnhancing || !summary}
            className="text-teal-400 text-xs font-bold flex items-center gap-1 hover:text-teal-300 disabled:opacity-50"
          >
             <Bot className="w-3 h-3" />
             {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
          </button>
        </div>
        <textarea 
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Write your core concepts, formulas, and key points here..."
          rows={6}
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary custom-scrollbar"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted mb-2">Tags (Comma separated)</label>
        <input 
          type="text" 
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="e.g. Mechanics, Important, Formula"
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <button 
        type="submit" 
        disabled={isSaving}
        className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        {isSaving ? 'Saving...' : 'Add to Knowledge Base'}
      </button>
    </form>
  );
}
