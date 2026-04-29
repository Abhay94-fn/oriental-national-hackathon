import { Recommendation } from '../../types';
import { BookOpen, Code, Video, Link2, ExternalLink, Bookmark, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface Props {
  recommendation: Recommendation;
  isSaved?: boolean;
}

export function RecommendationCard({ recommendation, isSaved = false }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(isSaved);

  const handleSave = async () => {
     if (saved) return;
     setSaving(true);
     try {
        await fetch('/api/bookmarks', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
              title: recommendation.title,
              type: recommendation.type,
              url: recommendation.link,
              description: recommendation.description
           })
        });
        setSaved(true);
     } catch (e) {
        console.error('Failed to save bookmark', e);
     } finally {
        setSaving(false);
     }
  };

  const getIcon = () => {
    switch (recommendation.type) {
      case 'Course': return <BookOpen className="w-5 h-5" />;
      case 'Project': return <Code className="w-5 h-5" />;
      case 'Video':
      case 'Tutorial': return <Video className="w-5 h-5" />;
      default: return <Link2 className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = () => {
    switch (recommendation.difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Intermediate': return 'text-primary bg-primary/10 border-primary/20';
      case 'Advanced': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-muted bg-surface border-border';
    }
  };

  return (
    <div className="bg-card border border-border hover:border-primary/50 transition-all duration-300 rounded-2xl p-6 group flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-surface rounded-xl border border-border group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {getIcon()}
        </div>
        <div className="flex flex-col items-end gap-2">
           <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface border border-border text-muted">
             {recommendation.type}
           </span>
           <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getDifficultyColor()}`}>
             {recommendation.difficulty}
           </span>
        </div>
      </div>
      
      <h3 className="text-lg font-sora font-bold text-white mb-2 leading-tight">
        {recommendation.title}
      </h3>
      
      <p className="text-sm text-muted mb-4 flex-1">
        {recommendation.description}
      </p>
      
      <div className="bg-surface/50 rounded-xl p-3 mb-4 border border-border/50">
        <p className="text-xs text-muted/80">
          <span className="font-semibold text-primary/80 mr-1">Why?</span>
          {recommendation.reason || recommendation.description}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        {recommendation.link ? (
          <a 
            href={recommendation.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface hover:bg-card-2 border border-border rounded-xl text-sm font-medium transition-colors"
          >
            View Resource
            <ExternalLink className="w-4 h-4" />
          </a>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface/50 border border-border/50 rounded-xl text-sm font-medium text-muted cursor-not-allowed">
            No link
          </div>
        )}

        {!isSaved && (
           <button 
             onClick={handleSave}
             disabled={saving || saved}
             className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
               saved 
                 ? 'bg-primary/20 border-primary text-primary' 
                 : 'bg-surface border-border hover:border-primary text-muted hover:text-primary'
             }`}
             title={saved ? "Saved to Archive" : "Bookmark this"}
           >
             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" fill={saved ? "currentColor" : "none"} />}
           </button>
        )}
      </div>
    </div>
  );
}
