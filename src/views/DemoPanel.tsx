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
    if (venueState && !localState) {
      setLocalState(JSON.parse(JSON.stringify(venueState)));
    }
  }, [venueState]);

  if (!localState) {
    return (
      <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-silver-400">
        <RefreshCw className="animate-spin mb-2 text-gold-500" />
        <p>Connecting to stadium sensor simulator...</p>
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

  const handleWeatherChange = (field: 'condition' | 'tempC', value: any) => {
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
    <div className="glass-panel p-6 rounded-2xl glow-bg border border-gold-500/20 shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sliders className="text-gold-500" size={24} />
          <h2 className="text-xl font-display font-semibold tracking-wide text-white">StadWay Venue Simulator</h2>
        </div>
        <span className="text-xs bg-stadium-850/40 text-gold-300 px-2.5 py-1 rounded-full border border-gold-500/30">
          Live Sync Mode
        </span>
      </div>

      {statusMsg && (
        <div className="mb-4 text-xs font-semibold text-pitch-400 bg-stadium-850/40 border border-pitch-500/30 p-3 rounded-lg flex items-center gap-2">
          <RefreshCw size={14} className="animate-spin text-pitch-400" />
          {statusMsg}
        </div>
      )}

      {/* Preset Scenarios */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase text-silver-400 tracking-wider mb-3">Preset Scenarios</h3>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => applyPreset('normal')}
            disabled={isUpdating}
            className="px-4 py-2.5 rounded-xl border border-pitch-500/20 bg-stadium-850/20 hover:bg-stadium-850/40 text-emerald-400 text-sm font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check size={14} /> Normal Flow
          </button>
          <button
            onClick={() => applyPreset('gate-surge')}
            disabled={isUpdating}
            className="px-4 py-2.5 rounded-xl border border-status-danger/20 bg-stadium-850/20 hover:bg-stadium-850/40 text-status-danger text-sm font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle size={14} /> Gate B Surge
          </button>
          <button
            onClick={() => applyPreset('transit-delay')}
            disabled={isUpdating}
            className="px-4 py-2.5 rounded-xl border border-status-warning/20 bg-amber-950/20 hover:bg-amber-950/40 text-status-warning text-sm font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Bus size={14} /> Transit Delay
          </button>
        </div>
      </div>

      <div className="border-t border-stadium-700/50 my-6"></div>

      {/* Manual Fine Tuning */}
      <div className="space-y-6">
        {/* Gate Occupancy Control */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin size={16} className="text-gold-500" />
            <h3 className="text-sm font-semibold text-silver-300">Gate Occupancies</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(localState.gates).map((gateId) => {
              const gate = localState.gates[gateId];
              return (
                <div key={gateId} className="bg-stadium-800/40 border border-stadium-700/50 p-3 rounded-xl">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-semibold text-silver-300">{gateId.replace('_', ' ')}</span>
                    <span className={`font-mono font-bold ${
                      gate.status === 'congested' ? 'text-status-danger' : gate.status === 'moderate' ? 'text-status-warning' : 'text-emerald-400'
                    }`}>
                      {gate.occupancyPct}% ({gate.status})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={gate.occupancyPct}
                    onChange={(e) => handleGateChange(gateId, 'occupancyPct', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-stadium-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] text-silver-400">Queue Length</span>
                    <input
                      type="number"
                      value={gate.queueLength}
                      onChange={(e) => handleGateChange(gateId, 'queueLength', parseInt(e.target.value) || 0)}
                      className="w-16 bg-stadium-950 border border-stadium-700 text-white rounded text-center text-xs p-0.5"
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
            <Bus size={16} className="text-pitch-400" />
            <h3 className="text-sm font-semibold text-silver-300">Transit Delays</h3>
          </div>
          <div className="space-y-3">
            {Object.keys(localState.transit).map((lineId) => {
              const line = localState.transit[lineId];
              return (
                <div key={lineId} className="bg-stadium-800/40 border border-stadium-700/50 p-3 rounded-xl flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-silver-300 min-w-32">{lineId.replace(/_/g, ' ')}</span>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-silver-400">ETA</span>
                      <input
                        type="number"
                        min="0"
                        value={line.etaMins}
                        onChange={(e) => handleTransitChange(lineId, 'etaMins', parseInt(e.target.value) || 0)}
                        className="w-12 bg-stadium-950 border border-stadium-700 text-white rounded text-center text-xs p-1"
                      />
                      <span className="text-[10px] text-silver-400">min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-silver-400">Delay</span>
                      <input
                        type="number"
                        min="0"
                        value={line.delayMins}
                        onChange={(e) => handleTransitChange(lineId, 'delayMins', parseInt(e.target.value) || 0)}
                        className="w-12 bg-stadium-950 border border-stadium-700 text-white rounded text-center text-xs p-1"
                      />
                      <span className="text-[10px] text-silver-400">min</span>
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
              <CloudSun size={16} className="text-gold-300" />
              <h3 className="text-xs font-semibold text-silver-300">Weather Sensors</h3>
            </div>
            <div className="bg-stadium-800/40 border border-stadium-700/50 p-3 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-silver-400">Condition</span>
                <select
                  value={localState.weather.condition}
                  onChange={(e) => handleWeatherChange('condition', e.target.value)}
                  className="bg-stadium-950 border border-stadium-700 text-white text-xs rounded p-1"
                >
                  <option value="Clear">Clear</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Rainy">Rainy</option>
                  <option value="Stormy">Stormy</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-silver-400">Temp</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={localState.weather.tempC}
                    onChange={(e) => handleWeatherChange('tempC', parseInt(e.target.value) || 0)}
                    className="w-12 bg-stadium-950 border border-stadium-700 text-white rounded text-center text-xs p-1"
                  />
                  <span className="text-xs text-silver-400">°C</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle size={16} className="text-status-warning" />
              <h3 className="text-xs font-semibold text-silver-300">Global Broadcast Override</h3>
            </div>
            <textarea
              placeholder="Type urgent stadium notification..."
              value={localState.overrideAnnouncement || ''}
              onChange={(e) => handleAnnounceChange(e.target.value)}
              className="w-full h-[76px] bg-stadium-800/40 border border-stadium-700/50 p-2 text-xs rounded-xl text-white placeholder-silver-500 focus:outline-none focus:border-gold-500 resize-none"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={saveManualChanges}
          disabled={isUpdating}
          className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-gold-500/20 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Push Sensors to Firestore (Live Sync)
        </button>
      </div>
    </div>
  );
};
