import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { useStore, type DecisionResult } from '../context/useStore';
import { BarChart3, Users, Leaf, ShieldAlert, Cpu, RefreshCw } from 'lucide-react';

export const OrganizerConsole: React.FC = () => {
  const { venueState } = useStore();
  const [decisions, setDecisions] = useState<DecisionResult[]>([]);
  const [stats, setStats] = useState({
    totalDecisions: 1840, // Mock baseline
    totalCo2Kg: 2420.5,
    activeTasksCount: 0
  });

  // Listen to decisions
  useEffect(() => {
    const q = query(collection(db, 'decisions'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: DecisionResult[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as DecisionResult);
      });
      // Sort by date newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setDecisions(list);

      // Dynamically calculate stats
      setStats(prev => ({
        ...prev,
        totalDecisions: 1840 + list.length
      }));
    });
    return () => unsubscribe();
  }, []);

  // Listen to tasks for stats
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'volunteerTasks'), (snapshot) => {
      let pendingCount = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'pending' || data.status === 'accepted') {
          pendingCount++;
        }
      });
      setStats(prev => ({
        ...prev,
        activeTasksCount: pendingCount
      }));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-6xl mx-auto my-6 space-y-6 text-left font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <Cpu className="text-[#D4A017]" size={24} />
          <h2 className="text-xl font-display font-black text-[#0B1120] uppercase tracking-tight">STADIA.AI Operations Command</h2>
        </div>
        <span className="text-xs bg-[#EAF3EC] text-[#0B1120] border-4 border-[#0E7C3A] px-4 py-1.5 rounded-full font-black uppercase">
          Aggregate Console Mode (No PII / Privacy-Preserved)
        </span>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Assisted */}
        <div className="glass-panel p-5 rounded-3xl border-4 border-[#0B1120] bg-white flex items-center justify-between shadow-[4px_4px_0px_0px_#0B1120]">
          <div className="space-y-1">
            <span className="text-[10px] text-[#0B1120]/70 font-black uppercase tracking-wider">Decisions Orchestrated</span>
            <span className="block font-scoreboard text-4xl text-[#0B1120] leading-none">{stats.totalDecisions}</span>
          </div>
          <Users className="text-[#D4A017]" size={28} />
        </div>

        {/* CO2 Saved */}
        <div className="glass-panel p-5 rounded-3xl border-4 border-[#0B1120] bg-white flex items-center justify-between shadow-[4px_4px_0px_0px_#0B1120]">
          <div className="space-y-1">
            <span className="text-[10px] text-[#0B1120]/70 font-black uppercase tracking-wider">Total CO₂ Saved</span>
            <span className="block font-scoreboard text-4xl text-[#16A34A] leading-none">{stats.totalCo2Kg.toFixed(1)} kg</span>
          </div>
          <Leaf className="text-[#16A34A]" size={28} />
        </div>

        {/* Active Dispatches */}
        <div className="glass-panel p-5 rounded-3xl border-4 border-[#0B1120] bg-white flex items-center justify-between shadow-[4px_4px_0px_0px_#0B1120]">
          <div className="space-y-1">
            <span className="text-[10px] text-[#0B1120]/70 font-black uppercase tracking-wider">Active Dispatches</span>
            <span className="block font-scoreboard text-4xl text-[#E5399A] leading-none">{stats.activeTasksCount}</span>
          </div>
          <ShieldAlert className="text-[#E5399A]" size={28} />
        </div>

        {/* System Confidence */}
        <div className="glass-panel p-5 rounded-3xl border-4 border-[#0B1120] bg-white flex items-center justify-between shadow-[4px_4px_0px_0px_#0B1120]">
          <div className="space-y-1">
            <span className="text-[10px] text-[#0B1120]/70 font-black uppercase tracking-wider">Mean Confidence</span>
            <span className="block font-scoreboard text-4xl text-[#0EA5E9] leading-none">94.8%</span>
          </div>
          <BarChart3 className="text-[#0EA5E9]" size={28} />
        </div>
      </div>

      {/* CORE SECTIONS: Gate Density Heatmap & Live Decisions Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GATE DENSITY MONITOR */}
        <div className="glass-panel p-5 rounded-3xl border-4 border-[#0E7C3A] lg:col-span-1 space-y-4 bg-[#FAF7F0] shadow-[6px_6px_0px_0px_#0B1120]">
          <h3 className="text-sm font-display font-black text-[#0B1120] uppercase leading-none">Aggregate Gate Inflow Sensors</h3>
          
          {venueState ? (
            <div className="space-y-4 pt-1">
              {Object.entries(venueState.gates).map(([gateId, gate]) => {
                const isCongested = gate.status === 'congested';
                return (
                  <div key={gateId} className="bg-white border-4 border-[#0B1120] p-3 rounded-2xl space-y-2 shadow-[2px_2px_0px_0px_#0B1120]">
                    <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                      <span className="text-[#0B1120]">{gateId.replace('_', ' ')}</span>
                      <span className={`font-mono ${
                        isCongested ? 'text-[#E5399A]' : gate.status === 'moderate' ? 'text-[#FB6B1E]' : 'text-[#16A34A]'
                      }`}>
                        {gate.occupancyPct}%
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-[#EAF3EC] rounded-full h-2.5 overflow-hidden border-2 border-[#0B1120]">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCongested ? 'bg-[#E5399A]' : gate.status === 'moderate' ? 'bg-[#FB6B1E]' : 'bg-[#16A34A]'
                        }`} 
                        style={{ width: `${gate.occupancyPct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-[#0B1120]/60 font-mono font-bold">
                      <span>Queue: {gate.queueLength} people</span>
                      <span className="uppercase">{gate.status} flow</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-[#0B1120]/60 text-xs gap-2">
              <RefreshCw className="animate-spin" size={14} />
              <span>Awaiting sensor data...</span>
            </div>
          )}
        </div>

        {/* DECISION AUDIT FEED */}
        <div className="glass-panel p-5 rounded-3xl border-4 border-[#0E7C3A] lg:col-span-2 space-y-4 flex flex-col max-h-[500px] bg-[#FAF7F0] shadow-[6px_6px_0px_0px_#0B1120]">
          <h3 className="text-sm font-display font-black text-[#0B1120] uppercase leading-none">StadWay Decision Audit Feed</h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {decisions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-[#0B1120]/60 text-center space-y-2">
                <Cpu className="text-[#0B1120]/40" size={36} />
                <p className="text-xs font-bold uppercase">No audited decisions in log yet.</p>
              </div>
            ) : (
              decisions.map(dec => (
                <div key={dec.id} className="bg-white border-4 border-[#0B1120] p-4 rounded-2xl space-y-3 hover:border-[#16A34A] transition shadow-[3px_3px_0px_0px_#0B1120]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-[10px] text-[#0B1120]/50 font-bold">ID: {dec.id}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-[#EAF3EC] text-[#0B1120] px-2.5 py-0.5 rounded-full border-2 border-[#0B1120] font-black uppercase">
                        {dec.agentTrail.length} Cooperating Agents
                      </span>
                      <span className="text-[10px] font-mono text-[#16A34A] font-black">
                        {dec.confidence * 100}% conf
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#0B1120] bg-[#FAF7F0] p-2.5 rounded-xl border-2 border-[#0B1120] font-bold">
                    {dec.finalRecommendation}
                  </p>

                  {/* Compact Agent Trail Summary */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dec.agentTrail.map((trail, tIdx) => (
                      <div 
                        key={tIdx} 
                        className="text-[9px] bg-[#EAF3EC] border-2 border-[#0B1120] text-[#0B1120]/80 px-2.5 py-1 rounded-lg font-bold"
                        title={trail.reasoning}
                      >
                        <span className="font-black text-[#16A34A]">{trail.agent}:</span> {trail.reasoning.substring(0, 45)}...
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
