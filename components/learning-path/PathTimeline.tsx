import { LearningPath } from '../../types';
import { CheckCircle2, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Props {
  path: LearningPath;
}

export function PathTimeline({ path }: Props) {
  const [expandedPhases, setExpandedPhases] = useState<number[]>([0]); // Expand first by default

  const togglePhase = (idx: number) => {
    setExpandedPhases(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-xl font-sora font-bold text-foreground mb-1">Your Journey to {path.targetExam}</h2>
          <p className="text-muted text-sm">Starting from: <span className="text-primary font-medium">{path.currentLevel}</span></p>
        </div>
        <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl border border-border">
          <Clock className="w-5 h-5 text-teal-400" />
          <span className="font-bold text-foreground">{path.totalEstimatedHours} <span className="text-muted font-normal text-sm">hours</span></span>
        </div>
      </div>

      <div className="relative border-l-2 border-border/50 ml-6 pl-8 space-y-12 py-4">
        {path.phases.map((phase, pIdx) => {
          const isExpanded = expandedPhases.includes(pIdx);
          
          return (
            <div key={pIdx} className="relative">
              {/* Phase Dot */}
              <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-surface border-2 border-primary flex items-center justify-center z-10">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>

              {/* Phase Header */}
              <div 
                className="bg-card hover:bg-card-2 border border-border rounded-2xl p-5 cursor-pointer transition-colors"
                onClick={() => togglePhase(pIdx)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{phase.phaseName}</h3>
                    <p className="text-sm text-muted">{phase.description}</p>
                  </div>
                  <div className="p-2 bg-surface rounded-lg text-muted">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Phase Milestones */}
              {isExpanded && (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-4">
                  {phase.milestones.map((milestone, mIdx) => (
                    <div key={mIdx} className="bg-surface border border-border/50 rounded-xl p-4 ml-6 relative group">
                      <div className="absolute -left-[35px] top-1/2 -translate-y-1/2 w-4 h-4 bg-surface border border-border rounded-full flex items-center justify-center group-hover:border-teal-400 transition-colors">
                        <CheckCircle2 className="w-3 h-3 text-transparent group-hover:text-teal-400 transition-colors" />
                      </div>
                      
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-foreground">{milestone.title}</h4>
                        <span className="text-xs font-medium text-muted bg-card px-2 py-1 rounded-md border border-border flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {milestone.estimatedHours}h
                        </span>
                      </div>
                      <p className="text-sm text-muted mb-3">{milestone.description}</p>
                      
                      {milestone.resources.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {milestone.resources.map((res: any, rIdx) => {
                            const isString = typeof res === 'string';
                            const title = isString ? res : res.title;
                            const link = isString ? undefined : res.link;
                            
                            if (link) {
                              return (
                                <a 
                                  key={rIdx} 
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary/80 bg-primary/10 px-2 py-1 rounded border border-primary/20 flex items-center gap-1 hover:bg-primary/20 hover:text-primary transition-colors"
                                >
                                  <MapPin className="w-3 h-3" /> {title}
                                </a>
                              );
                            }
                            
                            return (
                              <span key={rIdx} className="text-xs text-primary/80 bg-primary/10 px-2 py-1 rounded border border-primary/20 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {title}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
