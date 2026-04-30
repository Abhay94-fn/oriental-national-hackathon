export interface Profile {
  id: number;
  name: string;
  exam: string;
  examDate: string;
  dailyHours: number;
  streak: number;
  lastActive: string;
  role?: string;
}

export interface Concept {
  id: number;
  topic: string;
  subtopic: string;
  summary: string;
  tags: string[];
  source: string;
  ef: number;
  interval: number;
  reps: number;
  nextReview: string;
  strength: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  time: string;
  subject: string;
  topic: string;
  type: 'Learn' | 'Revise' | 'Practice' | 'Mock Test' | 'Break';
  priority: 'High' | 'Medium' | 'Low';
  resources: string[];
  description: string;
  pomodoroCount: number;
}

export interface PlanDay {
  day: string;
  date: string;
  theme: string;
  totalHours: number;
  sessions: StudySession[];
  target: string;
  motiveTip: string;
  completionPct: number;
}

export interface StudyPlan {
  summary: string;
  weeklyHours: number;
  examCountdown: number;
  days: PlanDay[];
  tipsForWeek: string[];
  weeklyTarget: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  concept: string;
  difficulty: string;
  marks: number;
  negativeMarking: number;
  pyqYear?: string;
  tags: string[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ConceptNote {
    name: string;
    explanation: string;
    formula?: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    examWeight: string;
    mnemonic?: string;
}

export interface MindMapNode {
    node: string;
    children: string[];
}

export interface PracticeQ {
    question: string;
    hint: string;
    answer: string;
}

export interface LabNotes {
  title: string;
  subject: string;
  estimatedStudyTime: string;
  examRelevance: string;
  keyPoints: string[];
  concepts: ConceptNote[];
  summary: string;
  mindMap: MindMapNode[];
  practiceQuestions: PracticeQ[];
  keyFormulas: string[];
  importantForExam: string;
  relatedTopics: string[];
  ncertReference: string;
  videoId?: string;
  dbId?: number;
}

export interface SubjectStat {
    subject: string;
    count: number;
    avgStrength: number;
    due: number;
}

export interface DayActivity {
    date: string;
    cardsReviewed: number;
    minutesStudied: number;
}

export interface CurvePoint {
    day: number;
    retention: number;
}

export interface Analytics {
  totalConcepts: number;
  dueToday: number;
  masteredConcepts: number;
  weakConcepts: number;
  avgStrength: number;
  subjectBreakdown: SubjectStat[];
  studyStreak: number;
  weeklyActivity: DayActivity[];
  forgettingCurveData: CurvePoint[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'Course' | 'Project' | 'Tutorial' | 'Video';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  link?: string;
  reason: string;
}

export interface PathMilestone {
  title: string;
  description: string;
  estimatedHours: number;
  resources: { title: string; link: string }[];
}

export interface LearningPhase {
  phaseName: string;
  description: string;
  milestones: PathMilestone[];
}

export interface LearningPath {
  targetExam: string;
  currentLevel: string;
  totalEstimatedHours: number;
  phases: LearningPhase[];
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  improvements: string[];
  modelAnswer: string;
}
