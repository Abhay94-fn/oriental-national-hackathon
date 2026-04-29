"use client";

import { useState, useRef } from 'react';
import { useStore } from '../../../store/useStore';
import { NotesViewer } from '../../../components/notes/NotesViewer';
import { FileText, Loader2, BookOpen, AlertCircle, UploadCloud, Image as ImageIcon, X, CheckCircle2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotesPage() {
  const { profile } = useStore();
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [notes, setNotes] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // OCR State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setIsOcrProcessing(true);
    setError('');

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m)
      });
      setExtractedText(result.data.text);
    } catch (err) {
      setError('Failed to extract text from the image. Please try a clearer image.');
      setSelectedImage(null);
      setImagePreview(null);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setExtractedText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateNotes = async () => {
    if (!topic && !extractedText) {
      setError('Please enter a topic or upload handwritten notes to proceed.');
      return;
    }

    setIsLoading(true);
    setError('');
    setNotes('');

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || 'Custom Handwritten Notes',
          subject,
          extractedText,
          exam: profile?.exam || 'Competitive Exams'
        })
      });

      if (!res.ok) throw new Error('Failed to generate notes');
      
      const data = await res.json();
      setNotes(data.markdown);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-sm">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         
         <div className="relative z-10">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-primary/10 text-primary rounded-xl">
               <FileText className="w-6 h-6" />
             </div>
             <h1 className="text-3xl font-extrabold text-foreground tracking-tight">AI Study Notes</h1>
           </div>
           <p className="text-muted-foreground text-[15px] mb-8 max-w-2xl leading-relaxed">
             Generate comprehensive, exam-oriented study notes instantly. Type a topic or <strong className="text-foreground">upload a photo of your handwritten notes</strong> to have the AI digitize and expand upon them.
           </p>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
             <div className="md:col-span-1 space-y-2">
               <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider ml-1 flex items-center gap-2">
                 <BookOpen className="w-4 h-4" /> Subject
               </label>
               <select 
                 value={subject}
                 onChange={(e) => setSubject(e.target.value)}
                 className="w-full bg-card-2 border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none font-medium text-sm"
               >
                 <option value="Physics">Physics</option>
                 <option value="Chemistry">Chemistry</option>
                 <option value="Mathematics">Mathematics</option>
                 <option value="Biology">Biology</option>
                 <option value="Computer Science">Computer Science</option>
                 <option value="General Studies">General Studies</option>
               </select>
             </div>
             <div className="md:col-span-2 space-y-2">
               <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider ml-1 flex items-center gap-2">
                 <FileText className="w-4 h-4" /> Topic
               </label>
               <input 
                 type="text" 
                 value={topic}
                 onChange={(e) => setTopic(e.target.value)}
                 className="w-full bg-card border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm shadow-sm"
                 placeholder="e.g., Thermodynamics, Newton's Laws"
                 onKeyDown={(e) => e.key === 'Enter' && generateNotes()}
               />
             </div>
           </div>

           {/* Handwritten Notes OCR Upload Zone */}
           <div className="mb-8">
             <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider ml-1 flex items-center gap-2 mb-2">
               <ImageIcon className="w-4 h-4" /> Digitize Handwritten Notes (Optional)
             </label>
             
             {!selectedImage ? (
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="border-2 border-dashed border-border hover:border-primary/50 bg-card-2/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
               >
                 <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform border border-border">
                   <UploadCloud className="w-6 h-6 text-primary" />
                 </div>
                 <p className="text-sm font-semibold text-foreground mb-1">Click to upload image</p>
                 <p className="text-[13px] text-muted-foreground max-w-xs">Supported formats: JPG, PNG. We will extract text via OCR and feed it to the AI.</p>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleImageUpload} 
                   accept="image/*" 
                   className="hidden" 
                 />
               </div>
             ) : (
               <div className="relative border border-border rounded-2xl p-4 bg-card-2/50 flex flex-col md:flex-row gap-6 items-start">
                 <button onClick={removeImage} className="absolute top-3 right-3 p-1.5 bg-background rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors shadow-sm">
                   <X className="w-4 h-4" />
                 </button>
                 <div className="w-full md:w-48 h-32 relative rounded-xl overflow-hidden border border-border shrink-0 bg-black/5">
                   <img src={imagePreview!} alt="Uploaded note" className="object-cover w-full h-full" />
                 </div>
                 <div className="flex-1 w-full min-w-0 pt-1">
                   <div className="flex items-center gap-2 mb-2">
                     <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                       {isOcrProcessing ? <><Loader2 className="w-4 h-4 animate-spin text-primary" /> Extracting text via OCR...</> : <><CheckCircle2 className="w-4 h-4 text-green-500" /> Text Extracted Successfully</>}
                     </h3>
                   </div>
                   {!isOcrProcessing && extractedText && (
                     <div className="bg-background border border-border rounded-xl p-3 h-20 overflow-y-auto custom-scrollbar">
                       <p className="text-[12px] font-mono text-muted-foreground leading-relaxed">
                         {extractedText.length > 300 ? extractedText.slice(0, 300) + '...' : extractedText}
                       </p>
                     </div>
                   )}
                 </div>
               </div>
             )}
           </div>

           <button
             onClick={generateNotes}
             disabled={isLoading || isOcrProcessing}
             className="w-full bg-primary text-primary-foreground font-bold px-6 py-4 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99]"
           >
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
             {isLoading ? 'Synthesizing knowledge...' : 'Generate Smart Notes'}
           </button>
         </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {notes && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <NotesViewer markdown={notes} topic={topic || 'Custom Handwritten Notes'} />
        </div>
      )}
    </div>
  );
}
