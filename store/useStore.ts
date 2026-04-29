import { create } from 'zustand';
import { Profile, Concept, StudyPlan, Analytics } from '../types';

interface AppState {
  // Profile
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  
  // Concepts
  concepts: Concept[];
  setConcepts: (c: Concept[]) => void;
  addConcept: (c: Concept) => void;
  updateConcept: (id: number, updates: Partial<Concept>) => void;
  
  // Current plan
  activePlan: StudyPlan | null;
  setActivePlan: (p: StudyPlan) => void;
  
  // Analytics (cached)
  analytics: Analytics | null;
  setAnalytics: (a: Analytics) => void;
  
  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  currentModule: string;
  setCurrentModule: (m: string) => void;
  
  // Actions
  fetchConcepts: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;

  // Voice Tutor State
  voice: {
    isListening: boolean;
    isSpeaking: boolean;
    isThinking: boolean;
    transcript: string;
    feedback: string;
    autoSpeak: boolean;
    narrator: 'female' | 'male' | 'neutral';
  };
  setVoiceState: (updates: Partial<AppState['voice']>) => void;
  resetVoice: () => void;
}

export const useStore = create<AppState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),

  concepts: [],
  setConcepts: (concepts) => set({ concepts }),
  addConcept: (concept) => set((state) => ({ concepts: [...state.concepts, concept] })),
  updateConcept: (id, updates) => set((state) => ({
    concepts: state.concepts.map((c) => c.id === id ? { ...c, ...updates } : c)
  })),

  activePlan: null,
  setActivePlan: (activePlan) => set({ activePlan }),

  analytics: null,
  setAnalytics: (analytics) => set({ analytics }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  currentModule: '/dashboard',
  setCurrentModule: (currentModule) => set({ currentModule }),

  fetchConcepts: async () => {
    try {
      const res = await fetch('/api/concepts');
      if (res.ok) {
        const data = await res.json();
        set({ concepts: data });
      }
    } catch (e) {
      console.error('Failed to fetch concepts', e);
    }
  },

  fetchAnalytics: async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        set({ analytics: data });
      }
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    }
  },

  voice: {
    isListening: false,
    isSpeaking: false,
    isThinking: false,
    transcript: '',
    feedback: '',
    autoSpeak: true,
    narrator: 'female'
  },
  setVoiceState: (updates) => set((state) => ({ voice: { ...state.voice, ...updates } })),
  resetVoice: () => set((state) => ({
    voice: {
      isListening: false,
      isSpeaking: false,
      isThinking: false,
      transcript: '',
      feedback: '',
      autoSpeak: state.voice.autoSpeak,
      narrator: state.voice.narrator
    }
  }))
}));
