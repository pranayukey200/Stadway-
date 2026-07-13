import { create } from 'zustand';

export interface FanProfile {
  id: string;
  name: string;
  language: string;
  accessibilityNeeds: string[];
  ticketZone: string;
  seat: string;
  homeCity?: string;
}

export interface GateState {
  occupancyPct: number;
  queueLength: number;
  status: 'smooth' | 'moderate' | 'congested';
}

export interface TransitLineState {
  etaMins: number;
  delayMins: number;
}

export interface VenueState {
  gates: Record<string, GateState>;
  transit: Record<string, TransitLineState>;
  weather: {
    condition: string;
    tempC: number;
  };
  updatedAt: string;
  overrideAnnouncement?: string;
}

export interface AgentTrailItem {
  agent: string;
  input: any;
  reasoning: string;
  output: any;
}

export interface DecisionResult {
  id: string;
  fanId: string;
  agentTrail: AgentTrailItem[];
  finalRecommendation: string;
  confidence: number;
  createdAt: string;
}

export interface VolunteerTask {
  id: string;
  requestedLanguage: string;
  requiredSkill: string;
  location: string;
  status: 'pending' | 'accepted' | 'completed';
  matchedVolunteerId?: string;
  description: string;
  createdAt: string;
}

export interface AccessibilitySettings {
  textScale: 'normal' | 'lg' | 'xl';
  highContrast: boolean;
  reducedMotion: boolean;
  simplifiedLanguage: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  decision?: DecisionResult;
  thinking?: boolean;
}

interface StadWayStore {
  // App state
  persona: 'fan' | 'volunteer' | 'organizer';
  isDemoMode: boolean;
  fanProfile: FanProfile | null;
  venueState: VenueState | null;
  tasks: VolunteerTask[];
  chatHistory: ChatMessage[];
  isChatLoading: boolean;
  accessibilitySettings: AccessibilitySettings;
  activeRecommendation: DecisionResult | null;
  
  // Sustainability gamification
  co2SavedKg: number;
  sustainabilityPoints: number;

  // Navigation target
  activeNavigationTarget: string | null;

  // Actions
  setPersona: (persona: 'fan' | 'volunteer' | 'organizer') => void;
  setDemoMode: (isDemoMode: boolean) => void;
  setFanProfile: (profile: FanProfile | null) => void;
  setVenueState: (state: VenueState | null) => void;
  setTasks: (tasks: VolunteerTask[]) => void;
  setAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateChatMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearChat: () => void;
  setActiveRecommendation: (rec: DecisionResult | null) => void;
  addCo2Savings: (kg: number) => void;
  setActiveNavigationTarget: (target: string | null) => void;
}

export const useStore = create<StadWayStore>((set) => ({
  persona: 'fan',
  isDemoMode: false,
  fanProfile: null,
  venueState: null,
  tasks: [],
  chatHistory: [],
  isChatLoading: false,
  accessibilitySettings: {
    textScale: 'normal',
    highContrast: false,
    reducedMotion: false,
    simplifiedLanguage: false,
  },
  activeRecommendation: null,
  co2SavedKg: 4.2, // Seed with some default fun data
  sustainabilityPoints: 420,
  activeNavigationTarget: null,

  setPersona: (persona) => set({ persona }),
  setDemoMode: (isDemoMode) => set({ isDemoMode }),
  setFanProfile: (fanProfile) => set({ fanProfile }),
  setVenueState: (venueState) => set({ venueState }),
  setTasks: (tasks) => set({ tasks }),
  setAccessibilitySettings: (settings) =>
    set((state) => ({
      accessibilitySettings: { ...state.accessibilitySettings, ...settings },
    })),
  addChatMessage: (msg) => {
    const id = Math.random().toString(36).substring(7);
    const newMsg: ChatMessage = {
      ...msg,
      id,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ chatHistory: [...state.chatHistory, newMsg] }));
    return id;
  },
  updateChatMessage: (id, updates) =>
    set((state) => ({
      chatHistory: state.chatHistory.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),
  clearChat: () => set({ chatHistory: [] }),
  setActiveRecommendation: (activeRecommendation) => set({ activeRecommendation }),
  addCo2Savings: (kg) =>
    set((state) => ({
      co2SavedKg: parseFloat((state.co2SavedKg + kg).toFixed(2)),
      sustainabilityPoints: state.sustainabilityPoints + Math.round(kg * 100),
    })),
  setActiveNavigationTarget: (activeNavigationTarget) => set({ activeNavigationTarget }),
}));
