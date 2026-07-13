import React, { useEffect, useState } from 'react';
import { useStore } from './context/useStore';
import { db } from './utils/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { FanView } from './views/FanView';
import { VolunteerView } from './views/VolunteerView';
import { OrganizerConsole } from './views/OrganizerConsole';
import { DemoPanel } from './views/DemoPanel';
import { ThreeDBackground } from './components/ThreeDBackground';
import { User, Users, ShieldAlert, Sliders, X, Sparkles } from 'lucide-react';

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
      className={`min-h-screen bg-navy-950 text-gray-200 flex flex-col font-sans transition-all duration-300 relative ${
        accessibilitySettings.highContrast ? 'high-contrast' : ''
      } ${
        accessibilitySettings.textScale === 'lg' ? 'text-scale-lg' : 
        accessibilitySettings.textScale === 'xl' ? 'text-scale-xl' : ''
      }`}
    >
      {/* 3D Parallax Stadium Blueprint Background & Live 3D Wireframe Canvas */}
      <div className="hud-bg-container"></div>
      <ThreeDBackground />
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-gray-900 to-navy-900 text-cyan-400 text-xs font-semibold text-center py-2.5 px-4 flex items-center justify-center gap-2 border-b border-cyan-500/25 shadow-md z-50">
          <ShieldAlert size={14} className="animate-pulse text-accent-cyan" />
          <span>Offline Mode Active. Displaying cached maps and last synced wayfinding route instructions.</span>
        </div>
      )}

      {/* Top Banner Alert for Global Broadcast Announcement */}
      {venueState?.overrideAnnouncement && (
        <div className="bg-gradient-to-r from-amber-600 to-rose-600 text-white text-xs font-bold text-center py-2 px-4 flex items-center justify-center gap-2 animate-pulse shadow-md z-50">
          <ShieldAlert size={14} />
          <span>OFFICIAL ANNOUNCEMENT: {venueState.overrideAnnouncement}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="bg-navy-900/80 backdrop-blur-md border-b border-navy-800 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="border border-navy-700 bg-navy-950 p-2 text-accent-light flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-light animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="12" rx="10" ry="5" />
              <ellipse cx="12" cy="12" rx="6" ry="3" />
              <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="1.5 1.5" />
              <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="1.5 1.5" />
              <polygon points="12,8 14,12 12,16 10,12" fill="currentColor" fillOpacity="0.4" />
            </svg>
          </div>
          <div className="text-left">
            <h1 className="text-lg font-display font-bold text-white leading-none tracking-wider m-0">STADWAY</h1>
            <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest">AI Stadium Operations</span>
          </div>
        </div>

        {/* Persona Controller Toggles */}
        <nav className="flex bg-navy-950/80 p-1.5 rounded-xl border border-navy-850 gap-1 text-xs">
          <button
            onClick={() => setPersona('fan')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              persona === 'fan'
                ? 'bg-accent-purple text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User size={14} /> Fan View
          </button>
          <button
            onClick={() => setPersona('volunteer')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              persona === 'volunteer'
                ? 'bg-accent-purple text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users size={14} /> Volunteer View
          </button>
          <button
            onClick={() => setPersona('organizer')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              persona === 'organizer'
                ? 'bg-accent-purple text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sliders size={14} /> Operations View
          </button>
        </nav>

        {/* Simulator Panel Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-navy-950/80 hover:bg-navy-850 border border-navy-800 rounded-xl text-xs font-semibold text-accent-light hover:text-white transition cursor-pointer"
          >
            <Sparkles size={14} className="text-accent-cyan" />
            Sensor Simulator
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
          <aside className="w-80 md:w-96 border-l border-navy-800 bg-navy-900/95 backdrop-blur-md overflow-y-auto z-30 transition-transform duration-300 right-0 top-0">
            <div className="sticky top-0 bg-navy-900 py-4 px-6 border-b border-navy-800 flex justify-between items-center z-10 shadow-sm">
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Device Sensors HUD</span>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white transition"
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

      {/* Footer copyright */}
      <footer className="border-t border-navy-850 py-3.5 px-6 text-center bg-navy-950 text-[10px] text-gray-500 flex justify-between items-center">
        <span>© 2026 FIFA World Cup™ Smart Operations. Powered by StadWay AI.</span>
        <span className="flex items-center gap-2">
          <span>Version 1.0.0</span>
          <span>•</span>
          <span className="text-accent-cyan">No Facial Recognition / Aggregate Analytics Only</span>
        </span>
      </footer>
    </div>
  );
};

export default App;
