"use client";

import { useEffect, useState } from 'react';
import { useStore } from '../../../store/useStore';
import { AddConceptForm } from '../../../components/retention/AddConceptForm';
import { ReviewSession } from '../../../components/retention/ReviewSession';
import { KnowledgeGraph } from '../../../components/retention/KnowledgeGraph';
import { MasteryRing } from '../../../components/ui/MasteryRing';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Brain, Database, PlayCircle, Plus } from 'lucide-react';

type Tab = 'knowledge' | 'review' | 'add';

export default function Retention() {
  const { concepts, fetchConcepts } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('knowledge');
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    fetchConcepts();
  }, [fetchConcepts]);

  const dueCards = concepts.filter(c => {
    const today = new Date().toISOString().slice(0, 10);
    return c.nextReview <= today;
  });

  const startReview = () => {
    setQueue(dueCards);
    setActiveTab('review');
  };

  const handleReviewComplete = () => {
    fetchConcepts(); // refresh states
    setActiveTab('knowledge');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border rounded-2xl p-2 shadow-sm">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('knowledge')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'knowledge' ? 'bg-surface text-primary border border-border' : 'text-muted hover:text-white'}`}
          >
            <div className="flex items-center gap-2"><Database className="w-4 h-4" /> Knowledge Base</div>
          </button>
          <button 
            onClick={() => setActiveTab('review')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'review' ? 'bg-surface text-primary border border-border' : 'text-muted hover:text-white'}`}
          >
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4" /> 
              Review Session 
              {dueCards.length > 0 && <span className="bg-primary text-black px-1.5 py-0.5 rounded text-[10px] ml-1">{dueCards.length}</span>}
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'add' ? 'bg-surface text-primary border border-border' : 'text-muted hover:text-white'}`}
          >
            <div className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Concept</div>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            <div className="h-64 bg-card border border-border rounded-3xl p-4 overflow-hidden shadow-sm">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Knowledge Graph Network</h3>
              <KnowledgeGraph concepts={concepts} />
            </div>

            {concepts.length === 0 ? (
               <EmptyState 
                  icon={Brain}
                  title="Empty Knowledge Base"
                  description="Your engine doesn't have any concepts to track yet. Start by adding one or process a YouTube video in the Lab."
                  action={
                    <button onClick={() => setActiveTab('add')} className="bg-primary text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90">
                      <Plus className="w-4 h-4" /> Add First Concept
                    </button>
                  }
               />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {concepts.map(c => (
                  <div key={c.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-colors flex flex-col group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:from-primary/10 transition-colors" />
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <Badge variant="violet" className="mb-2 inline-block">{c.topic}</Badge>
                        <h4 className="font-sora font-bold text-white text-lg">{c.subtopic}</h4>
                      </div>
                      <MasteryRing percentage={c.strength} size={50} strokeWidth={5} />
                    </div>
                    
                    <p className="text-sm text-muted line-clamp-2 mb-4 relative z-10 font-mono text-xs">{c.summary}</p>
                    
                    <div className="mt-auto border-t border-border pt-4 flex justify-between items-center relative z-10">
                       <div className="flex gap-2 overflow-hidden">
                          {c.tags?.slice(0,2).map((tag:string) => <Badge key={tag} variant="neutral">{tag}</Badge>)}
                          {c.tags?.length > 2 && <span className="text-xs text-muted">+{c.tags.length - 2}</span>}
                       </div>
                       <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md shrink-0">
                         Rev: {c.nextReview === new Date().toISOString().slice(0, 10) ? 'Today' : c.nextReview}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'review' && (
          <div className="h-full flex items-center justify-center p-4">
            {queue.length > 0 ? (
              <div className="w-full">
                <ReviewSession queue={queue} onComplete={handleReviewComplete} />
              </div>
            ) : (
              <EmptyState 
                 icon={PlayCircle}
                 title={dueCards.length > 0 ? "Ready to Review" : "All caught up!"}
                 description={dueCards.length > 0 ? `You have ${dueCards.length} concepts waiting for retention building.` : "You've reviewed all scheduled concepts for today. Come back tomorrow or add new ones."}
                 action={
                   dueCards.length > 0 && (
                     <button onClick={startReview} className="bg-primary text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90">
                       Begin Session
                     </button>
                   )
                 }
              />
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-sora font-bold text-white mb-2">Inject Concept</h2>
            <p className="text-muted text-sm mb-8">Add manual nodes to your knowledge graph. Our AI can help structure your raw notes.</p>
            <AddConceptForm />
          </div>
        )}
      </div>
    </div>
  );
}
