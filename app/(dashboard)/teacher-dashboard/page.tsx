"use client";

import { useEffect, useState } from 'react';
import { useStore } from '../../../store/useStore';
import { useRouter } from 'next/navigation';
import {
  Users, FileText, CheckCircle2, TrendingUp, Loader2,
  BookOpen, Upload, Database, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSubjectsForExam } from '../../../lib/subjects';
import MentorLogo from "@/public/Mentor.png";

// ─── Knowledge Upload Panel ──────────────────────────────────────────────────

function KnowledgePanel() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('General Studies');
  const [exam, setExam] = useState('UPSC');
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [expanded, setExpanded] = useState(true);

  const subjects = getSubjectsForExam(exam);

  const fetchDocs = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch('/api/teacher/knowledge');
      if (res.ok) {
        const data = await res.json();
        setDocs(data.documents || []);
      }
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/teacher/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, subject, exam })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`✅ Indexed in "${data.namespace}"`);
        setTitle('');
        setContent('');
        fetchDocs();
      } else {
        setSuccessMsg(`❌ ${data.error}`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-card-2/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
            <Database className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-foreground">Knowledge Base (RAG)</h2>
            <p className="text-sm text-muted-foreground">Upload curriculum content — students' AI Tutor will use it automatically.</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Form */}
              <form onSubmit={handleUpload} className="space-y-4 border border-border rounded-xl p-5 bg-card-2/30">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" /> Add Knowledge Document
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Exam</label>
                    <input
                      value={exam}
                      onChange={e => setExam(e.target.value)}
                      placeholder="e.g. UPSC, CAT, JEE"
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Subject</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary appearance-none transition-colors"
                    >
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Title (optional)</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Chapter 4 — Mauryan Empire"
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1 block">Content</label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Paste lecture notes, chapter summaries, or any curriculum content here..."
                    rows={6}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary resize-none transition-colors"
                    required
                  />
                </div>

                {successMsg && (
                  <p className={`text-sm font-medium ${successMsg.startsWith('✅') ? 'text-green-500' : 'text-red-400'}`}>
                    {successMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Embedding & Indexing...' : 'Upload to Knowledge Base'}
                </button>
              </form>

              {/* Indexed Documents */}
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-teal-500" /> Indexed Documents
                  <span className="ml-auto text-xs font-bold bg-teal-500/10 text-teal-500 px-2 py-0.5 rounded-full">{docs.length}</span>
                </h3>
                {loadingDocs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : docs.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                    No documents uploaded yet.<br />
                    <span className="text-xs">Add content above to power the AI Tutor with curriculum knowledge.</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                    {docs.map((doc) => (
                      <div key={doc.source_id} className="p-3 rounded-xl bg-card border border-border">
                        <p className="text-sm text-foreground font-medium leading-relaxed">{doc.preview}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const { profile } = useStore();
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && profile.role !== 'teacher') {
      router.push('/dashboard');
    }
  }, [profile, router]);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch('/api/teacher/students');
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (e) {
        console.error('Failed to fetch students', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const studentsWithScores = students.filter(s => s.avg_score);
  const avgScore = studentsWithScores.length > 0
    ? studentsWithScores.reduce((sum, s) => sum + s.avg_score, 0) / studentsWithScores.length
    : 0;
  const totalTests = students.reduce((sum, s) => sum + (s.tests_taken || 0), 0);

  const stats = [
    { label: 'Total Students', value: students.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Class Average', value: `${Math.round(avgScore)}%`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Tests Taken', value: totalTests, icon: CheckCircle2, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: 'Notes Generated', value: students.reduce((sum, s) => sum + (s.notes_generated || 0), 0), icon: FileText, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="mb-4 hidden md:block">
           <img src={MentorLogo.src} alt="Mentor" className="h-8 w-auto object-contain opacity-80 mix-blend-multiply dark:mix-blend-normal dark:opacity-100" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Educator Dashboard</h1>
        <p className="text-muted-foreground font-medium mt-1">Monitor student progress and manage AI curriculum knowledge.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-5 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-muted-foreground text-sm">{stat.label}</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Knowledge Base (RAG) Panel */}
      <KnowledgePanel />

      {/* Student Roster */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border bg-card-2 flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Student Roster</h2>
          <span className="ml-auto text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{students.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-card-2/50 text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Target Exam</th>
                <th className="px-6 py-4">Avg Score</th>
                <th className="px-6 py-4">Tests Taken</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-card-2/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{student.name}</div>
                    <div className="text-xs text-muted-foreground">{student.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold">
                      {student.exam}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-sm ${
                      !student.avg_score ? 'text-muted-foreground' :
                      student.avg_score >= 70 ? 'text-green-500' :
                      student.avg_score >= 50 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {student.avg_score ? `${Math.round(student.avg_score)}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium">{student.tests_taken}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(student.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No students registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
