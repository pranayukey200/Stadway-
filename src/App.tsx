import React, { useEffect, useState } from 'react';
import { useStore } from './context/useStore';
import { db } from './utils/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { LandingPage } from './views/LandingPage';
import { FanView } from './views/FanView';
import { VolunteerView } from './views/VolunteerView';
import { OrganizerConsole } from './views/OrganizerConsole';
import { DemoPanel } from './views/DemoPanel';
import { ThreeDBackground } from './components/ThreeDBackground';
import { User, Users, ShieldAlert, Sliders, X, Sparkles, Trophy } from 'lucide-react';

const App: React.FC = () => {
  const { 
    persona, setPersona, 
    venueState, setVenueState,
    accessibilitySettings,
    setDemoMode
  } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);

  const handleMainScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const scrollHeight = target.scrollHeight - target.clientHeight;
    if (scrollHeight <= 0) return;
    const pct = target.scrollTop / scrollHeight;

    // Define colors to interpolate based on scroll depth:
    // 0.00 (Hero) -> #070D1E (deep midnight blue)
    // 0.15 (Wayfinding) -> #0F172A (dark slate)
    // 0.35 (Crowd & Safety) -> #064E3B (dark green)
    // 0.55 (Accessibility) -> #701A75 (dark magenta)
    // 0.70 (Transit/Sustainability) -> #7C2D12 (dark orange)
    // 0.85 (Operations) -> #78350F (dark gold)
    // 1.00 (Closing CTA) -> #7F1D1D (dark crimson red)
    const steps = [
      { pct: 0.0, color: [7, 13, 30] },
      { pct: 0.15, color: [15, 23, 42] },
      { pct: 0.35, color: [6, 78, 59] },
      { pct: 0.55, color: [112, 26, 117] },
      { pct: 0.70, color: [124, 45, 18] },
      { pct: 0.85, color: [120, 53, 15] },
      { pct: 1.0, color: [127, 29, 29] }
    ];

    let start = steps[0];
    let end = steps[steps.length - 1];
    for (let i = 0; i < steps.length - 1; i++) {
      if (pct >= steps[i].pct && pct <= steps[i + 1].pct) {
        start = steps[i];
        end = steps[i + 1];
        break;
      }
    }

    const range = end.pct - start.pct;
    const factor = range > 0 ? (pct - start.pct) / range : 0;
    const r = Math.round(start.color[0] + (end.color[0] - start.color[0]) * factor);
    const g = Math.round(start.color[1] + (end.color[1] - start.color[1]) * factor);
    const b = Math.round(start.color[2] + (end.color[2] - start.color[2]) * factor);

    const rgbColor = `rgb(${r}, ${g}, ${b})`;
    document.documentElement.style.setProperty('--color-bg-base', rgbColor);
  };

  useEffect(() => {
    // Reset background base color when switching personas
    document.documentElement.style.setProperty('--color-bg-base', '#070D1E');
  }, [persona]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Listen to live Venue State from Firestore
  useEffect(() => {
    const docRef = doc(db, 'venueState', 'stadway_stadium');
    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        setVenueState(snapshot.data() as any);
      } else {
        // Self-healing initialization if document does not exist
        console.log('No venueState found in Firestore. Initializing default state...');
        const defaultState = {
          gates: {
            Gate_A: { occupancyPct: 25, queueLength: 8, status: 'smooth' },
            Gate_B: { occupancyPct: 82, queueLength: 95, status: 'congested' },
            Gate_C: { occupancyPct: 15, queueLength: 5, status: 'smooth' },
            Gate_D: { occupancyPct: 40, queueLength: 18, status: 'moderate' }
          },
          transit: {
            Metro_Red_Line: { etaMins: 5, delayMins: 0 },
            Shuttle_Bus_101: { etaMins: 10, delayMins: 2 },
            Express_Train_A: { etaMins: 7, delayMins: 0 }
          },
          weather: { condition: 'Clear', tempC: 22 },
          updatedAt: new Date().toISOString()
        };
        try {
          await setDoc(docRef, defaultState);
          setVenueState(defaultState as any);
        } catch (err) {
          console.error('Error writing initial venueState:', err);
        }
      }
    });

    // Check if ?demo=true URL parameter is set to enable simulator
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true') {
      setDemoMode(true);
      setSidebarOpen(true);
    }

    return () => unsubscribe();
  }, []);

  return (
    <div 
      className={`min-h-screen text-white flex flex-col font-sans transition-all duration-300 relative ${
        accessibilitySettings.highContrast ? 'high-contrast' : ''
      } ${
        accessibilitySettings.textScale === 'lg' ? 'text-scale-lg' : 
        accessibilitySettings.textScale === 'xl' ? 'text-scale-xl' : ''
      }`}
      style={{
        backgroundColor: 'var(--color-bg-base)',
        backgroundImage: `linear-gradient(to bottom, rgba(7, 13, 30, 0.25) 0%, rgba(7, 13, 30, 0.65) 100%), url('/assets/worldcup_backdrop.png')`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      {/* 3D Stadium Background Canvas */}
      <ThreeDBackground />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-[#FB6B1E] text-white text-xs font-display font-bold uppercase tracking-wider text-center py-3 px-4 flex items-center justify-center gap-2 border-b-4 border-[#070D1E] z-50">
          <ShieldAlert size={14} className="animate-pulse" />
          <span>Offline Mode Active. Displaying cached maps and last synced wayfinding route instructions.</span>
        </div>
      )}

      {/* Top Banner Alert for Global Broadcast Announcement */}
      {venueState?.overrideAnnouncement && (
        <div className="bg-gradient-to-r from-[#E5399A] to-[#FB6B1E] text-white text-xs font-display font-bold uppercase tracking-wider text-center py-3 px-4 flex items-center justify-center gap-2 animate-pulse border-b-4 border-[#070D1E] shadow-md z-50">
          <ShieldAlert size={14} />
          <span>OFFICIAL ANNOUNCEMENT: {venueState.overrideAnnouncement}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="bg-[#070D1E]/90 backdrop-blur-md border-b-4 border-[#16A34A] sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo Mark */}
          <div className="relative w-10 h-10 flex items-center justify-center border-2 border-white rounded-xl bg-[#121E36] shadow-[2px_2px_0px_0px_#0B1120]">
            <Trophy className="w-5 h-5 text-[#D4A017]" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-display font-black text-white leading-none tracking-tight m-0">STADIA.AI</h1>
            <span className="text-[9px] text-white/60 font-black uppercase tracking-wider">Live GenAI Operations — World Cup 2026</span>
          </div>
        </div>

        {/* Persona Controller Toggles */}
        <nav className="flex bg-[#121E36] p-1 gap-1 border-4 border-[#0E7C3A] rounded-full text-xs">
          <button
            onClick={() => setPersona('landing')}
            className={`px-4 py-2 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer rounded-full ${
              persona === 'landing'
                ? 'bg-[#16A34A] text-white shadow-[2px_2px_0px_0px_rgba(11,17,32,1)] border-2 border-white'
                : 'text-white/70 hover:text-[#16A34A] hover:bg-white/10'
            }`}
          >
            <Trophy size={13} /> Overview
          </button>
          <button
            onClick={() => setPersona('fan')}
            className={`px-4 py-2 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer rounded-full ${
              persona === 'fan'
                ? 'bg-[#16A34A] text-white shadow-[2px_2px_0px_0px_rgba(11,17,32,1)] border-2 border-white'
                : 'text-white/70 hover:text-[#16A34A] hover:bg-white/10'
            }`}
          >
            <User size={13} /> Fan Hub
          </button>
          <button
            onClick={() => setPersona('volunteer')}
            className={`px-4 py-2 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer rounded-full ${
              persona === 'volunteer'
                ? 'bg-[#16A34A] text-white shadow-[2px_2px_0px_0px_rgba(11,17,32,1)] border-2 border-white'
                : 'text-white/70 hover:text-[#16A34A] hover:bg-white/10'
            }`}
          >
            <Users size={13} /> Volunteer
          </button>
          <button
            onClick={() => setPersona('organizer')}
            className={`px-4 py-2 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer rounded-full ${
              persona === 'organizer'
                ? 'bg-[#16A34A] text-white shadow-[2px_2px_0px_0px_rgba(11,17,32,1)] border-2 border-white'
                : 'text-white/70 hover:text-[#16A34A] hover:bg-white/10'
            }`}
          >
            <Sliders size={13} /> Operations
          </button>
        </nav>

        {/* Simulator Panel Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 py-2.5 px-4 bg-[#121E36] border-4 border-white text-xs font-black text-white hover:translate-y-[-1px] shadow-[3px_3px_0px_0px_#0B1120] hover:shadow-[5px_5px_0px_0px_#0B1120] transition cursor-pointer rounded-full uppercase tracking-wider"
          >
            <Sparkles size={13} className="text-[#16A34A]" />
            Simulator
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Dashboard Workspace */}
        <main 
          id="main-content"
          onScroll={persona === 'landing' ? handleMainScroll : undefined}
          className="flex-1 overflow-y-auto px-6 py-6 text-center"
        >
          {persona === 'landing' && <LandingPage />}
          {persona === 'fan' && <FanView />}
          {persona === 'volunteer' && <VolunteerView />}
          {persona === 'organizer' && <OrganizerConsole />}
        </main>

        {/* Slide-out Sidebar Panel for Venue State Simulator */}
        {sidebarOpen && (
          <aside className="w-80 md:w-96 border-l-4 border-[#0E7C3A] bg-[#070D1E]/95 backdrop-blur-md overflow-y-auto z-30 transition-transform duration-300 right-0 top-0">
            <div className="sticky top-0 bg-[#070D1E] py-4 px-6 border-b-4 border-[#0E7C3A] flex justify-between items-center z-10">
              <span className="text-xs uppercase font-black text-white tracking-wider">Sensor Simulator</span>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-[#16A34A] transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              <DemoPanel />
            </div>
          </aside>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t-4 border-[#0E7C3A] py-4 px-6 text-center bg-[#070D1E]/90 text-xs font-bold text-white/60 flex justify-between items-center">
        <span>© 2026 Global Football Tournament Operations — Powered by STADIA.AI</span>
        <span className="flex items-center gap-2">
          <span className="status-dot live"></span>
          <span>Live</span>
          <span>•</span>
          <span>v1.0</span>
          <span>•</span>
          <span className="text-[#16A34A]">Privacy-First: No Facial Recognition</span>
        </span>
      </footer>
    </div>
  );
};

export default App;
