import React, { useState } from 'react';
import { useStore, type FanProfile, type DecisionResult } from '../context/useStore';
import { StadiumMap } from '../components/StadiumMap';
import { SeatSelector } from '../components/SeatSelector';
import { db, functions } from '../utils/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { runOrchestration } from '../../functions/src/orchestrator'; // Import local fallback
import { 
  Send, Accessibility, Leaf, MapPin, Clock, Cloud, Settings, AlertCircle, RefreshCw, Languages, Sparkles 
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
    
    // Seed default guest details if empty to prevent submit blocks
    const finalName = name.trim() || 'Guest Fan';
    const finalSeat = seat && seat !== 'Select seat on right...' ? seat : 'Row A, Seat 1';
    const finalZone = ticketZone || 'Zone_A';

    const profile: FanProfile = {
      id: 'fan_' + Math.random().toString(36).substring(5),
      name: finalName,
      language,
      accessibilityNeeds: needs,
      ticketZone: finalZone,
      seat: finalSeat
    };

    // Save profile to firestore asynchronously in the background
    setDoc(doc(db, 'fanProfiles', profile.id), profile).catch(err => {
      console.error('Failed to write profile to Firestore:', err);
    });

    // Transition UI immediately (0ms delay)
    setFanProfile(profile);
    setErrorMsg('');

    // Trigger automatic welcome question
    addChatMessage({
      sender: 'assistant',
      text: `Welcome to the stadium, ${profile.name}! I am StadWay, your AI assistant. How can I help you navigate today?`
    });
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
      <div className="max-w-6xl mx-auto my-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in text-left">
        
        {/* Onboarding Form Column (5 cols) */}
        <div className="lg:col-span-5 p-6 glass-panel rounded-3xl border-4 border-[#0E7C3A] bg-[#FAF7F0] shadow-[6px_6px_0px_0px_#0B1120] relative overflow-hidden animate-float">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4A017]/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#16A34A]/10 rounded-full blur-2xl"></div>
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-display font-black tracking-tight text-[#0B1120] uppercase">Initialize Companion</h2>
            <p className="text-xs text-[#0B1120]/70 mt-1">Set up your profile to activate the STADIA.AI agents.</p>
          </div>

          {errorMsg && (
            <div className="bg-[#E5399A]/10 border-4 border-[#E5399A] text-[#E5399A] p-3 rounded-2xl text-xs flex items-center gap-2 mb-4 font-bold">
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleOnboardingSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-[#0B1120] uppercase tracking-wider mb-1.5">Fan Name</label>
              <input
                type="text"
                placeholder="e.g. Carlos Martinez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border-4 border-[#0B1120] p-2.5 rounded-xl text-sm text-[#0B1120] font-bold placeholder-silver-500 focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-[#0B1120] uppercase tracking-wider mb-1.5">Ticket Zone</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={ticketZone.replace('Zone_', 'Section ')}
                  className="w-full bg-[#EAF3EC] border-4 border-[#0B1120] p-2.5 rounded-xl text-sm text-[#0B1120]/70 cursor-not-allowed font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-[#0B1120] uppercase tracking-wider mb-1.5">Selected Seat</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  placeholder="Select seat on right..."
                  value={seat}
                  className="w-full bg-[#EAF3EC] border-4 border-[#0B1120] p-2.5 rounded-xl text-sm text-[#0B1120]/70 cursor-not-allowed placeholder-silver-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#0B1120] uppercase tracking-wider mb-1.5">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white border-4 border-[#0B1120] p-2.5 rounded-xl text-sm text-[#0B1120] font-bold focus:outline-none focus:border-[#16A34A]"
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
              <label className="block text-xs font-black text-[#0B1120] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Accessibility size={14} className="text-[#E5399A]" />
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
                      className={`py-2 px-3 rounded-xl border-4 text-xs font-black text-center transition-all ${
                        isSelected
                          ? 'border-[#0B1120] bg-[#16A34A] text-white shadow-[2px_2px_0px_0px_#0B1120]'
                          : 'border-[#0B1120] bg-white text-[#0B1120]/80 hover:bg-[#EAF3EC]'
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
                className="w-1/3 py-3 border-4 border-[#0B1120] bg-[#FAF7F0] hover:bg-[#EAF3EC] text-[#0B1120] rounded-xl text-xs font-black transition-all cursor-pointer text-center font-display uppercase tracking-wider shadow-[3px_3px_0px_0px_#0B1120]"
              >
                Fill Demo
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#16A34A] text-white border-4 border-[#0B1120] rounded-xl text-sm font-black transition-all shadow-[3px_3px_0px_0px_#0B1120] hover:translate-y-[-1px] cursor-pointer font-display uppercase tracking-wider"
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
      <div className="space-y-6 lg:col-span-1 text-left">
        <StadiumMap 
          gateEntry={activeRouteGate} 
          ticketZone={fanProfile.ticketZone} 
          routeSteps={activeRouteSteps} 
          requireStepFree={requireStepFree} 
        />
        
        {/* Sensor Stats Cards */}
        {venueState && (
          <div className="glass-panel p-4 rounded-3xl border-4 border-[#0E7C3A] bg-[#FAF7F0] shadow-[4px_4px_0px_0px_#0B1120] space-y-3">
            <h3 className="text-xs font-black uppercase text-[#0B1120]/70 tracking-wider">Venue Live Sensors</h3>
            
            <div className="space-y-2">
              {/* Gates */}
              <div className="bg-white border-4 border-[#0B1120] p-2.5 rounded-xl flex items-center justify-between text-xs shadow-[2px_2px_0px_0px_#0B1120]">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#D4A017]" />
                  <span className="text-[#0B1120] font-bold">Preferred Gate B Flow:</span>
                </div>
                <span className={`font-mono font-black ${
                  venueState.gates.Gate_B.status === 'congested' ? 'text-[#E5399A]' : 'text-[#16A34A]'
                }`}>
                  {venueState.gates.Gate_B.occupancyPct}% ({venueState.gates.Gate_B.status.toUpperCase()})
                </span>
              </div>

              {/* Transit */}
              <div className="bg-white border-4 border-[#0B1120] p-2.5 rounded-xl flex items-center justify-between text-xs shadow-[2px_2px_0px_0px_#0B1120]">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#16A34A]" />
                  <span className="text-[#0B1120] font-bold">Metro Red Line:</span>
                </div>
                <span className={`font-mono font-black ${
                  venueState.transit.Metro_Red_Line.delayMins > 10 ? 'text-[#FB6B1E]' : 'text-[#16A34A]'
                }`}>
                  {venueState.transit.Metro_Red_Line.delayMins > 0 ? `Delayed ${venueState.transit.Metro_Red_Line.delayMins}m` : 'On Time'}
                </span>
              </div>

              {/* Weather */}
              <div className="bg-white border-4 border-[#0B1120] p-2.5 rounded-xl flex items-center justify-between text-xs shadow-[2px_2px_0px_0px_#0B1120]">
                <div className="flex items-center gap-2">
                  <Cloud size={14} className="text-[#0EA5E9]" />
                  <span className="text-[#0B1120] font-bold">Atmosphere Sensor:</span>
                </div>
                <span className="font-black text-[#0B1120]">
                  {venueState.weather.condition.toUpperCase()}, {venueState.weather.tempC}°C
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CENTER COLUMN: AI Chat & Agent Reasoning Trail */}
      <div className="space-y-6 lg:col-span-2 text-left">
        {/* Chat Widget */}
        <div className="glass-panel rounded-3xl border-4 border-[#0E7C3A] bg-[#FAF7F0] shadow-[8px_8px_0px_0px_#0EA5E9] flex flex-col h-[400px]">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b-4 border-[#0E7C3A] bg-[#EAF3EC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#16A34A] rounded-full animate-pulse"></div>
              <span className="text-sm font-display font-black text-[#0B1120] uppercase">StadWay AI Agent Companion</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="text-[#0B1120] hover:text-[#16A34A] transition"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

          {/* Gen AI Active Status Banner */}
          <div className="bg-[#FAF7F0] px-4 py-2 border-b-4 border-[#0B1120] flex flex-wrap items-center justify-between text-[11px] gap-2">
            <div className="flex items-center gap-1.5 text-[#0B1120]/80 font-bold">
              <Sparkles className="text-[#D4A017] stroke-[2.5]" size={12} />
              <span>
                Model: <strong className="text-[#0B1120] font-mono">llama-3.3-70b-versatile (Groq)</strong>
                {!localStorage.getItem('stadway_groq_key') && (
                  <span className="text-[#FB6B1E] ml-2 font-black animate-pulse">(Key Required - Click Settings Gear)</span>
                )}
              </span>
            </div>
            <span className="text-[9px] text-[#0B1120] bg-[#EAF3EC] px-2.5 py-0.5 border-2 border-[#0B1120] uppercase font-black tracking-wider rounded-full">
              6 Specialized Agents Connected
            </span>
          </div>

          {/* Settings Sub-Panel */}
          {showSettings && (
            <div className="bg-[#FAF7F0] border-b-4 border-[#0B1120] p-4 space-y-3 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-silver-500 mb-1">Contrast Mode</label>
                  <button
                    onClick={() => setAccessibilitySettings({ highContrast: !accessibilitySettings.highContrast })}
                    className={`w-full py-1.5 px-3 rounded-lg border-4 text-xs font-black ${
                      accessibilitySettings.highContrast ? 'border-[#0B1120] bg-[#EAF3EC] text-[#0E7C3A]' : 'border-[#0B1120] text-[#0B1120]'
                    }`}
                  >
                    High Contrast
                  </button>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-silver-500 mb-1">Response Detail</label>
                  <button
                    onClick={() => setAccessibilitySettings({ simplifiedLanguage: !accessibilitySettings.simplifiedLanguage })}
                    className={`w-full py-1.5 px-3 rounded-lg border-4 text-xs font-black ${
                      accessibilitySettings.simplifiedLanguage ? 'border-[#0B1120] bg-[#EAF3EC] text-[#0E7C3A]' : 'border-[#0B1120] text-[#0B1120]'
                    }`}
                  >
                    Simplified Mode
                  </button>
                </div>
              </div>
              <div className="border-t border-[#0B1120] pt-2.5">
                <label className="block text-[10px] uppercase font-bold text-silver-500 mb-1">Groq API Key (Stored Locally)</label>
                <input
                  type="password"
                  placeholder="Paste gsk_... key here"
                  value={localStorage.getItem('stadway_groq_key') || ''}
                  onChange={(e) => {
                    localStorage.setItem('stadway_groq_key', e.target.value.trim());
                    setErrorMsg(''); 
                  }}
                  className="w-full bg-white border-4 border-[#0B1120] px-3 py-1.5 rounded-lg text-xs text-[#0B1120] placeholder-silver-500 font-bold focus:outline-none focus:border-[#16A34A]"
                />
                <span className="block text-[9px] text-[#0B1120]/60 mt-1 font-semibold">Allows direct browser calls to llama-3.3-70b-versatile. Kept secure in your browser.</span>
              </div>
            </div>
          )}

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFDF9]">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm text-left border-4 border-[#0B1120] shadow-[3px_3px_0px_0px_#0B1120] ${
                    msg.sender === 'user'
                      ? 'bg-[#0EA5E9] text-white rounded-br-none'
                      : 'bg-white text-[#0B1120] rounded-bl-none'
                  }`}
                >
                  {msg.thinking ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="animate-spin text-[#16A34A]" size={14} />
                      <span className="text-xs text-[#0B1120]/60 italic font-bold">Orchestrating agents...</span>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
                
                {/* Visual reasoning trail toggle */}
                {msg.decision && (
                  <button
                    onClick={() => {
                      setActiveRecommendation(msg.decision || null);
                      setExpandedTrail(true);
                    }}
                    className="text-[10px] text-[#0EA5E9] hover:underline mt-1.5 flex items-center gap-1 cursor-pointer font-black uppercase tracking-wider"
                  >
                    <Languages size={10} /> Inspect Reasoning Trail ({msg.decision.confidence * 100}% confidence)
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions Footer */}
          <div className="px-3 py-2.5 border-t-4 border-[#0B1120] flex gap-2 overflow-x-auto whitespace-nowrap bg-[#EAF3EC]">
            <button
              onClick={() => submitQuery('How do I navigate to my seat?')}
              className="px-3 py-1.5 rounded-lg border-4 border-[#0B1120] bg-white text-[11px] font-black text-[#0B1120] hover:bg-[#FAF7F0] shadow-[2px_2px_0px_0px_#0B1120] transition cursor-pointer"
            >
              🗺️ Find Seat Route
            </button>
            <button
              onClick={() => submitQuery('Where is the nearest accessible restroom?')}
              className="px-3 py-1.5 rounded-lg border-4 border-[#0B1120] bg-white text-[11px] font-black text-[#0B1120] hover:bg-[#FAF7F0] shadow-[2px_2px_0px_0px_#0B1120] transition cursor-pointer"
            >
              ♿ Accessible Toilets
            </button>
            <button
              onClick={() => submitQuery('When should I leave to catch transit?')}
              className="px-3 py-1.5 rounded-lg border-4 border-[#0B1120] bg-white text-[11px] font-black text-[#0B1120] hover:bg-[#FAF7F0] shadow-[2px_2px_0px_0px_#0B1120] transition cursor-pointer"
            >
              🚆 Exit Transit
            </button>
            <button
              onClick={async () => {
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
                    colors: ['#16A34A', '#0EA5E9']
                  });
                } catch (err) {
                  console.error(err);
                }
              }}
              className="px-3 py-1.5 rounded-lg border-4 border-[#0B1120] bg-[#E5399A] text-[11px] font-black text-white hover:bg-[#E5399A]/95 shadow-[2px_2px_0px_0px_#0B1120] transition cursor-pointer"
            >
              🚨 Request Volunteer
            </button>
          </div>

          {/* Form Input */}
          <div className="p-3 border-t-4 border-[#0B1120] bg-white flex gap-2">
            <input
              type="text"
              placeholder="Ask StadWay (e.g. exit route, carbon footprint, toilets)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitQuery()}
              className="flex-1 bg-[#FAF7F0] border-4 border-[#0B1120] px-3 py-2.5 rounded-xl text-sm text-[#0B1120] font-bold placeholder-silver-500 focus:outline-none focus:border-[#16A34A]"
            />
            <button
              onClick={() => submitQuery()}
              className="p-2.5 bg-[#16A34A] text-white border-4 border-[#0B1120] shadow-[2px_2px_0px_0px_#0B1120] rounded-xl hover:translate-y-[-1px] transition cursor-pointer flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Sustainability Widget */}
        <div className="glass-panel p-5 rounded-3xl border-4 border-[#0E7C3A] bg-[#FAF7F0] shadow-[6px_6px_0px_0px_#0B1120] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-1.5">
              <Leaf className="text-[#16A34A] animate-bounce" size={20} />
              <h3 className="font-display font-black text-[#0B1120] uppercase text-base">Carbon Saver Hub</h3>
            </div>
            <p className="text-xs text-[#0B1120]/70 font-semibold">Record your sustainable transport choices to earn points!</p>
            <div className="flex gap-4 pt-2">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-silver-500">CO₂ Saved</span>
                <span className="text-xl font-bold text-[#16A34A] font-mono">{co2SavedKg} kg</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-silver-500">Eco Points</span>
                <span className="text-xl font-bold text-[#D4A017] font-mono">{sustainabilityPoints} pts</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 md:justify-end">
            <button
              onClick={() => recordTransitMode('Metro Rail', 2.6)}
              className="px-3.5 py-2.5 bg-white border-4 border-[#0B1120] rounded-xl text-xs font-black text-[#0B1120] hover:bg-[#EAF3EC] shadow-[2px_2px_0px_0px_#0B1120] transition cursor-pointer"
            >
              🚇 I Rode Metro (+2.6kg)
            </button>
            <button
              onClick={() => recordTransitMode('Shuttle Bus', 2.2)}
              className="px-3.5 py-2.5 bg-white border-4 border-[#0B1120] rounded-xl text-xs font-black text-[#0B1120] hover:bg-[#EAF3EC] shadow-[2px_2px_0px_0px_#0B1120] transition cursor-pointer"
            >
              静态 🚌 I Rode Shuttle (+2.2kg)
            </button>
          </div>
        </div>

        {/* EXPANDABLE REASONING TRAIL CARD */}
        {expandedTrail && activeRecommendation && (
          <div className="glass-panel p-5 rounded-3xl border-4 border-[#0E7C3A] bg-[#FAF7F0] shadow-[8px_8px_0px_0px_#D4A017] text-left space-y-4 animate-float">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-black text-[#0B1120] uppercase text-base">Agent Reasoning Trail HUD</h3>
              <button 
                onClick={() => setExpandedTrail(false)}
                className="text-xs font-black uppercase text-[#E5399A] hover:underline"
              >
                Close Inspect
              </button>
            </div>
            
            <div className="relative pl-6 border-l-4 border-[#0B1120] space-y-5">
              {activeRecommendation.agentTrail.map((trail, index) => (
                <div key={index} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[32px] top-1.5 w-3.5 h-3.5 rounded-full border-4 border-[#0B1120] bg-white group-hover:scale-125 transition-all"></div>
                  
                  <div className="bg-white border-4 border-[#0B1120] p-3.5 rounded-xl space-y-1.5 shadow-[4px_4px_0px_0px_#0B1120]">
                    <span className="text-[10px] bg-[#FAF7F0] text-[#0B1120] font-black uppercase px-2 py-0.5 rounded-full border-2 border-[#0B1120]">
                      {trail.agent}
                    </span>
                    <p className="text-xs text-[#0B1120]/95 leading-relaxed font-semibold mt-1">
                      {trail.reasoning}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-[9px] font-mono text-[#0B1120]/60 border-t-2 border-[#0B1120] pt-1.5">
                      <div>
                        <span className="block font-black uppercase">Inputs Ingested</span>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(trail.input, null, 1)}</pre>
                      </div>
                      <div>
                        <span className="block font-black uppercase">Decision Output</span>
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
