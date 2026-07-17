import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useStore, type VenueState } from '../context/useStore';
import { Sliders, Check, RefreshCw, AlertTriangle, CloudSun, MapPin, Bus } from 'lucide-react';

export const DemoPanel: React.FC = () => {
  const { venueState, setVenueState } = useStore();
  const [localState, setLocalState] = useState<VenueState | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Sync from store when venueState changes (initial load)
  useEffect(() => {
    if (venueState) {
      setLocalState(prev => prev || JSON.parse(JSON.stringify(venueState)));
    }
  }, [venueState]);

  if (!localState) {
    return (
      <div className="glass-panel p-6 rounded-3xl border-4 border-[#0E7C3A] bg-[#FAF7F0] shadow-[6px_6px_0px_0px_#0B1120] flex flex-col items-center justify-center text-[#0B1120]">
        <RefreshCw className="animate-spin mb-2 text-[#16A34A]" />
        <p className="font-bold uppercase tracking-wider text-xs">Connecting to stadium sensor simulator...</p>
      </div>
    );
  }

  // Preset definitions
  const applyPreset = async (presetName: 'normal' | 'gate-surge' | 'transit-delay') => {
    setIsUpdating(true);
    setStatusMsg(`Applying preset: ${presetName}...`);
    
    let updated: VenueState;
    const baseDate = new Date().toISOString();

    if (presetName === 'normal') {
      updated = {
        gates: {
          Gate_A: { occupancyPct: 25, queueLength: 8, status: 'smooth' },
          Gate_B: { occupancyPct: 35, queueLength: 12, status: 'smooth' },
          Gate_C: { occupancyPct: 15, queueLength: 4, status: 'smooth' },
          Gate_D: { occupancyPct: 40, queueLength: 18, status: 'moderate' }
        },
        transit: {
          Metro_Red_Line: { etaMins: 4, delayMins: 0 },
          Shuttle_Bus_101: { etaMins: 10, delayMins: 1 },
          Express_Train_A: { etaMins: 6, delayMins: 0 }
        },
        weather: { condition: 'Clear', tempC: 22 },
        updatedAt: baseDate
      };
    } else if (presetName === 'gate-surge') {
      updated = {
        gates: {
          Gate_A: { occupancyPct: 30, queueLength: 12, status: 'smooth' },
          Gate_B: { occupancyPct: 92, queueLength: 160, status: 'congested' }, // High Surge at Gate B
          Gate_C: { occupancyPct: 10, queueLength: 3, status: 'smooth' },
          Gate_D: { occupancyPct: 45, queueLength: 22, status: 'moderate' }
        },
        transit: {
          Metro_Red_Line: { etaMins: 5, delayMins: 0 },
          Shuttle_Bus_101: { etaMins: 15, delayMins: 5 },
          Express_Train_A: { etaMins: 7, delayMins: 1 }
        },
        weather: { condition: 'Clear', tempC: 24 },
        updatedAt: baseDate
      };
    } else {
      // transit-delay
      updated = {
        gates: {
          Gate_A: { occupancyPct: 35, queueLength: 15, status: 'smooth' },
          Gate_B: { occupancyPct: 40, queueLength: 18, status: 'moderate' },
          Gate_C: { occupancyPct: 20, queueLength: 6, status: 'smooth' },
          Gate_D: { occupancyPct: 55, queueLength: 28, status: 'moderate' }
        },
        transit: {
          Metro_Red_Line: { etaMins: 28, delayMins: 25 }, // Blocked Metro Line
          Shuttle_Bus_101: { etaMins: 32, delayMins: 20 }, // Delayed Shuttle Bus
          Express_Train_A: { etaMins: 8, delayMins: 2 }
        },
        weather: { condition: 'Rainy', tempC: 17 }, // Rain triggers delay
        updatedAt: baseDate
      };
    }

    try {
      await setDoc(doc(db, 'venueState', 'stadway_stadium'), updated);
      setLocalState(updated);
      setVenueState(updated);
      setStatusMsg(`Preset '${presetName}' applied successfully.`);
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to apply preset.');
    } finally {
      setIsUpdating(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleGateChange = (gateId: string, field: 'occupancyPct' | 'queueLength', value: number) => {
    if (!localState) return;
    
    const gates = { ...localState.gates };
    const gate = { ...gates[gateId] };
    
    if (field === 'occupancyPct') {
      gate.occupancyPct = value;
      gate.status = value > 80 ? 'congested' : value > 40 ? 'moderate' : 'smooth';
    } else {
      gate.queueLength = value;
    }
    
    gates[gateId] = gate;
    setLocalState({ ...localState, gates });
  };

  const handleTransitChange = (lineId: string, field: 'etaMins' | 'delayMins', value: number) => {
    if (!localState) return;
    const transit = { ...localState.transit };
    transit[lineId] = { ...transit[lineId], [field]: value };
    setLocalState({ ...localState, transit });
  };

  const handleWeatherChange = (field: 'condition' | 'tempC', value: string | number) => {
    if (!localState) return;
    setLocalState({
      ...localState,
      weather: { ...localState.weather, [field]: value }
    });
  };

  const handleAnnounceChange = (announcement: string) => {
    if (!localState) return;
    setLocalState({
      ...localState,
      overrideAnnouncement: announcement || undefined
    });
  };

  const saveManualChanges = async () => {
    if (!localState) return;
    setIsUpdating(true);
    setStatusMsg('Saving changes...');

    const updated = {
      ...localState,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'venueState', 'stadway_stadium'), updated);
      setVenueState(updated);
      setStatusMsg('Sensor state updated successfully!');
    } catch (err) {
      console.error(err);
      setStatusMsg('Failed to update sensors.');
    } finally {
      setIsUpdating(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <div className="glass-panel p-6 border-4 border-[#0E7C3A] bg-[#FAF7F0] shadow-[6px_6px_0px_0px_#0B1120] transition-all duration-300 font-sans text-left">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sliders className="text-[#16A34A]" size={24} />
          <h2 className="text-xl font-display font-black text-[#0B1120] uppercase tracking-tight">StandWay Simulator</h2>
        </div>
        <span className="text-xs bg-[#EAF3EC] text-[#0B1120] px-3 py-1 border-2 border-[#0B1120] font-black uppercase rounded-full">
          Live Sync Mode
        </span>
      </div>

      {statusMsg && (
        <div className="mb-4 text-xs font-bold text-[#16A34A] bg-[#EAF3EC] border-4 border-[#0B1120] p-3 rounded-2xl flex items-center gap-2 shadow-[2px_2px_0px_0px_#0B1120]">
          <RefreshCw size={14} className="animate-spin text-[#16A34A]" />
          {statusMsg}
        </div>
      )}

      {/* Preset Scenarios */}
      <div className="mb-6">
        <h3 className="text-xs font-black uppercase text-[#0B1120]/70 tracking-wider mb-3">Preset Scenarios</h3>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => applyPreset('normal')}
            disabled={isUpdating}
            className="px-4 py-2.5 rounded-xl border-4 border-[#0B1120] bg-white text-[#16A34A] hover:bg-[#EAF3EC] text-xs font-black transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#0B1120] uppercase"
          >
            <Check size={14} /> Normal Flow
          </button>
          <button
            onClick={() => applyPreset('gate-surge')}
            disabled={isUpdating}
            className="px-4 py-2.5 rounded-xl border-4 border-[#0B1120] bg-white text-[#E5399A] hover:bg-[#EAF3EC] text-xs font-black transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#0B1120] uppercase"
          >
            <AlertTriangle size={14} /> Gate Surge
          </button>
          <button
            onClick={() => applyPreset('transit-delay')}
            disabled={isUpdating}
            className="px-4 py-2.5 rounded-xl border-4 border-[#0B1120] bg-white text-[#FB6B1E] hover:bg-[#EAF3EC] text-xs font-black transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#0B1120] uppercase"
          >
            <Bus size={14} /> Transit Delay
          </button>
        </div>
      </div>

      <div className="border-t-2 border-[#0B1120] my-6"></div>

      {/* Manual Fine Tuning */}
      <div className="space-y-6">
        {/* Gate Occupancy Control */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin size={16} className="text-[#D4A017]" />
            <h3 className="text-xs font-display font-black text-[#0B1120] uppercase">Gate Occupancies</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(localState.gates).map((gateId) => {
              const gate = localState.gates[gateId];
              return (
                <div key={gateId} className="bg-white border-4 border-[#0B1120] p-3 rounded-2xl shadow-[2px_2px_0px_0px_#0B1120]">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold text-[#0B1120]">{gateId.replace('_', ' ')}</span>
                    <span className={`font-mono font-black ${
                      gate.status === 'congested' ? 'text-[#E5399A]' : gate.status === 'moderate' ? 'text-[#FB6B1E]' : 'text-[#16A34A]'
                    }`}>
                      {gate.occupancyPct}% ({gate.status.toUpperCase()})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={gate.occupancyPct}
                    onChange={(e) => handleGateChange(gateId, 'occupancyPct', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#EAF3EC] rounded-lg appearance-none cursor-pointer accent-[#16A34A]"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] text-[#0B1120]/70 font-bold uppercase">Queue Length</span>
                    <input
                      type="number"
                      value={gate.queueLength}
                      onChange={(e) => handleGateChange(gateId, 'queueLength', parseInt(e.target.value) || 0)}
                      className="w-16 bg-[#FAF7F0] border-2 border-[#0B1120] text-[#0B1120] rounded text-center text-xs font-bold p-0.5 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transit Line Control */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Bus size={16} className="text-[#16A34A]" />
            <h3 className="text-xs font-display font-black text-[#0B1120] uppercase">Transit Delays</h3>
          </div>
          <div className="space-y-3">
            {Object.keys(localState.transit).map((lineId) => {
              const line = localState.transit[lineId];
              return (
                <div key={lineId} className="bg-white border-4 border-[#0B1120] p-3 rounded-2xl flex items-center justify-between gap-4 shadow-[2px_2px_0px_0px_#0B1120]">
                  <span className="text-xs font-bold text-[#0B1120] min-w-32">{lineId.replace(/_/g, ' ')}</span>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#0B1120]/70 font-bold uppercase">ETA</span>
                      <input
                        type="number"
                        min="0"
                        value={line.etaMins}
                        onChange={(e) => handleTransitChange(lineId, 'etaMins', parseInt(e.target.value) || 0)}
                        className="w-12 bg-[#FAF7F0] border-2 border-[#0B1120] text-[#0B1120] rounded text-center text-xs font-bold p-1 focus:outline-none"
                      />
                      <span className="text-[10px] text-[#0B1120]/60 font-bold">min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#0B1120]/70 font-bold uppercase">Delay</span>
                      <input
                        type="number"
                        min="0"
                        value={line.delayMins}
                        onChange={(e) => handleTransitChange(lineId, 'delayMins', parseInt(e.target.value) || 0)}
                        className="w-12 bg-[#FAF7F0] border-2 border-[#0B1120] text-[#0B1120] rounded text-center text-xs font-bold p-1 focus:outline-none"
                      />
                      <span className="text-[10px] text-[#0B1120]/60 font-bold">min</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weather & Global Override Control */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <CloudSun size={16} className="text-[#0EA5E9]" />
              <h3 className="text-xs font-display font-black text-[#0B1120] uppercase">Weather Sensors</h3>
            </div>
            <div className="bg-white border-4 border-[#0B1120] p-3 rounded-2xl space-y-2 shadow-[2px_2px_0px_0px_#0B1120]">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#0B1120]/70 font-bold uppercase">Condition</span>
                <select
                  value={localState.weather.condition}
                  onChange={(e) => handleWeatherChange('condition', e.target.value)}
                  className="bg-[#FAF7F0] border-2 border-[#0B1120] text-[#0B1120] text-xs font-bold rounded p-1 focus:outline-none"
                >
                  <option value="Clear">Clear</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Rainy">Rainy</option>
                  <option value="Stormy">Stormy</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#0B1120]/70 font-bold uppercase">Temp</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={localState.weather.tempC}
                    onChange={(e) => handleWeatherChange('tempC', parseInt(e.target.value) || 0)}
                    className="w-12 bg-[#FAF7F0] border-2 border-[#0B1120] text-[#0B1120] rounded text-center text-xs font-bold p-1 focus:outline-none"
                  />
                  <span className="text-xs text-[#0B1120]/60 font-bold">°C</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle size={16} className="text-[#E5399A]" />
              <h3 className="text-xs font-display font-black text-[#0B1120] uppercase">Global Broadcast Override</h3>
            </div>
            <textarea
              placeholder="Type urgent stadium notification..."
              value={localState.overrideAnnouncement || ''}
              onChange={(e) => handleAnnounceChange(e.target.value)}
              className="w-full h-[76px] bg-white border-4 border-[#0B1120] p-2 text-xs rounded-xl text-[#0B1120] font-bold placeholder-silver-500 focus:outline-none focus:border-[#16A34A] resize-none shadow-[2px_2px_0px_0px_#0B1120]"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={saveManualChanges}
          disabled={isUpdating}
          className="w-full py-3 bg-[#16A34A] text-white border-4 border-[#0B1120] rounded-xl text-sm font-black transition-all shadow-[3px_3px_0px_0px_#0B1120] hover:translate-y-[-1px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider font-display"
        >
          Push Sensors to Firestore (Live Sync)
        </button>
      </div>
    </div>
  );
};
