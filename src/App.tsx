import React, { useEffect, useState } from 'react';
import { useStore } from './context/useStore';
import { db } from './utils/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
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
      className={`min-h-screen bg-transparent text-silver-100 flex flex-col font-sans transition-all duration-300 relative ${
        accessibilitySettings.highContrast ? 'high-contrast' : ''
      } ${
        accessibilitySettings.textScale === 'lg' ? 'text-scale-lg' : 
        accessibilitySettings.textScale === 'xl' ? 'text-scale-xl' : ''
      }`}
    >
      {/* 3D Stadium Background Canvas */}
      <div className="hud-bg-container"></div>
      <ThreeDBackground />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-stadium-900 text-gold-400 text-xs font-semibold text-center py-2.5 px-4 flex items-center justify-center gap-2 border-b border-gold-500/15 z-50">
          <ShieldAlert size={14} className="animate-pulse" />
          <span>Offline Mode Active. Displaying cached maps and last synced wayfinding route instructions.</span>
        </div>
      )}

      {/* Top Banner Alert for Global Broadcast Announcement */}
      {venueState?.overrideAnnouncement && (
        <div className="bg-gradient-to-r from-status-danger to-status-warning text-white text-xs font-bold text-center py-2 px-4 flex items-center justify-center gap-2 animate-pulse shadow-md z-50">
          <ShieldAlert size={14} />
          <span>OFFICIAL ANNOUNCEMENT: {venueState.overrideAnnouncement}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="bg-stadium-900/90 backdrop-blur-xl border-b border-stadium-750/50 sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo Mark */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500 to-gold-400 opacity-10 rounded-lg"></div>
            <Trophy className="w-5 h-5 text-gold-400" />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-display font-bold text-gold-400 leading-none tracking-widest m-0">STADWAY</h1>
            <span className="text-[9px] text-silver-400 font-medium uppercase tracking-[0.2em]">FIFA 2026 • AI Operations</span>
          </div>
        </div>

        {/* Persona Controller Toggles */}
        <nav className="flex bg-stadium-950/80 p-1 gap-0.5 text-xs border border-stadium-750/40">
          <button
            onClick={() => setPersona('fan')}
            className={`px-4 py-2 font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              persona === 'fan'
                ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-stadium-950'
                : 'text-silver-400 hover:text-gold-300 hover:bg-stadium-850/50'
            }`}
          >
            <User size={13} /> Fan Hub
          </button>
          <button
            onClick={() => setPersona('volunteer')}
            className={`px-4 py-2 font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              persona === 'volunteer'
                ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-stadium-950'
                : 'text-silver-400 hover:text-gold-300 hover:bg-stadium-850/50'
            }`}
          >
            <Users size={13} /> Volunteer
          </button>
          <button
            onClick={() => setPersona('organizer')}
            className={`px-4 py-2 font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              persona === 'organizer'
                ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-stadium-950'
                : 'text-silver-400 hover:text-gold-300 hover:bg-stadium-850/50'
            }`}
          >
            <Sliders size={13} /> Operations
          </button>
        </nav>

        {/* Simulator Panel Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-stadium-850/60 hover:bg-stadium-800 border border-stadium-700/40 text-xs font-semibold text-gold-300 hover:text-gold-400 transition cursor-pointer"
          >
            <Sparkles size={13} className="text-pitch-400" />
            Simulator
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Dashboard Workspace */}
        <main className="flex-1 overflow-y-auto px-6 py-6 text-center">
          {persona === 'fan' && <FanView />}
          {persona === 'volunteer' && <VolunteerView />}
          {persona === 'organizer' && <OrganizerConsole />}
        </main>

        {/* Slide-out Sidebar Panel for Venue State Simulator */}
        {sidebarOpen && (
          <aside className="w-80 md:w-96 border-l border-stadium-750/40 bg-stadium-900/95 backdrop-blur-md overflow-y-auto z-30 transition-transform duration-300 right-0 top-0">
            <div className="sticky top-0 bg-stadium-900 py-4 px-6 border-b border-stadium-750/40 flex justify-between items-center z-10">
              <span className="text-xs uppercase font-bold text-silver-400 tracking-wider">Sensor Simulator</span>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-silver-400 hover:text-gold-400 transition"
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
      <footer className="border-t border-stadium-800/60 py-3 px-6 text-center bg-stadium-950/90 text-[10px] text-silver-500 flex justify-between items-center">
        <span>© 2026 FIFA World Cup™ Smart Operations — Powered by StadWay AI</span>
        <span className="flex items-center gap-2">
          <span className="status-dot live"></span>
          <span>Live</span>
          <span>•</span>
          <span>v1.0</span>
          <span>•</span>
          <span className="text-pitch-400">Privacy-First: No Facial Recognition</span>
        </span>
      </footer>
    </div>
  );
};

export default App;
