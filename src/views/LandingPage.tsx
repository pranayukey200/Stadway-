import React from 'react';
import { useStore } from '../context/useStore';
import { 
  Trophy, Navigation, Users, Languages, Bus, Leaf, Cpu, ArrowRight, ShieldCheck, Sparkles, HelpCircle, ArrowUpRight 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setPersona } = useStore();

  // Scroll to a specific section on the page
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-24 py-8 animate-fade-in text-left">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-[75vh] flex flex-col justify-center items-center text-center relative px-4">
        <div className="absolute inset-0 bg-radial-gradient(from 50% 50%, rgba(200, 168, 78, 0.05) 0%, transparent 80%) pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-300 text-xs font-semibold mb-6 animate-pulse uppercase tracking-wider">
          <Sparkles size={12} className="text-pitch-400" />
          FIFA World Cup 2026™ AI Operations Suite
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight leading-none text-white max-w-4xl uppercase mb-6">
          SEE EVERY MATCH.<br />
          <span className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-300 bg-clip-text text-transparent">
            MANAGE EVERY MOMENT.
          </span>
        </h1>

        <p className="text-base md:text-lg text-silver-300 max-w-2xl font-light leading-relaxed mb-10">
          StadWay is a decentralized, privacy-first GenAI operations copilot. It fuses live venue sensor arrays with cooperatively aligned AI agents to serve fans, volunteers, and operators simultaneously.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          <button
            onClick={() => setPersona('fan')}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-stadium-950 font-bold rounded-xl shadow-lg shadow-gold-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer font-display"
          >
            Launch Fan Hub <ArrowRight size={16} />
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="w-full sm:w-auto px-8 py-4 border border-stadium-700/60 bg-stadium-900/40 hover:bg-stadium-850 text-silver-200 hover:text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer font-display"
          >
            Explore System OS
          </button>
        </div>
        
        {/* Quick links to roles */}
        <div className="grid grid-cols-3 gap-6 mt-16 w-full max-w-2xl border-t border-stadium-800/60 pt-8 text-center">
          <div onClick={() => setPersona('fan')} className="group cursor-pointer hover:opacity-80 transition">
            <span className="block text-xl font-bold font-mono text-white">01</span>
            <span className="text-xs font-semibold text-silver-400 uppercase group-hover:text-gold-300 flex items-center justify-center gap-1">
              Fan Portal <ArrowUpRight size={10} />
            </span>
          </div>
          <div onClick={() => setPersona('volunteer')} className="group cursor-pointer hover:opacity-80 transition">
            <span className="block text-xl font-bold font-mono text-white">02</span>
            <span className="text-xs font-semibold text-silver-400 uppercase group-hover:text-gold-300 flex items-center justify-center gap-1">
              Volunteer Grid <ArrowUpRight size={10} />
            </span>
          </div>
          <div onClick={() => setPersona('organizer')} className="group cursor-pointer hover:opacity-80 transition">
            <span className="block text-xl font-bold font-mono text-white">03</span>
            <span className="text-xs font-semibold text-silver-400 uppercase group-hover:text-gold-300 flex items-center justify-center gap-1">
              Operations Center <ArrowUpRight size={10} />
            </span>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC SYSTEM OVERVIEW / PILLARS */}
      <section id="features" className="space-y-16">
        <div className="border-t border-stadium-800/80 pt-16">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wide">
            Platform Capabilities
          </h2>
          <p className="text-sm text-silver-400 max-w-xl mt-2 leading-relaxed">
            StadWay integrates 8 core pillars of smart stadium management into a unified AI mesh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar: Wayfinding */}
          <div className="glass-panel p-6 rounded-2xl border border-stadium-750/30 space-y-4 hover:border-gold-500/25 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-stadium-950 transition-all">
              <Navigation size={20} />
            </div>
            <h3 className="text-lg font-display font-semibold text-white">01. Wayfinding & Navigation</h3>
            <p className="text-xs text-silver-400 leading-relaxed">
              Ditches static maps for conversational, intent-based route generation. Dynamically re-routes fans through less crowded gates, providing custom waypoint steps directly to their exact seat coordinates.
            </p>
          </div>

          {/* Pillar: Crowd Density */}
          <div className="glass-panel p-6 rounded-2xl border border-stadium-750/30 space-y-4 hover:border-gold-500/25 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-stadium-950 transition-all">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-display font-semibold text-white">02. Real-Time Crowd Safety</h3>
            <p className="text-xs text-silver-400 leading-relaxed">
              Ingests continuous sensor data to detect crowd compression at exit gates. Proactively alerts volunteers and suggests gate flow balances before queue times cross critical safety thresholds.
            </p>
          </div>

          {/* Pillar: Accessibility */}
          <div className="glass-panel p-6 rounded-2xl border border-stadium-750/30 space-y-4 hover:border-gold-500/25 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-stadium-950 transition-all">
              <Cpu size={20} />
            </div>
            <h3 className="text-lg font-display font-semibold text-white">03. Smart Accessibility Profiles</h3>
            <p className="text-xs text-silver-400 leading-relaxed">
              Provides step-free lifts, sensory-friendly guidance, and descriptive audio routing. Profiles persist in memory, ensuring every subsequent navigation advice respects these constraints.
            </p>
          </div>

          {/* Pillar: Multilingual */}
          <div className="glass-panel p-6 rounded-2xl border border-stadium-750/30 space-y-4 hover:border-gold-500/25 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-stadium-950 transition-all">
              <Languages size={20} />
            </div>
            <h3 className="text-lg font-display font-semibold text-white">04. Multilingual Dispatch</h3>
            <p className="text-xs text-silver-400 leading-relaxed">
              Bidirectional translations for international supporters. Matches emergency support requests with volunteers in the stadium grid who share the same language profile, reducing response delays.
            </p>
          </div>

          {/* Pillar: Transportation */}
          <div className="glass-panel p-6 rounded-2xl border border-stadium-750/30 space-y-4 hover:border-gold-500/25 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-stadium-950 transition-all">
              <Bus size={20} />
            </div>
            <h3 className="text-lg font-display font-semibold text-white">05. Congestion-Aware Transit</h3>
            <p className="text-xs text-silver-400 leading-relaxed">
              Monitors delays across metro lines, express shuttle buses, and train networks. Advises fans on optimized departure times based on local transit delays and current gate densities.
            </p>
          </div>

          {/* Pillar: Sustainability */}
          <div className="glass-panel p-6 rounded-2xl border border-stadium-750/30 space-y-4 hover:border-gold-500/25 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-stadium-950 transition-all">
              <Leaf size={20} />
            </div>
            <h3 className="text-lg font-display font-semibold text-white">06. Carbon Footprint Tracking</h3>
            <p className="text-xs text-silver-400 leading-relaxed">
              Quantifies and aggregates fan transportation choices to calculate carbon offsets. Encourages sustainable transport via point achievements, addressing green digital tournament tracking goals.
            </p>
          </div>
          
        </div>
      </section>

      {/* 3. SIMULATED DIGITAL TWIN HUD */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-gold-400 uppercase tracking-widest bg-gold-500/5 px-2.5 py-1 border border-gold-500/10">
            <Cpu size={12} /> Decision Engine UI
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white uppercase leading-tight">
            How The GenAI Orchestration Works
          </h2>
          <p className="text-xs text-silver-400 leading-relaxed">
            StadWay does not run on single-agent models. It uses a **GenAI Multi-Agent Core** that combines specialized TS micro-agents for safety, sustainability, and transit data, compiling inputs into a transparent reasoning trail:
          </p>
          
          <ul className="space-y-3 text-xs text-silver-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pitch-500 mt-1.5"></span>
              <span><strong>Privacy-First Edge Routing</strong>: All PII data is stripped, keeping decisions strictly metric-driven. No facial recognition or biometric tracking is permitted.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pitch-500 mt-1.5"></span>
              <span><strong>Collaborative Consensus</strong>: Specialized agents debate crowd flow, accessibility parameters, and transit delays before presenting a unified action plan.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pitch-500 mt-1.5"></span>
              <span><strong>Groq LLM Compilation</strong>: Groq API parses the final consensus, adjusting vocabulary to the user's preferred language and cognitive abilities.</span>
            </li>
          </ul>
        </div>

        {/* Mockup Chat Screen showing GenAI output */}
        <div className="lg:col-span-7 p-6 glass-panel rounded-2xl border border-gold-500/10 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex justify-between items-center border-b border-stadium-750/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-pitch-400 animate-pulse"></div>
              <span className="text-xs font-bold text-white font-mono uppercase">StadWay Agent Sandbox</span>
            </div>
            <span className="text-[10px] text-silver-400 bg-stadium-850 px-2 py-0.5 border border-stadium-700/50">
              Active Session
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* User message */}
            <div className="bg-gold-500 text-stadium-950 p-3 rounded-2xl rounded-br-none ml-auto max-w-[80%] text-right font-medium">
              I am in a wheelchair at Section Block B, and Gate B has a huge line. What is the safest step-free path out?
            </div>

            {/* Orchestrating loader */}
            <div className="flex items-center gap-2 p-2.5 bg-stadium-850/40 border border-stadium-850 rounded-xl text-[10px] text-silver-400 w-fit">
              <Cpu size={12} className="animate-spin text-pitch-400" />
              <span>Orchestrating specialized agents (Crowd, Wayfinding, Accessibility)...</span>
            </div>

            {/* AI message */}
            <div className="bg-stadium-800 border border-stadium-750/50 p-4 rounded-2xl rounded-bl-none text-silver-200 space-y-2 max-w-[85%]">
              <p>Hello Carlos! Based on active sensor data, we have generated a step-free egress route bypassing the Gate B surge:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-silver-300">
                <li>Take the accessible lift behind Section Block B to Level 1.</li>
                <li>Reroute west along the step-free concourse path towards Gate A.</li>
                <li>Exit through Gate A which has smooth flow (25% density, &lt;3 min queue).</li>
              </ul>
              <div className="border-t border-stadium-700/50 pt-2 mt-2 flex items-center justify-between text-[9px] text-gold-300">
                <span className="font-semibold flex items-center gap-1">
                  <ShieldCheck size={11} className="text-pitch-400" /> Audited Route
                </span>
                <span>Confidence: 98%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION SECTION */}
      <section className="p-8 md:p-12 glass-panel rounded-2xl border border-gold-500/20 text-center relative overflow-hidden bg-gradient-to-br from-stadium-900/60 to-stadium-950/60 space-y-6">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-pitch-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <Trophy size={48} className="mx-auto text-gold-400 animate-float" />
        
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-display font-bold text-white uppercase">Experience the Operations Suite</h2>
          <p className="text-xs md:text-sm text-silver-400 max-w-lg mx-auto">
            Choose your persona below to test live wayfinding routing, simulator sensors, dispatch responders, and view operations logs.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center pt-2">
          <button
            onClick={() => setPersona('fan')}
            className="px-6 py-3.5 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-stadium-950 text-xs font-bold rounded-xl shadow-md transition cursor-pointer font-display uppercase tracking-wider"
          >
            Open Fan Hub
          </button>
          <button
            onClick={() => setPersona('volunteer')}
            className="px-6 py-3.5 border border-stadium-700/60 bg-stadium-900/40 hover:bg-stadium-850 text-silver-200 text-xs font-bold rounded-xl transition cursor-pointer font-display uppercase tracking-wider"
          >
            Open Volunteer Grid
          </button>
          <button
            onClick={() => setPersona('organizer')}
            className="px-6 py-3.5 border border-stadium-700/60 bg-stadium-900/40 hover:bg-stadium-850 text-silver-200 text-xs font-bold rounded-xl transition cursor-pointer font-display uppercase tracking-wider"
          >
            Open Operations Command
          </button>
        </div>
      </section>

      {/* 5. CONCEPT NOTICE FOOTER */}
      <footer className="border-t border-stadium-850/60 pt-6 text-center text-[10px] text-silver-500 flex flex-col md:flex-row justify-between items-center gap-4">
        <span>StadWay smart stadium management dashboard is a fictional hackathon entry. Not affiliated with FIFA, Lenovo, or official world cup organizers.</span>
        <span className="flex gap-4">
          <a href="#features" className="hover:text-gold-400 transition" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Capabilities</a>
          <span>•</span>
          <span className="text-pitch-400 font-semibold">Privacy Preserved</span>
        </span>
      </footer>

    </div>
  );
};
