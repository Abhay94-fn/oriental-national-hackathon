import { useState } from 'react';
import { Youtube, Search, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';

export function VideoProcessor({ onProcess }: { onProcess: (url: string, language: string) => void }) {
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('English');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsProcessing(true);
    await onProcess(url, language);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="text-center mb-8 shrink-0">
          <h2 className="text-2xl md:text-3xl font-sora font-bold text-white mb-3">AI Content Lab</h2>
          <p className="text-muted max-w-lg mx-auto">Paste any YouTube lecture link. Abhay Parth will digest the video and produce structured, exam-focused study notes instantly.</p>
        </div>

       <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-red-500/10 transition-colors" />
          
          <div className="space-y-6 relative z-10">
             <div>
                <label className="text-sm font-bold text-muted mb-2 block tracking-wider uppercase">Video Source</label>
                <div className="relative">
                   <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                   <input
                     type="url"
                     required
                     value={url}
                     onChange={(e) => setUrl(e.target.value)}
                     placeholder="https://www.youtube.com/watch?v=..."
                     className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow placeholder:text-gray-600"
                   />
                </div>
             </div>

             <div>
                <label className="text-sm font-bold text-muted mb-2 block tracking-wider uppercase">Extraction Language</label>
                <div className="flex flex-wrap gap-3">
                   {['English', 'Hindi', 'Hinglish', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati'].map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${language === lang ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-surface border border-border text-muted hover:text-white'}`}
                      >
                         {lang}
                      </button>
                   ))}
                </div>
             </div>

             <button
               type="submit"
               disabled={isProcessing || !url.trim()}
               className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-500/90 hover:to-rose-600/90 text-white font-bold text-sm sm:text-base py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed mt-4 relative overflow-hidden"
             >
                {isProcessing ? (
                  <>
                     <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                     <span className="relative z-10">Processing Transcript...</span>
                     <div className="absolute inset-0 bg-white/10 animate-pulse" />
                  </>
                ) : (
                  <>
                     <Sparkles className="w-5 h-5" /> Extract Knowledge <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
             </button>
          </div>
       </form>

       <div className="text-center text-xs text-muted flex items-center justify-center gap-2">
          <span>Supported platforms:</span>
          <Badge variant="neutral">YouTube</Badge>
       </div>
    </div>
  );
}
