import React, { useState } from 'react';
import { useStore, type FanProfile, type DecisionResult } from '../context/useStore';
import { StadiumMap } from '../components/StadiumMap';
import { SeatSelector } from '../components/SeatSelector';
import { db, functions } from '../utils/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { runOrchestration } from '../../functions/src/orchestrator'; // Import local fallback
import { 
  Send, Accessibility, Leaf, MapPin, Clock, Cloud, Settings, AlertCircle, RefreshCw, Languages 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FanView: React.FC = () => {
  const { 
    fanProfile, setFanProfile, 
    venueState, 
    chatHistory, addChatMessage, updateChatMessage, 
    accessibilitySettings, setAccessibilitySettings,
    activeRecommendation, setActiveRecommendation,
    co2SavedKg, addCo2Savings, sustainabilityPoints,
    setActiveNavigationTarget
  } = useStore();

  // Onboarding Form State
  const [name, setName] = useState('');
  const [ticketZone, setTicketZone] = useState('Zone_A');
  const [seat, setSeat] = useState('');
  const [language, setLanguage] = useState('English');
  const [needs, setNeeds] = useState<string[]>([]);
  
  // Chat Query state
  const [query, setQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [expandedTrail, setExpandedTrail] = useState(false);

  // Initial onboarding fill for quick demo
  const fillDemoProfile = () => {
    setName('Carlos Martinez');
    setTicketZone('Zone_B');
    setSeat('Row C, Seat 8');
    setLanguage('Spanish');
    setNeeds(['Wheelchair / Step-Free', 'Simplified Language']);
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !seat) {
      setErrorMsg('Please enter your name and seat number.');
      return;
    }

    const profile: FanProfile = {
      id: 'fan_' + Math.random().toString(36).substring(5),
      name,
      language,
      accessibilityNeeds: needs,
      ticketZone,
      seat
    };

    try {
      // Save profile to firestore
      await setDoc(doc(db, 'fanProfiles', profile.id), profile);
      setFanProfile(profile);
      setErrorMsg('');

      // Trigger automatic welcome question
      addChatMessage({
        sender: 'assistant',
        text: `Welcome to the stadium, ${profile.name}! I am StadWay, your AI assistant. How can I help you navigate today?`
      });
    } catch (err) {
      console.error(err);
      // fallback local state
      setFanProfile(profile);
    }
  };

  const toggleNeed = (need: string) => {
    if (needs.includes(need)) {
      setNeeds(needs.filter(n => n !== need));
    } else {
      setNeeds([...needs, need]);
    }
  };

  // Chat Query Submission
  const submitQuery = async (customQuery?: string) => {
    const textQuery = customQuery || query;
    if (!textQuery.trim() || !fanProfile || !venueState) return;

    if (!customQuery) setQuery('');
    setErrorMsg('');

    // Add user message to UI
    addChatMessage({
      sender: 'user',
      text: textQuery
    });

    const assistantMsgId = addChatMessage({
      sender: 'assistant',
      text: 'Analyzing stadium sensors and orchestrating recommendations...',
      thinking: true
    });

    try {
      let result: any;
      const dataPayload = {
        fanProfile,
        venueState,
        question: textQuery
      };

      try {
        // 1. Attempt Cloud Function call
        const askStadWayFn = httpsCallable(functions, 'askStadWay');
        const response = await askStadWayFn(dataPayload);
        result = response.data;
      } catch (fnErr) {
        console.warn('Cloud Function call failed, running local browser orchestrator fallback:', fnErr);
        // 2. Client-side local orchestrator execution fallback
        const localResult = await runOrchestration(dataPayload);
        
        // Mock add to Firestore decisions collection locally
        const mockId = 'dec_' + Math.random().toString(36).substring(5);
        result = {
          id: mockId,
          ...localResult
        };

        // Write to firestore in background
        setDoc(doc(db, 'decisions', mockId), {
          fanId: fanProfile.id,
          agentTrail: localResult.agentTrail,
          finalRecommendation: localResult.finalRecommendation,
          confidence: localResult.confidence,
          createdAt: new Date().toISOString()
        }).catch(err => console.error('Failed to write mock decision:', err));
      }

      // Update message with AI output
      updateChatMessage(assistantMsgId, {
        text: result.finalRecommendation,
        decision: result as DecisionResult,
        thinking: false
      });

      setActiveRecommendation(result as DecisionResult);
      
      // Highlight navigation targets based on keywords
      const lowerQ = textQuery.toLowerCase();
      if (lowerQ.includes('restroom') || lowerQ.includes('toilet')) {
        setActiveNavigationTarget('Restrooms');
      } else if (lowerQ.includes('seat') || lowerQ.includes('route')) {
        setActiveNavigationTarget('Seat');
      } else if (lowerQ.includes('first aid') || lowerQ.includes('medical')) {
        setActiveNavigationTarget('First Aid');
      }

    } catch (err: any) {
      console.error(err);
      updateChatMessage(assistantMsgId, {
        text: 'Sorry, StadWay encountered an error while consulting its agents. Please try again.',
        thinking: false
      });
      setErrorMsg('Error running orchestrator: ' + err.message);
    }
  };

  // Record sustainability transit choice
  const recordTransitMode = (mode: string, savings: number) => {
    addCo2Savings(savings);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#06b6d4', '#7c3aed']
    });

    addChatMessage({
      sender: 'assistant',
      text: `Awesome! You recorded your transit choice: **${mode}**. You saved **${savings}kg of CO₂** emissions and earned **${Math.round(savings * 100)} sustainability points**! 🏆`
    });
  };

  // Onboarding View
  if (!fanProfile) {
    return (
      <div className="max-w-6xl mx-auto my-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
        
        {/* Onboarding Form Column (5 cols) */}
        <div className="lg:col-span-5 p-6 glass-panel rounded-2xl border border-purple-500/20 shadow-2xl relative overflow-hidden animate-float text-left">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-600/10 rounded-full blur-2xl"></div>
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-display font-bold tracking-wide text-white">Initialize Companion</h2>
            <p className="text-xs text-gray-400 mt-1">Set up your profile to activate the StadWay AI agents.</p>
          </div>

          {errorMsg && (
            <div className="bg-rose-950/40 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2 mb-4">
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleOnboardingSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Fan Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-navy-950/60 border border-navy-700/60 p-2.5 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Ticket Zone</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={ticketZone.replace('Zone_', 'Section ')}
                  className="w-full bg-navy-950/40 border border-navy-800/80 p-2.5 rounded-xl text-sm text-gray-400 cursor-not-allowed font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Selected Seat</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  placeholder="Select seat on right..."
                  value={seat}
                  className="w-full bg-navy-950/40 border border-navy-800/80 p-2.5 rounded-xl text-sm text-gray-400 cursor-not-allowed placeholder-gray-600 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-navy-950/60 border border-navy-700/60 p-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-accent-purple"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Marathi">Marathi (मराठी)</option>
              </select>
            </div>

            {/* Accessibility Requirements */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1">
                <Accessibility size={14} className="text-accent-cyan" />
                Accessibility Accommodations
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  { id: 'wheelchair', label: 'Wheelchair / Step-Free' },
                  { id: 'sensory', label: 'Sensory Friendly' },
                  { id: 'audio', label: 'Audio Descriptive' },
                  { id: 'simplified', label: 'Simplified Language' }
                ].map(item => {
                  const isSelected = needs.includes(item.label);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleNeed(item.label)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        isSelected
                          ? 'border-accent-cyan bg-cyan-950/20 text-cyan-400 shadow-md'
                          : 'border-navy-700/50 bg-navy-800/10 text-gray-400 hover:border-navy-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={fillDemoProfile}
                className="w-1/3 py-3 border border-purple-500/20 bg-purple-950/20 hover:bg-purple-950/40 text-accent-light rounded-xl text-xs font-semibold transition-all cursor-pointer text-center font-display"
              >
                Fill Demo
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-accent-purple to-accent-pink hover:from-accent-violet hover:to-accent-pink text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-purple-500/20 cursor-pointer font-display"
              >
                Start Companion
              </button>
            </div>
          </form>
        </div>

        {/* Interactive Seating Grid Column (7 cols) */}
        <div className="lg:col-span-7">
          <SeatSelector 
            selectedZone={ticketZone}
            selectedSeat={seat}
            onChangeSeat={(zone, seatStr, isAccessible) => {
              setTicketZone(zone);
              setSeat(seatStr);
              if (isAccessible) {
                if (!needs.includes('Wheelchair / Step-Free')) {
                  setNeeds([...needs, 'Wheelchair / Step-Free']);
                }
              }
            }}
            isWheelchairUser={needs.includes('Wheelchair / Step-Free')}
          />
        </div>

      </div>
    );
  }

  // Active wayfinding values
  const activeRouteTrail = activeRecommendation?.agentTrail?.find(t => t.agent === 'Wayfinding Agent')?.output || {};
  const activeRouteSteps = activeRouteTrail.recommendedRoute || [];
  const activeRouteGate = activeRouteTrail.gateEntry || fanProfile.ticketZone.replace('Zone', 'Gate');
  const requireStepFree = activeRecommendation?.agentTrail?.find(t => t.agent === 'Accessibility Agent')?.output?.requireStepFree || false;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto my-4 ${accessibilitySettings.highContrast ? 'high-contrast' : ''}`}>
      
      {/* LEFT COLUMN: Map & Details */}
      <div className="space-y-6 lg:col-span-1">
        <StadiumMap 
          gateEntry={activeRouteGate} 
          ticketZone={fanProfile.ticketZone} 
          routeSteps={activeRouteSteps} 
          requireStepFree={requireStepFree} 
        />
        
        {/* Sensor Stats Cards */}
        {venueState && (
          <div className="glass-panel p-4 rounded-2xl border border-navy-700/40 space-y-3">
            <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Venue Live Sensors</h3>
            
            <div className="space-y-2">
              {/* Gates */}
              <div className="bg-navy-950/40 border border-navy-800 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-accent-pink" />
                  <span className="text-gray-300">Preferred Gate B Flow:</span>
                </div>
                <span className={`font-mono font-bold ${
                  venueState.gates.Gate_B.status === 'congested' ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {venueState.gates.Gate_B.occupancyPct}% ({venueState.gates.Gate_B.status})
                </span>
              </div>

              {/* Transit */}
              <div className="bg-navy-950/40 border border-navy-800 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-accent-cyan" />
                  <span className="text-gray-300">Metro Red Line Status:</span>
                </div>
                <span className={`font-mono font-bold ${
                  venueState.transit.Metro_Red_Line.delayMins > 10 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {venueState.transit.Metro_Red_Line.delayMins > 0 ? `Delayed ${venueState.transit.Metro_Red_Line.delayMins}m` : 'On Time'}
                </span>
              </div>

              {/* Weather */}
              <div className="bg-navy-950/40 border border-navy-800 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Cloud size={14} className="text-accent-light" />
                  <span className="text-gray-300">Atmosphere Sensor:</span>
                </div>
                <span className="font-semibold text-white">
                  {venueState.weather.condition}, {venueState.weather.tempC}°C
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CENTER COLUMN: AI Chat & Agent Reasoning Trail */}
      <div className="space-y-6 lg:col-span-2">
        {/* Chat Widget */}
        <div className="glass-panel rounded-2xl border border-purple-500/10 flex flex-col h-[400px]">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-navy-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-accent-cyan rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-white font-display">StadWay AI Agent Companion</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-white transition"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

          {/* Settings Sub-Panel */}
          {showSettings && (
            <div className="bg-navy-900 border-b border-navy-700/60 p-4 grid grid-cols-2 gap-3 text-left">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Contrast Mode</label>
                <button
                  onClick={() => setAccessibilitySettings({ highContrast: !accessibilitySettings.highContrast })}
                  className={`w-full py-1.5 px-3 rounded-lg border text-xs font-semibold ${
                    accessibilitySettings.highContrast ? 'border-accent-cyan bg-cyan-950/20 text-cyan-400' : 'border-navy-700 text-gray-400'
                  }`}
                >
                  High Contrast
                </button>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Response Detail</label>
                <button
                  onClick={() => setAccessibilitySettings({ simplifiedLanguage: !accessibilitySettings.simplifiedLanguage })}
                  className={`w-full py-1.5 px-3 rounded-lg border text-xs font-semibold ${
                    accessibilitySettings.simplifiedLanguage ? 'border-accent-cyan bg-cyan-950/20 text-cyan-400' : 'border-navy-700 text-gray-400'
                  }`}
                >
                  Simplified Mode
                </button>
              </div>
            </div>
          )}

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm text-left ${
                    msg.sender === 'user'
                      ? 'bg-accent-purple text-white rounded-br-none'
                      : 'bg-navy-800 text-gray-200 border border-navy-700/60 rounded-bl-none'
                  }`}
                >
                  {msg.thinking ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="animate-spin text-accent-cyan" size={14} />
                      <span className="text-xs text-gray-400 italic">Orchestrating agents...</span>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
                
                {/* Visual reasoning trail toggle attached to recommendations */}
                {msg.decision && (
                  <button
                    onClick={() => {
                      setActiveRecommendation(msg.decision || null);
                      setExpandedTrail(true);
                    }}
                    className="text-[10px] text-accent-light hover:underline mt-1.5 flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <Languages size={10} /> Inspect Reasoning Trail ({msg.decision.confidence * 100}% confidence)
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions Footer */}
          <div className="px-3 py-2 border-t border-navy-700/50 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none bg-navy-950/30">
            <button
              onClick={() => submitQuery('How do I navigate to my seat?')}
              className="px-3 py-1.5 rounded-lg border border-navy-700/50 bg-navy-800/40 text-[11px] font-medium text-gray-300 hover:border-purple-500/35 transition cursor-pointer"
            >
              🗺️ Find Seat Route
            </button>
            <button
              onClick={() => submitQuery('Where is the nearest accessible restroom?')}
              className="px-3 py-1.5 rounded-lg border border-navy-700/50 bg-navy-800/40 text-[11px] font-medium text-gray-300 hover:border-purple-500/35 transition cursor-pointer"
            >
              ♿ Accessible Toilets
            </button>
            <button
              onClick={() => submitQuery('When should I leave to catch transit?')}
              className="px-3 py-1.5 rounded-lg border border-navy-700/50 bg-navy-800/40 text-[11px] font-medium text-gray-300 hover:border-purple-500/35 transition cursor-pointer"
            >
              🚆 Exit Transit schedule
            </button>
            <button
              onClick={async () => {
                // Request a Volunteer Task
                try {
                  const taskDoc = {
                    requestedLanguage: fanProfile.language,
                    requiredSkill: needToSkill(fanProfile.accessibilityNeeds[0] || 'Wayfinding'),
                    location: fanProfile.ticketZone.replace('Zone', 'Section'),
                    status: 'pending',
                    description: `Assistance requested for ${fanProfile.name} near Section ${fanProfile.ticketZone.replace('Zone_', '')}.`,
                    createdAt: new Date().toISOString()
                  };
                  await addDoc(collection(db, 'volunteerTasks'), taskDoc);
                  
                  addChatMessage({
                    sender: 'assistant',
                    text: `🚨 I have dispatched a help request to the volunteer grid. A volunteer fluent in **${fanProfile.language}** has been notified of your location at **${taskDoc.location}**.`
                  });
                  
                  confetti({
                    particleCount: 50,
                    spread: 30,
                    colors: ['#06b6d4', '#8b5cf6']
                  });
                } catch (err) {
                  console.error(err);
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-950/20 text-[11px] font-semibold text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
            >
              🚨 Request Volunteer
            </button>
          </div>

          {/* Form Input */}
          <div className="p-3 border-t border-navy-700/60 bg-navy-900/60 flex gap-2">
            <input
              type="text"
              placeholder="Ask StadWay (e.g. exit route, carbon footprint, toilets)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitQuery()}
              className="flex-1 bg-navy-950 border border-navy-700/60 px-3 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple"
            />
            <button
              onClick={() => submitQuery()}
              className="p-2.5 bg-accent-purple text-white rounded-xl hover:bg-accent-violet transition cursor-pointer flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Sustainability Widget */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-1.5">
              <Leaf className="text-accent-emerald animate-bounce" size={20} />
              <h3 className="font-display font-bold text-white text-base">Carbon Saver Hub</h3>
            </div>
            <p className="text-xs text-gray-400">Record your sustainable transport choices to earn points!</p>
            <div className="flex gap-4 pt-2">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-500">CO₂ Saved</span>
                <span className="text-xl font-bold text-accent-emerald font-mono">{co2SavedKg} kg</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-500">Eco Points</span>
                <span className="text-xl font-bold text-accent-cyan font-mono">{sustainabilityPoints} pts</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 md:justify-end">
            <button
              onClick={() => recordTransitMode('Metro Rail', 2.6)}
              className="px-3.5 py-2.5 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/35 rounded-xl text-xs font-semibold text-emerald-400 transition cursor-pointer"
            >
              🚇 I Rode Metro (+2.6kg)
            </button>
            <button
              onClick={() => recordTransitMode('Shuttle Bus', 2.2)}
              className="px-3.5 py-2.5 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/35 rounded-xl text-xs font-semibold text-emerald-400 transition cursor-pointer"
            >
              🚌 I Rode Shuttle (+2.2kg)
            </button>
          </div>
        </div>

        {/* EXPANDABLE REASONING TRAIL CARD */}
        {expandedTrail && activeRecommendation && (
          <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 text-left space-y-4 animate-float">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-semibold text-white text-base">Agent Reasoning Trail HUD</h3>
              <button 
                onClick={() => setExpandedTrail(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Close Inspect
              </button>
            </div>
            
            <div className="relative pl-6 border-l border-navy-700/80 space-y-5">
              {activeRecommendation.agentTrail.map((trail, index) => (
                <div key={index} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-accent-cyan group-hover:scale-125 transition-all"></div>
                  <div className="absolute -left-[34px] top-0.5 w-4 h-4 rounded-full border border-cyan-500/20 animate-pulse"></div>
                  
                  <div className="bg-navy-950/50 border border-navy-800 p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] bg-purple-950 text-accent-light font-bold px-2 py-0.5 rounded border border-purple-800">
                      {trail.agent}
                    </span>
                    <p className="text-xs text-gray-200 leading-relaxed font-medium mt-1">
                      {trail.reasoning}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-[9px] font-mono text-gray-500 border-t border-navy-800/60 pt-1.5">
                      <div>
                        <span className="block font-semibold uppercase text-gray-600">Inputs Ingested</span>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(trail.input, null, 1)}</pre>
                      </div>
                      <div>
                        <span className="block font-semibold uppercase text-gray-600">Decision Output</span>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(trail.output, null, 1)}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Helper mapper for volunteer skills
function needToSkill(need: string): string {
  const n = need.toLowerCase();
  if (n.includes('wheelchair') || n.includes('mobility')) return 'Accessibility Support';
  if (n.includes('audio') || n.includes('descriptive')) return 'Audio Support';
  if (n.includes('language') || n.includes('translate')) return 'Translations';
  return 'Wayfinding';
}
