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
    <div className="max-w-6xl mx-auto my-6 space-y-6 text-left">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <Cpu className="text-accent-purple" size={24} />
          <h2 className="text-xl font-display font-bold text-white tracking-wide">StadWay Venue Operations Console</h2>
        </div>
        <span className="text-xs bg-purple-950 text-accent-light border border-purple-500/35 px-3 py-1.5 rounded-full font-semibold">
          Aggregate Console Mode (No PII / Privacy-Preserved)
        </span>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Assisted */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-700/50 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Decisions Orchestrated</span>
            <span className="block text-2xl font-bold font-mono text-white">{stats.totalDecisions}</span>
          </div>
          <Users className="text-accent-purple" size={28} />
        </div>

        {/* CO2 Saved */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-700/50 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Total CO₂ Saved</span>
            <span className="block text-2xl font-bold font-mono text-accent-emerald">{stats.totalCo2Kg.toFixed(1)} kg</span>
          </div>
          <Leaf className="text-accent-emerald animate-pulse" size={28} />
        </div>

        {/* Active Dispatches */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-700/50 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Active Dispatches</span>
            <span className="block text-2xl font-bold font-mono text-rose-400">{stats.activeTasksCount}</span>
          </div>
          <ShieldAlert className="text-rose-400" size={28} />
        </div>

        {/* System Confidence */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-700/50 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Mean Confidence</span>
            <span className="block text-2xl font-bold font-mono text-accent-cyan">94.8%</span>
          </div>
          <BarChart3 className="text-accent-cyan" size={28} />
        </div>
      </div>

      {/* CORE SECTIONS: Gate Density Heatmap & Live Decisions Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GATE DENSITY MONITOR */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-700/50 lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-gray-300 font-display">Aggregate Gate Inflow Sensors</h3>
          
          {venueState ? (
            <div className="space-y-4 pt-1">
              {Object.entries(venueState.gates).map(([gateId, gate]) => {
                const isCongested = gate.status === 'congested';
                return (
                  <div key={gateId} className="bg-navy-950/40 border border-navy-800 p-3 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-300">{gateId.replace('_', ' ')}</span>
                      <span className={`font-mono font-bold ${
                        isCongested ? 'text-rose-400' : gate.status === 'moderate' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {gate.occupancyPct}%
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-navy-900 rounded-full h-2 overflow-hidden border border-navy-750">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCongested ? 'bg-rose-500 shadow-lg shadow-rose-500/20' : gate.status === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${gate.occupancyPct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                      <span>Queue: {gate.queueLength} people</span>
                      <span className="uppercase">{gate.status} flow</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-gray-500 text-xs gap-2">
              <RefreshCw className="animate-spin" size={14} />
              Awaiting sensor data...
            </div>
          )}
        </div>

        {/* DECISION AUDIT FEED */}
        <div className="glass-panel p-5 rounded-2xl border border-navy-700/50 lg:col-span-2 space-y-4 flex flex-col max-h-[500px]">
          <h3 className="text-sm font-semibold text-gray-300 font-display">StadWay Decision Audit Feed</h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {decisions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-500 text-center space-y-2">
                <Cpu className="text-navy-700" size={36} />
                <p className="text-xs">No audited decisions in log yet.</p>
              </div>
            ) : (
              decisions.map(dec => (
                <div key={dec.id} className="bg-navy-950/40 border border-navy-850 p-4 rounded-xl space-y-3 hover:border-navy-700 transition">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-[10px] text-gray-500">ID: {dec.id}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-purple-950 text-accent-light px-2 py-0.5 rounded border border-purple-800">
                        {dec.agentTrail.length} Cooperating Agents
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {dec.confidence * 100}% conf
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-200 bg-navy-950/80 p-2.5 rounded-lg border border-navy-800 font-medium">
                    {dec.finalRecommendation}
                  </p>

                  {/* Compact Agent Trail Summary */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dec.agentTrail.map((trail, tIdx) => (
                      <div 
                        key={tIdx} 
                        className="text-[9px] bg-navy-850/80 border border-navy-700 text-gray-400 px-2 py-1 rounded"
                        title={trail.reasoning}
                      >
                        <span className="font-bold text-accent-cyan">{trail.agent}:</span> {trail.reasoning.substring(0, 45)}...
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
