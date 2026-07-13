import React, { useEffect, useState } from 'react';
import { Navigation, Shield } from 'lucide-react';

interface StadiumMapProps {
  gateEntry?: string;
  ticketZone?: string;
  routeSteps?: string[];
  requireStepFree?: boolean;
}

export const StadiumMap: React.FC<StadiumMapProps> = ({
  gateEntry = 'Gate_A',
  ticketZone = 'Zone_A',
  routeSteps = [],
  requireStepFree = false
}) => {
  const [animatedOffset, setAnimatedOffset] = useState(0);

  // Animate path dashes for 3D/alive feel
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedOffset((prev) => (prev - 1) % 40);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Map elements positions
  const gates = {
    Gate_A: { cx: 200, cy: 60, label: 'Gate A (North)', color: '#10b981' },
    Gate_B: { cx: 340, cy: 200, label: 'Gate B (East)', color: '#ec4899' },
    Gate_C: { cx: 200, cy: 340, label: 'Gate C (South)', color: '#10b981' },
    Gate_D: { cx: 60, cy: 200, label: 'Gate D (West)', color: '#10b981' }
  };

  const zones = {
    Zone_A: { cx: 200, cy: 110, label: 'Sec A (North)' },
    Zone_B: { cx: 290, cy: 200, label: 'Sec B (East)' },
    Zone_C: { cx: 200, cy: 290, label: 'Sec C (South)' },
    Zone_D: { cx: 110, cy: 200, label: 'Sec D (West)' }
  };

  const amenities = [
    { cx: 140, cy: 140, label: 'Restrooms', type: 'toilet' },
    { cx: 260, cy: 140, label: 'Restrooms (Accessible)', type: 'accessible-toilet' },
    { cx: 140, cy: 260, label: 'First Aid', type: 'first-aid' },
    { cx: 260, cy: 260, label: 'Accessible Lift L3', type: 'lift' }
  ];

  // Route calculation based on selected entry gate & ticket zone
  const activeGate = gates[gateEntry as keyof typeof gates] || gates.Gate_A;
  const activeZone = zones[ticketZone as keyof typeof zones] || zones.Zone_A;
  
  // Custom path builder
  const getPathD = () => {
    // If step-free, we route through Lifts
    if (requireStepFree) {
      const lift = amenities.find(a => a.type === 'lift') || { cx: 260, cy: 260 };
      return `M ${activeGate.cx} ${activeGate.cy} Q ${(activeGate.cx + lift.cx)/2} ${(activeGate.cy + lift.cy)/2} ${lift.cx} ${lift.cy} T ${activeZone.cx} ${activeZone.cy}`;
    }
    // Standard path
    return `M ${activeGate.cx} ${activeGate.cy} Q 200 200 ${activeZone.cx} ${activeZone.cy}`;
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 flex flex-col items-center">
      <div className="flex justify-between w-full mb-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Navigation size={12} className="text-accent-cyan animate-pulse" />
          Interactive Stadium HUD
        </span>
        <span className="flex items-center gap-1">
          <Shield size={12} className="text-accent-emerald" />
          Privacy-by-Design Active
        </span>
      </div>

      <div className="relative w-full aspect-square max-w-[360px] bg-navy-900/60 rounded-xl overflow-hidden border border-navy-700/50">
        {/* SVG Drawing Canvas */}
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Radial grids */}
          <circle cx="200" cy="200" r="180" fill="none" stroke="#25314a" strokeWidth="1" strokeDasharray="5,5" />
          <circle cx="200" cy="200" r="140" fill="none" stroke="#25314a" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx="200" cy="200" r="90" fill="none" stroke="#25314a" strokeWidth="1" />

          {/* Stadium Inner Pitch */}
          <rect x="150" y="130" width="100" height="140" rx="10" fill="#121824" stroke="#7c3aed" strokeWidth="1.5" opacity="0.3" />
          <line x1="150" y1="200" x2="250" y2="200" stroke="#7c3aed" strokeWidth="1" opacity="0.2" />
          <circle cx="200" cy="200" r="25" fill="none" stroke="#7c3aed" strokeWidth="1" opacity="0.2" />

          {/* Active Navigation Pathway */}
          {routeSteps.length > 0 && (
            <>
              {/* Glow filter path */}
              <path
                d={getPathD()}
                fill="none"
                stroke="#a78bfa"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.3"
                className="blur-sm"
              />
              {/* Dynamic moving dash path */}
              <path
                d={getPathD()}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="8,8"
                strokeDashoffset={animatedOffset}
              />
            </>
          )}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Amenities Rendering */}
          {amenities.map((amenity, idx) => (
            <g key={idx} opacity="0.8">
              <circle
                cx={amenity.cx}
                cy={amenity.cy}
                r="6"
                fill={amenity.type === 'lift' || amenity.type === 'accessible-toilet' ? '#06b6d4' : '#1e293b'}
                stroke="#475569"
                strokeWidth="1"
              />
              <text
                x={amenity.cx}
                y={amenity.cy - 10}
                fill="#94a3b8"
                fontSize="8"
                textAnchor="middle"
                className="pointer-events-none"
              >
                {amenity.label}
              </text>
            </g>
          ))}

          {/* Gate Markers */}
          {Object.entries(gates).map(([id, gate]) => {
            const isEntry = id === gateEntry;
            return (
              <g key={id} className="cursor-pointer transition-transform duration-300 hover:scale-110">
                {isEntry && (
                  <circle cx={gate.cx} cy={gate.cy} r="18" fill="url(#glowGrad)" className="animate-pulse" />
                )}
                <circle
                  cx={gate.cx}
                  cy={gate.cy}
                  r="10"
                  fill="#0a0d14"
                  stroke={isEntry ? '#a78bfa' : gate.color}
                  strokeWidth={isEntry ? 3 : 1.5}
                />
                <circle cx={gate.cx} cy={gate.cy} r="4" fill={isEntry ? '#06b6d4' : gate.color} />
                <text
                  x={gate.cx}
                  y={gate.cy + 22}
                  fill={isEntry ? '#ffffff' : '#94a3b8'}
                  fontSize="9"
                  fontWeight={isEntry ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {id.replace('_', ' ')}
                </text>
              </g>
            );
          })}

          {/* Section Zones */}
          {Object.entries(zones).map(([id, zone]) => {
            const isTarget = id === ticketZone;
            return (
              <g key={id}>
                <rect
                  x={zone.cx - 24}
                  y={zone.cy - 12}
                  width="48"
                  height="24"
                  rx="6"
                  fill={isTarget ? '#7c3aed' : '#1e293b'}
                  stroke={isTarget ? '#a78bfa' : '#334155'}
                  strokeWidth={isTarget ? 1.5 : 1}
                  opacity={isTarget ? 0.95 : 0.6}
                />
                <text
                  x={zone.cx}
                  y={zone.cy + 4}
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {id.replace('_', ' ')}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating details overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-navy-950/80 backdrop-blur-md px-3 py-2.5 rounded-xl border border-navy-700/60 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-semibold uppercase">Active Navigation Route</span>
            <span className="text-xs text-white font-medium">
              {gateEntry.replace('_', ' ')} → {ticketZone.replace('_', ' ')}
            </span>
          </div>
          <div className="flex gap-2">
            {requireStepFree && (
              <span className="text-[9px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded font-bold border border-cyan-800">
                Step-Free Path
              </span>
            )}
            <span className="text-[9px] bg-purple-950 text-purple-400 px-2 py-0.5 rounded font-bold border border-purple-800">
              HUD OK
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-[10px] text-gray-500 mt-2 text-center max-w-[280px]">
        Aggregate sensor flow overlay. Facial data tracking disabled per privacy regulations.
      </p>
    </div>
  );
};
