"use client";

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function WeeklyReportCard() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReport = async () => {
    try {
      const res = await fetch('/api/report/weekly');
      const data = await res.json();
      setReport(data.report);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/report/weekly', { method: 'POST' });
      const data = await res.json();
      setReport(data.report);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) return null;

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-sora font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            AI Mentor Report
          </h2>
          <p className="text-muted text-sm mt-1">Your weekly progress and improvement areas</p>
        </div>
        <button 
          onClick={generateReport}
          disabled={generating}
          className="p-2 bg-surface hover:bg-card-2 border border-border rounded-xl text-teal-400 transition-colors disabled:opacity-50"
          title="Generate fresh report"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {report ? (
        <div className="prose prose-invert prose-sm max-w-none relative z-10">
           <div className="text-xs text-muted mb-4 border-b border-border pb-2">
             Generated on {new Date(report.created_at).toLocaleDateString()}
           </div>
           <ReactMarkdown>{report.report_markdown}</ReactMarkdown>
        </div>
      ) : (
        <div className="text-center py-8 relative z-10">
          <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-teal-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Report Yet</h3>
          <p className="text-muted text-sm mb-4">You haven't generated a weekly report yet.</p>
          <button 
            onClick={generateReport}
            disabled={generating}
            className="px-6 py-2.5 bg-teal-500 text-bg font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate First Report
          </button>
        </div>
      )}
    </div>
  );
}
