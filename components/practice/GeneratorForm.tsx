import { useState, useEffect } from "react";
import { Settings, Target, Zap, Loader2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { useStore } from "../../store/useStore";

interface Props {
  onGenerate: (config: any) => void;
  isGenerating: boolean;
}

export function GeneratorForm({ onGenerate, isGenerating }: Props) {
  const { profile } = useStore();
  
  const getSubjectsForExam = (exam?: string) => {
    if (!exam) return ['Physics', 'Chemistry', 'Maths', 'Biology'];
    const e = exam.toLowerCase();
    if (e.includes('jee')) return ['Physics', 'Chemistry', 'Mathematics'];
    if (e.includes('neet') || e.includes('medical')) return ['Physics', 'Chemistry', 'Biology', 'Zoology', 'Botany'];
    if (e.includes('upsc') || e.includes('ias') || e.includes('civil')) return ['History', 'Geography', 'Polity', 'Economics', 'Environment', 'Science & Tech'];
    if (e.includes('cat') || e.includes('mba')) return ['Quantitative', 'DILR', 'VARC'];
    if (e.includes('bank') || e.includes('ssc') || e.includes('rrb')) return ['Quant', 'Reasoning', 'English', 'General Awareness'];
    if (e.includes('gate')) return ['Engineering Math', 'Aptitude', 'Core Subject'];
    if (e.includes('clat') || e.includes('law')) return ['Legal Reasoning', 'Logical Reasoning', 'English', 'GK'];
    return ['Physics', 'Chemistry', 'Maths', 'Biology']; // Default fallback
  };

  const dynamicSubjects = getSubjectsForExam(profile?.exam);
  
  const [subject, setSubject] = useState(dynamicSubjects[0]);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState('3');

  // Re-sync subject selection if the target exam dynamically updates
  useEffect(() => {
    if (profile?.exam) {
      const freshSubjects = getSubjectsForExam(profile.exam);
      if (!freshSubjects.includes(subject)) {
        setSubject(freshSubjects[0]);
      }
    }
  }, [profile?.exam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ subject, topic, difficulty, count: parseInt(count) });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
       {/* Background accent */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
       
       <div className="mb-8 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-sora font-bold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-teal-400" /> Adaptive Test Engine
            </h2>
            {profile?.exam && (
               <button 
                 type="button"
                 className="cursor-pointer hover:opacity-80 transition-all active:scale-95 flex items-center gap-1"
                 onClick={() => {
                   const newExam = window.prompt("Change your Target Exam (e.g. UPSC, JEE):", profile.exam);
                   if (newExam && newExam.trim() !== '') {
                     const updatedProfile = { ...profile, exam: newExam.trim() };
                     localStorage.setItem('abhaypath_profile', JSON.stringify(updatedProfile));
                     useStore.setState({ profile: updatedProfile });
                   }
                 }}
                 title="Click to quickly change Target Exam"
               >
                 <Badge variant="success">Tailored for {profile.exam} ✎</Badge>
               </button>
            )}
          </div>
          <p className="text-muted text-sm mt-1">Configure your practice parameters for targeted improvement.</p>
       </div>

       <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-muted mb-2">Subject</label>
               <div className="flex flex-wrap gap-2">
                  {dynamicSubjects.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubject(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${subject === s ? 'bg-primary text-black font-bold' : 'bg-surface text-muted border border-border hover:border-muted'}`}
                    >
                      {s}
                    </button>
                  ))}
               </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-muted mb-2">Number of Questions</label>
               <div className="flex flex-wrap gap-2">
                  {['2', '3', '5', '10'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCount(c)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${count === c ? 'bg-teal-400 text-black font-bold' : 'bg-surface text-muted border border-border hover:border-muted'}`}
                    >
                      {c}
                    </button>
                  ))}
               </div>
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-muted mb-2">Difficulty Tier</label>
             <div className="flex gap-3">
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                       difficulty === d 
                         ? `border-${d === 'Hard' ? 'red' : d === 'Medium' ? 'orange' : 'green'}-500 bg-surface shadow-inner` 
                         : 'border-border bg-surface/50 text-muted opacity-60 hover:opacity-100'
                    }`}
                  >
                     <span className={`text-sm font-bold ${difficulty === d ? 'text-white' : ''}`}>{d}</span>
                     {difficulty === d && <Badge variant={d === 'Hard' ? 'danger' : d === 'Medium' ? 'warning' : 'success'}>Selected</Badge>}
                  </button>
                ))}
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">Specific Topic (Optional)</label>
            <input 
              type="text" 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Leave blank for mixed syllabus, or type 'Thermodynamics'"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-shadow"
            />
          </div>
       </div>

       <button
          type="submit"
          disabled={isGenerating}
          className="w-full mt-8 bg-gradient-to-r from-teal-400 to-emerald-500 hover:opacity-90 text-black font-bold text-base py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] flex items-center justify-center gap-3 relative z-10"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Compiling Questions...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" /> Let's Practice
            </>
          )}
        </button>
    </form>
  );
}
