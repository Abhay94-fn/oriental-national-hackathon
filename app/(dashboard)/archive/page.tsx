"use client";

import { useState, useEffect } from 'react';
import { Archive, BookOpen, MessageSquare, CheckSquare, Route, Bookmark, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { RecommendationCard } from '../../../components/recommendations/RecommendationCard';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'notes' | 'chats' | 'evaluations' | 'paths' | 'saved'>('notes');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/archive')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-teal-400" /></div>;
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const tabs = [
    { id: 'notes', label: 'Study Notes', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'chats', label: 'Tutor Chats', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'evaluations', label: 'Evaluations', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'paths', label: 'Learning Paths', icon: <Route className="w-4 h-4" /> },
    { id: 'saved', label: 'Bookmarks', icon: <Bookmark className="w-4 h-4" /> }
  ] as const;

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      <div className="flex items-center gap-3 mb-8 border-b border-border pb-6">
        <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
          <Archive className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-sora font-bold text-white">My Archive</h1>
          <p className="text-muted text-sm mt-1">Access all your past generated content and saved resources.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-teal-500 text-bg shadow-lg shadow-teal-500/20' 
                : 'bg-surface border border-border text-muted hover:text-white hover:border-teal-400/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {data?.notes?.length === 0 && <p className="text-muted">No notes generated yet.</p>}
            {data?.notes?.map((note: any) => (
              <div key={note.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <button onClick={() => toggleExpand(`note-${note.id}`)} className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-surface/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-white text-lg">{note.topic}</h3>
                    <p className="text-sm text-muted">{note.subtopic} • {new Date(note.created_at).toLocaleDateString()}</p>
                  </div>
                  {expandedId === `note-${note.id}` ? <ChevronUp className="text-muted" /> : <ChevronDown className="text-muted" />}
                </button>
                {expandedId === `note-${note.id}` && (
                  <div className="px-6 pb-6 pt-2 border-t border-border bg-surface/20">
                    <div className="prose prose-invert max-w-none prose-sm mt-4">
                      <ReactMarkdown>{note.summary}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <div className="space-y-4">
            {data?.chats?.length === 0 && <p className="text-muted">No chat history available.</p>}
            {data?.chats?.map((chat: any) => (
              <div key={chat.sessionId} className="bg-card border border-border rounded-2xl overflow-hidden">
                <button onClick={() => toggleExpand(`chat-${chat.sessionId}`)} className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-surface/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-white text-lg">{chat.subject} Session</h3>
                    <p className="text-sm text-muted">{chat.messages.length} messages • {new Date(chat.createdAt).toLocaleDateString()}</p>
                  </div>
                  {expandedId === `chat-${chat.sessionId}` ? <ChevronUp className="text-muted" /> : <ChevronDown className="text-muted" />}
                </button>
                {expandedId === `chat-${chat.sessionId}` && (
                  <div className="px-6 py-4 border-t border-border bg-surface/20 space-y-4">
                    {chat.messages.map((m: any, i: number) => (
                      <div key={i} className={`p-4 rounded-2xl max-w-[85%] ${m.role === 'user' ? 'bg-teal-500/10 text-teal-100 ml-auto border border-teal-500/20' : 'bg-surface border border-border text-white mr-auto'}`}>
                        <div className="text-xs text-muted mb-1 font-bold">{m.role === 'user' ? 'You' : 'AI Tutor'}</div>
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Evaluations Tab */}
        {activeTab === 'evaluations' && (
          <div className="space-y-4">
            {data?.evaluations?.length === 0 && <p className="text-muted">No assignments evaluated yet.</p>}
            {data?.evaluations?.map((ev: any) => (
              <div key={ev.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <button onClick={() => toggleExpand(`ev-${ev.id}`)} className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-surface/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-white text-lg line-clamp-1">{ev.question}</h3>
                    <p className="text-sm text-muted">{ev.subject} • Score: {ev.score}/100 • {new Date(ev.created_at).toLocaleDateString()}</p>
                  </div>
                  {expandedId === `ev-${ev.id}` ? <ChevronUp className="text-muted" /> : <ChevronDown className="text-muted" />}
                </button>
                {expandedId === `ev-${ev.id}` && (
                  <div className="px-6 pb-6 pt-4 border-t border-border bg-surface/20 space-y-4">
                     <div><strong className="text-teal-400 text-sm">Your Answer:</strong><p className="text-white text-sm mt-1 bg-background p-3 rounded-xl border border-border">{ev.student_answer}</p></div>
                     <div><strong className="text-primary text-sm">Feedback:</strong><p className="text-white text-sm mt-1">{ev.feedback}</p></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Paths Tab */}
        {activeTab === 'paths' && (
          <div className="space-y-4">
            {data?.paths?.length === 0 && <p className="text-muted">No learning paths generated.</p>}
            {data?.paths?.map((path: any) => (
              <div key={path.id} className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-white text-lg">{path.target_exam} Roadmap</h3>
                <p className="text-sm text-muted mb-4">Level: {path.current_level} • {new Date(path.created_at).toLocaleDateString()}</p>
                <div className="space-y-3">
                  {JSON.parse(path.path_json).phases?.map((phase: any, i: number) => (
                    <div key={i} className="bg-surface border border-border p-4 rounded-xl">
                      <strong className="text-teal-400 text-sm">{phase.phaseName}</strong>
                      <p className="text-xs text-muted mt-1">{phase.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Saved Resources Tab */}
        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.savedResources?.length === 0 && <p className="text-muted col-span-full">No bookmarks saved yet.</p>}
            {data?.savedResources?.map((res: any) => (
              <RecommendationCard 
                 key={res.id} 
                 recommendation={{ id: res.id, title: res.title, type: res.type, link: res.url, description: res.description, reason: 'Saved bookmark', difficulty: 'Beginner' }} 
                 isSaved={true} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
