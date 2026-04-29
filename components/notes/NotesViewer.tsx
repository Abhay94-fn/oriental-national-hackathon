import ReactMarkdown from 'react-markdown';
import { Download, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import jsPDF from 'jspdf';

interface Props {
  markdown: string;
  topic: string;
}

export function NotesViewer({ markdown, topic }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // We'll do a very basic text dump for PDF, or we could use html2canvas + jspdf for better rendering.
    // For simplicity, we just add text to PDF line by line or split by pages.
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(topic, 20, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    const splitText = doc.splitTextToSize(markdown.replace(/[*#_]/g, ''), 170);
    let y = 30;
    for (let i = 0; i < splitText.length; i++) {
        if (y > 280) {
            y = 20;
            doc.addPage();
        }
        doc.text(splitText[i], 20, y);
        y += 7;
    }
    
    doc.save(`${topic.replace(/\s+/g, '_')}_Notes.pdf`);
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl">
      <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
        <h2 className="text-xl font-sora font-bold text-white">Study Notes</h2>
        <div className="flex gap-3">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-card-2 border border-border rounded-lg text-sm font-medium transition-colors text-muted hover:text-white"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>
      
      <div className="prose prose-invert prose-p:text-muted prose-headings:text-white max-w-none">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
