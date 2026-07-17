import React, { useState, useEffect } from 'react';
import { useStore } from '../context/useStore';
import { 
  Trophy, Navigation, Users, Globe2, Bus, Leaf, Radio, Accessibility, ScanLine, ArrowRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setPersona } = useStore();
  const [demoChatInput, setDemoChatInput] = useState('');
  const [demoChatResponses, setDemoChatResponses] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    { sender: 'user', text: 'I am in Section Block B, is there queue compression at Gate B?', time: '19:40' },
    { sender: 'ai', text: 'StadWay AI: Yes, sensor array reports Gate B is congested (82% density, 95-meter queue). I recommend exiting through Gate A (25% density) which is step-free.', time: '19:40' }
  ]);

  const [prefersReduced, setPrefersReduced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', motionListener);

    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      mediaQuery.removeEventListener('change', motionListener);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const bgAttachment = (isMobile || prefersReduced) ? 'scroll' : 'fixed';

  const handleDemoChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoChatInput.trim()) return;

    const userMsg = demoChatInput.trim();
    const newResponses = [...demoChatResponses, { sender: 'user' as const, text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
    setDemoChatResponses(newResponses);
    setDemoChatInput('');

    setTimeout(() => {
      let reply = "StandWay AI Orchestrator: Checking live sensor grid... ";
      const lower = userMsg.toLowerCase();
      if (lower.includes('gate') || lower.includes('exit') || lower.includes('crowd')) {
        reply += "Gate A and C are clear. Avoid Gate B which has active queue compression. Take the north concourse route.";
      } else if (lower.includes('wheelchair') || lower.includes('access') || lower.includes('lift')) {
        reply += "Accessible Lift L3 is online near Section A. Rerouting via Level 1 concourse for 100% step-free egress.";
      } else if (lower.includes('bus') || lower.includes('metro') || lower.includes('transit')) {
        reply += "Metro Red Line is departing in 5 mins. Shuttle Bus 101 has a minor 2-min delay. Next boarding is at transit hub West.";
      } else {
        reply += "Understood. The 6 specialized agents (Crowd, Wayfinding, Accessibility, Sustainability, Transit, Language) have logged your request. Section Block B egress remains stable.";
      }
      setDemoChatResponses(prev => [...prev, { sender: 'ai' as const, text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1000);
  };

  return (
    <div className="w-full space-y-32 py-4 animate-fade-in text-left relative z-10 font-sans">
      
      {/* 1. HERO SECTION WITH VIDEO BACKGROUND & SCENIC CONTRAST SCRIM */}
      <section className="min-h-[85vh] flex flex-col justify-between relative border-4 border-[#0B1120] rounded-3xl p-6 sm:p-12 overflow-hidden bg-[#121E36]/80 backdrop-blur-md shadow-[8px_8px_0px_0px_#0B1120]">
        {/* Background Media Container (Placement 1) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {/* Fallback & Layered Background Image */}
          <img 
            src="/assets/image-d.jpg" 
            alt="" 
            draggable="false"
            className="absolute inset-0 w-full h-full object-cover object-top lg:object-center select-none"
            style={{
              zIndex: 0,
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
            }}
          />
          {/* Green tint overlay (Luminosity blend) */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              zIndex: 1,
              backgroundColor: '#16A34A',
              mixBlendMode: 'luminosity',
              opacity: 0.15
            }}
          />
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover scale-105 filter saturate-75 brightness-110 opacity-30 relative"
            style={{ zIndex: 2 }}
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-stadium-lights-shining-at-night-42283-large.mp4" type="video/mp4" />
          </video>
          {/* Light Scrim */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070D1E]/40 via-[#070D1E]/10 to-[#070D1E]/90" style={{ zIndex: 3 }}></div>
        </div>

        {/* Floating Decorative Element (Placement 2 - Image A) */}
        <div 
          className="absolute right-[-80px] sm:right-[-40px] lg:right-[-20px] top-[50%] -translate-y-1/2 w-[280px] sm:w-[380px] lg:w-[480px] aspect-square pointer-events-none select-none hidden lg:block animate-float"
          style={{ zIndex: 15 }}
          aria-hidden="true"
        >
          <img 
            src="/assets/image-a.jpg" 
            alt="" 
            draggable="false"
            className="w-full h-full object-cover"
            style={{
              maskImage: 'radial-gradient(ellipse 60% 70% at 60% 50%, black 40%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at 60% 50%, black 40%, transparent 80%)',
            }}
          />
        </div>

        {/* Hero Top Content */}
        <div className="relative w-full" style={{ zIndex: 20 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 border-4 border-[#0B1120] bg-[#121E36] text-white text-xs font-black uppercase tracking-[0.2em] rounded-full shadow-[2px_2px_0px_0px_#0B1120] mb-8 animate-float">
            <Radio size={14} className="text-[#16A34A] animate-pulse" />
            <span>Live GenAI Operations — World Cup 2026</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Header lines */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="font-display font-black text-white uppercase leading-[0.92] tracking-tight text-[clamp(2.8rem,8vw,6.5rem)]">
                Every Fan.<br />
                Every Gate.<br />
                <span className="gradient-text-pitch font-display">One Platform.</span>
              </h2>
              <p className="text-base sm:text-lg text-white/80 font-medium max-w-xl leading-snug mt-6">
                StandWay is a decentralized, privacy-first smart tournament operations suite. Fusing live edge sensors with cooperatively aligned AI agents to serve fans, volunteers, and operators simultaneously.
              </p>
            </div>

            {/* CTA Box right-aligned */}
            <div className="lg:col-span-4 flex flex-col gap-4 w-full bg-[#0B1120] border-4 border-[#0E7C3A] p-6 rounded-3xl shadow-[6px_6px_0px_0px_#0B1120]">
              <div className="flex items-center gap-2">
                <Trophy className="text-[#D4A017] w-6 h-6" />
                <span className="text-xs font-black uppercase tracking-widest text-white/70">Operations Console</span>
              </div>
              <p className="text-xs text-white/80 font-semibold leading-relaxed">
                Unlock active crowd monitoring, volunteer ticket dispatch networks, and multilingual support services instantly.
              </p>
              <button
                onClick={() => setPersona('fan')}
                className="w-full py-4 bg-gradient-to-r from-[#16A34A] via-[#0EA5E9] to-[#D4A017] border-4 border-[#E5399A] rounded-full text-white font-black uppercase tracking-wider flex items-center justify-center gap-2 group cursor-pointer hover:scale-[1.02] shadow-[4px_4px_0px_0px_#0B1120] transition-all"
              >
                <span>Launch Agent Sandbox</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Hero Bottom - Stats Row */}
        <div className="relative w-full mt-12 pt-8 border-t-4 border-[#0B1120] flex flex-wrap justify-between items-end gap-6" style={{ zIndex: 20 }}>
          <div className="flex flex-wrap gap-8 sm:gap-16">
            <div className="text-left">
              <span className="block font-scoreboard text-4xl sm:text-6xl text-white leading-none">104</span>
              <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Matches Covered</span>
            </div>
            <div className="text-left">
              <span className="block font-scoreboard text-4xl sm:text-6xl text-white leading-none">48</span>
              <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Teams Tracked</span>
            </div>
            <div className="text-left">
              <span className="block font-scoreboard text-4xl sm:text-6xl text-white leading-none">6</span>
              <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">GenAI Agents Live</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-[#121E36] border-4 border-[#0B1120] px-4 py-2 rounded-full shadow-[3px_3px_0px_0px_#0B1120] text-xs font-bold">
            <Accessibility className="w-5 h-5 text-white/50" />
            <div className="text-left leading-none">
              <span className="block text-[8px] text-white/60 uppercase font-black">Accessibility</span>
              <span className="text-[10px] font-black uppercase text-white">Built for Every Fan</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WAYFINDING & NAVIGATION (ACCENT: SKY BLUE) */}
      <section id="wayfinding" className="relative border-4 border-[#0B1120] rounded-3xl p-8 bg-[#121E36]/90 shadow-[8px_8px_0px_0px_#0EA5E9] overflow-hidden">
        {/* Subtle dot pattern background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0EA5E9 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#0B1120] bg-[#0B1120] text-xs font-black uppercase tracking-widest text-[#0EA5E9] rounded-full shadow-[2px_2px_0px_0px_#0B1120]">
              <Navigation size={12} />
              <span>Wayfinding OS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white uppercase leading-none tracking-tight">
              Dynamic Gate Egress
            </h2>
            <p className="text-sm text-white/80 font-medium leading-snug">
              Ditches static maps for conversational, intent-based route generation. Dynamically re-routes supporters through gates with lower densities, providing custom waypoint directions directly to seat coordinates.
            </p>
            <div className="border-t-4 border-dashed border-[#0B1120] pt-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold">
                <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></div>
                <span>Sensor-guided route balancing</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]"></div>
                <span>Sub-3 minute egress optimizations</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0B1120] border-4 border-[#0B1120] p-6 rounded-3xl shadow-[6px_6px_0px_0px_#0B1120] relative">
            <h3 className="text-xs font-black uppercase tracking-wider text-white/60 mb-4">Interactive HUD Waypoint</h3>
            <div className="h-48 border-4 border-dashed border-[#0E7C3A] bg-[#121E36] rounded-2xl flex flex-col justify-center items-center p-4 text-center relative overflow-hidden">
              {/* Soccer Players Watermark Illustration */}
              <img 
                src="/assets/players_action.png" 
                alt="" 
                draggable="false"
                className="absolute right-[-20px] bottom-[-20px] w-40 h-40 object-contain opacity-15 pointer-events-none select-none z-0" 
                aria-hidden="true"
              />
              <div className="absolute top-2 left-2 flex gap-1.5 z-10">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5399A]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FB6B1E]"></span>
              </div>
              <Navigation size={32} className="text-[#0EA5E9] animate-bounce mb-2 relative z-10" />
              <p className="text-xs font-black uppercase text-white relative z-10">Route: Section B → Concourse North → Gate A</p>
              <p className="text-[10px] font-bold text-[#16A34A] mt-1 uppercase relative z-10">Recommended path is 100% congestion-free</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CROWD & SAFETY INTELLIGENCE (ACCENT: PITCH GREEN) */}
      <section id="safety" className="relative border-4 border-[#0B1120] rounded-3xl p-8 bg-[#121E36]/90 shadow-[8px_8px_0px_0px_#16A34A] overflow-hidden">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#16A34A 1px, transparent 1px), linear-gradient(90deg, #16A34A 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 bg-[#121E36] border-4 border-[#0B1120] p-6 rounded-3xl shadow-[6px_6px_0px_0px_#0B1120] space-y-4 order-2 lg:order-1">
            <div className="flex justify-between items-center border-b-2 border-[#0B1120] pb-2 text-white">
              <span className="text-xs font-black uppercase tracking-wider text-white/80">Gate Density Monitoring</span>
              <span className="status-dot live"></span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="border-4 border-[#0B1120] p-3 rounded-2xl bg-[#0B1120] text-center text-white">
                <span className="text-[10px] font-black uppercase text-white/60">Gate A</span>
                <span className="block text-xl font-bold font-scoreboard mt-1">25%</span>
                <span className="text-[8px] bg-[#16A34A] text-white px-1.5 py-0.5 rounded-full font-bold uppercase">Smooth</span>
              </div>
              <div className="border-4 border-[#0B1120] p-3 rounded-2xl bg-[#0B1120] text-center text-white">
                <span className="text-[10px] font-black uppercase text-white/60">Gate B</span>
                <span className="block text-xl font-bold font-scoreboard mt-1">82%</span>
                <span className="text-[8px] bg-[#E5399A] text-white px-1.5 py-0.5 rounded-full font-bold uppercase">Congested</span>
              </div>
              <div className="border-4 border-[#0B1120] p-3 rounded-2xl bg-[#0B1120] text-center text-white">
                <span className="text-[10px] font-black uppercase text-white/60">Gate C</span>
                <span className="block text-xl font-bold font-scoreboard mt-1">15%</span>
                <span className="text-[8px] bg-[#16A34A] text-white px-1.5 py-0.5 rounded-full font-bold uppercase">Smooth</span>
              </div>
              <div className="border-4 border-[#0B1120] p-3 rounded-2xl bg-[#0B1120] text-center text-white">
                <span className="text-[10px] font-black uppercase text-white/60">Gate D</span>
                <span className="block text-xl font-bold font-scoreboard mt-1">40%</span>
                <span className="text-[8px] bg-[#FB6B1E] text-white px-1.5 py-0.5 rounded-full font-bold uppercase">Moderate</span>
              </div>
            </div>

            {/* Holographic Stadium Heatmap Visual Overlay */}
            <div className="mt-4 border-4 border-[#0B1120] rounded-2xl overflow-hidden relative h-40 bg-[#0B1120] shadow-[4px_4px_0px_0px_#0B1120] select-none">
              <img 
                src="/assets/stadium_heatmap.png" 
                alt="" 
                draggable="false"
                className="w-full h-full object-cover opacity-80"
                style={{
                  maskImage: 'linear-gradient(to right, black 60%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent z-10" />
              <div className="absolute bottom-3 left-4 z-20 text-left">
                <span className="text-[8px] bg-[#16A34A] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Live Spatial Heatmap</span>
                <h4 className="text-xs font-bold text-white uppercase mt-1 tracking-wider">Gate B Compression Alert (82% Egress Surge)</h4>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#0B1120] bg-[#0B1120] text-xs font-black uppercase tracking-widest text-[#16A34A] rounded-full shadow-[2px_2px_0px_0px_#0B1120]">
              <Users size={12} />
              <span>Crowd Safety</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white uppercase leading-none tracking-tight">
              Preemptive Crowd Analytics
            </h2>
            <p className="text-sm text-white/80 font-medium leading-snug">
              Ingests continuous sensor metrics to spot bottle-necks at exit corridors. Automatically dispatches volunteers and alerts staff before queue lengths cross critical thresholds.
            </p>
          </div>
        </div>
      </section>

      {/* PLACEMENT 3 — Divider Band (Image B) */}
      <div 
        className="w-full h-[220px] sm:h-[300px] lg:h-[380px] flex items-center justify-center relative overflow-hidden bg-[#070D1E] select-none my-8 border-y-4 border-[#0B1120]"
        style={{
          clipPath: 'polygon(0 8%, 100% 0%, 100% 92%, 0% 100%)',
          WebkitClipPath: 'polygon(0 8%, 100% 0%, 100% 92%, 0% 100%)'
        }}
        aria-hidden="true"
      >
        <div 
          className="absolute inset-0 bg-[#0B1120]"
          style={{
            backgroundImage: `url('/assets/image-b.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: bgAttachment,
            opacity: 0.85
          }}
        />
        {/* Scenic dark overlay mask */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/40 to-[#0B1120]/60 z-10" />
        
        <h2 
          className="font-display font-black text-white text-3xl sm:text-5xl lg:text-7xl xl:text-8xl uppercase tracking-tight text-center relative z-20 px-4"
          style={{
            textShadow: '4px 4px 0px #D4A017, 8px 8px 0px #16A34A, 12px 12px 0px #0EA5E9'
          }}
        >
          WORLD CUP 2026
        </h2>
      </div>

      {/* 4. ACCESSIBILITY & MULTILINGUAL ASSISTANT (ACCENT: MAGENTA) */}
      <section id="accessibility" className="relative border-4 border-[#0B1120] rounded-3xl p-8 bg-[#121E36]/90 shadow-[8px_8px_0px_0px_#E5399A] overflow-hidden">
        {/* Diagonal stripe pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #E5399A 25%, transparent 25%, transparent 50%, #E5399A 50%, #E5399A 75%, transparent 75%, transparent)', backgroundSize: '40px 40px' }}></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#0B1120] bg-[#0B1120] text-xs font-black uppercase tracking-widest text-[#E5399A] rounded-full shadow-[2px_2px_0px_0px_#0B1120]">
              <Accessibility size={12} />
              <span>Inclusive Assistant</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white uppercase leading-none tracking-tight">
              Every Fan. Multi-Lingual.
            </h2>
            <p className="text-sm text-white/80 font-medium leading-snug">
              Specialized accessibility options provide step-free path finding, descriptive audio channels, and sensory-friendly navigation. Persisted user settings ensure continuous, tailored route outputs.
            </p>
          </div>

          {/* Interactive Chat Widget Mockup Component */}
          <div className="lg:col-span-7 bg-[#121E36] border-4 border-[#0B1120] rounded-3xl shadow-[6px_6px_0px_0px_#0B1120] overflow-hidden flex flex-col h-96">
            <div className="bg-[#0B1120] border-b-4 border-[#0B1120] px-4 py-3 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Globe2 className="text-[#E5399A] w-4.5 h-4.5" />
                <span className="text-xs font-black uppercase">StandWay Assistant</span>
              </div>
              <span className="text-[9px] bg-[#121E36] border-2 border-[#0B1120] px-2 py-0.5 rounded-full font-bold">V1.0</span>
            </div>

            {/* Chat Responses list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#070D1E]">
              {demoChatResponses.map((msg, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-2xl text-xs max-w-[85%] border-2 border-[#0B1120] ${
                    msg.sender === 'user'
                      ? 'bg-[#0EA5E9] text-white ml-auto rounded-br-none shadow-[2px_2px_0px_0px_#0B1120]'
                      : 'bg-[#121E36] text-white mr-auto rounded-bl-none shadow-[2px_2px_0px_0px_#0B1120]'
                  }`}
                >
                  <p className="font-semibold">{msg.text}</p>
                  <span className="block text-[8px] opacity-70 mt-1 text-right">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleDemoChatSubmit} className="border-t-4 border-[#0B1120] p-2 flex bg-[#121E36] rounded-b-2xl">
              <input
                type="text"
                placeholder="Ask about step-free lifts, gates, or bus timings..."
                value={demoChatInput}
                onChange={(e) => setDemoChatInput(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2 text-xs focus:outline-none placeholder-silver-500 font-bold text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#16A34A] text-white border-2 border-[#0B1120] text-xs font-black uppercase rounded-full shadow-[2px_2px_0px_0px_#0B1120] hover:translate-y-[-1px] transition cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 5. TRANSPORTATION & SUSTAINABILITY (ACCENT: SUNSET ORANGE) */}
      <section id="transit" className="relative border-4 border-[#0B1120] rounded-3xl p-8 bg-[#121E36]/90 shadow-[8px_8px_0px_0px_#FB6B1E] overflow-hidden">
        {/* Diagonal grid lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(135deg, #FB6B1E 25%, transparent 25%), linear-gradient(225deg, #FB6B1E 25%, transparent 25%)', backgroundSize: '30px 30px' }}></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 order-2 lg:order-1 text-white">
            <div className="bg-[#0B1120] border-4 border-[#0B1120] p-4 rounded-3xl shadow-[4px_4px_0px_0px_#0B1120] space-y-2">
              <div className="flex items-center gap-2">
                <Bus className="text-[#FB6B1E] w-5 h-5" />
                <span className="text-xs font-black uppercase text-white/70">Egress Delay Reduction</span>
              </div>
              <span className="block font-scoreboard text-4xl text-white leading-none">-35%</span>
              <p className="text-[10px] text-white/60 font-semibold uppercase">Bus and metro departures timed to exit surges.</p>
            </div>
            
            <div className="bg-[#0B1120] border-4 border-[#0B1120] p-4 rounded-3xl shadow-[4px_4px_0px_0px_#0B1120] space-y-2">
              <div className="flex items-center gap-2">
                <Leaf className="text-[#16A34A] w-5 h-5" />
                <span className="text-xs font-black uppercase text-white/70">CO₂ Saved This Match</span>
              </div>
              <span className="block font-scoreboard text-4xl text-white leading-none">4.2 Tons</span>
              <p className="text-[10px] text-white/60 font-semibold uppercase">Aggregated public transport incentive metrics.</p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#0B1120] bg-[#0B1120] text-xs font-black uppercase tracking-widest text-[#FB6B1E] rounded-full shadow-[2px_2px_0px_0px_#0B1120]">
              <Bus size={12} />
              <span>Smart Egress & Carbon</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white uppercase leading-none tracking-tight">
              Transit Timing
            </h2>
            <p className="text-sm text-white/80 font-medium leading-snug">
              Monitors congestion indices on metro rails, bus hubs, and express lines. Suggests custom departure times for fans to balance transport lines and promote sustainability tracking.
            </p>
          </div>
        </div>
      </section>

      {/* 6. OPERATIONAL INTELLIGENCE / CONTROL ROOM (ACCENT: GOLD) */}
      <section id="operations" className="relative border-4 border-[#0B1120] rounded-3xl p-8 bg-[#121E36]/90 shadow-[8px_8px_0px_0px_#D4A017] overflow-hidden">
        {/* Dynamic mesh lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#D4A017 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#0B1120] bg-[#0B1120] text-xs font-black uppercase tracking-widest text-[#D4A017] rounded-full shadow-[2px_2px_0px_0px_#0B1120]">
              <ScanLine size={12} />
              <span>Command Center</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white uppercase leading-none tracking-tight">
              Decision Support
            </h2>
            <p className="text-sm text-white/80 font-medium leading-snug">
              Fuses sensor statistics into a glassmorphic command HUD. Audits live gate capacities, dispatches responder tickets, and reviews agent logs to empower real-time operations commands.
            </p>
          </div>

          <div className="lg:col-span-7 bg-[#0B1120] border-4 border-[#0B1120] p-6 rounded-3xl shadow-[6px_6px_0px_0px_#0B1120] space-y-4 text-white">
            <h3 className="text-xs font-black uppercase tracking-wider text-white/60 border-b-2 border-[#0B1120] pb-2">Command HUD Mockup</h3>
            
            <div className="space-y-2 text-xs">
              <div className="bg-[#121E36] border-2 border-[#0B1120] p-3 rounded-xl flex justify-between items-center">
                <span className="font-bold">Incident Log #405: Crowding at Gate B</span>
                <span className="text-[10px] bg-[#E5399A] text-white px-2 py-0.5 rounded-full font-bold uppercase">Dispatched</span>
              </div>
              <div className="bg-[#121E36] border-2 border-[#0B1120] p-3 rounded-xl flex justify-between items-center">
                <span className="font-bold">Transit ETA Sync: Metro Red Line</span>
                <span className="text-[10px] bg-[#16A34A] text-white px-2 py-0.5 rounded-full font-bold uppercase">Stable (5m)</span>
              </div>
              <div className="bg-[#121E36] border-2 border-[#0B1120] p-3 rounded-xl flex justify-between items-center">
                <span className="font-bold">Accessibility Path: Sensory Route Set</span>
                <span className="text-[10px] bg-[#0EA5E9] text-white px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CLOSING CTA SECTION (Placement 4 - Image C) */}
      <section 
        className="p-8 md:p-16 border-4 border-[#0B1120] rounded-3xl text-center relative overflow-hidden bg-[#121E36] shadow-[10px_10px_0px_0px_#0B1120] space-y-6 select-none"
        style={{
          backgroundImage: `url('/assets/image-c.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top'
        }}
      >
        {/* Semi-transparent solid overlay to darken background for contrast */}
        <div 
          className="absolute inset-0 bg-[#0B1120]/55 pointer-events-none z-0" 
          aria-hidden="true" 
        />
        
        {/* Green decorative curve in the bottom right */}
        <div 
          className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full border-[24px] border-[#16A34A] pointer-events-none opacity-40 z-0" 
          aria-hidden="true"
        />

        <div className="relative z-10 space-y-6">
          {/* Premium 3D Trophy Asset */}
          <div className="relative w-20 h-20 mx-auto select-none pointer-events-none mb-2" aria-hidden="true">
            <img 
              src="/assets/gold_trophy.png" 
              alt="" 
              draggable="false"
              className="w-full h-full object-contain animate-float"
              style={{
                filter: 'drop-shadow(0px 8px 16px rgba(212, 160, 23, 0.45))'
              }}
            />
          </div>
          
          <div className="space-y-4">
            <h2 
              className="text-3xl md:text-5xl font-display font-black text-white uppercase leading-none tracking-tight"
              style={{
                textShadow: '3px 3px 0px #D4A017, 6px 6px 0px #16A34A, 9px 9px 0px #0EA5E9'
              }}
            >
              Ready to Power Your Stadium?
            </h2>
            <p className="text-xs md:text-sm text-white/90 max-w-lg mx-auto font-semibold">
              Unlock the smart stadium command dashboard. Select your portal below to test routing, sensor simulators, and responder metrics.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <button
              onClick={() => setPersona('fan')}
              className="px-6 py-4 bg-[#D4A017] border-4 border-white text-white text-xs font-black rounded-full transition cursor-pointer font-display uppercase tracking-wider hover:translate-y-[-2px]"
              style={{
                boxShadow: '8px 8px 0px #0B1120, 16px 16px 0px #16A34A'
              }}
            >
              Launch Fan Hub
            </button>
            <button
              onClick={() => setPersona('volunteer')}
              className="px-6 py-4 bg-[#121E36] border-4 border-white text-white text-xs font-black rounded-full shadow-[4px_4px_0px_0px_#0B1120] hover:translate-y-[-1px] transition cursor-pointer font-display uppercase tracking-wider"
            >
              Volunteer Grid
            </button>
            <button
              onClick={() => setPersona('organizer')}
              className="px-6 py-4 bg-[#121E36] border-4 border-white text-white text-xs font-black rounded-full shadow-[4px_4px_0px_0px_#0B1120] hover:translate-y-[-1px] transition cursor-pointer font-display uppercase tracking-wider"
            >
              Operations Center
            </button>
          </div>

          <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-4">
            Concept build for a Smart Stadium hackathon challenge — not an official FIFA product.
          </p>
        </div>
      </section>

    </div>
  );
};
