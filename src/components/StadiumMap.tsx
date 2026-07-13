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

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedOffset((prev) => (prev - 1) % 40);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const gates = {
    Gate_A: { cx: 200, cy: 60, label: 'Gate A (North)', color: '#22a352' },
    Gate_B: { cx: 340, cy: 200, label: 'Gate B (East)', color: '#e04848' },
    Gate_C: { cx: 200, cy: 340, label: 'Gate C (South)', color: '#22a352' },
    Gate_D: { cx: 60, cy: 200, label: 'Gate D (West)', color: '#22a352' }
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

  const activeGate = gates[gateEntry as keyof typeof gates] || gates.Gate_A;
  const activeZone = zones[ticketZone as keyof typeof zones] || zones.Zone_A;
  
  const getPathD = () => {
    if (requireStepFree) {
      const lift = amenities.find(a => a.type === 'lift') || { cx: 260, cy: 260 };
      return `M ${activeGate.cx} ${activeGate.cy} Q ${(activeGate.cx + lift.cx)/2} ${(activeGate.cy + lift.cy)/2} ${lift.cx} ${lift.cy} T ${activeZone.cx} ${activeZone.cy}`;
    }
    return `M ${activeGate.cx} ${activeGate.cy} Q 200 200 ${activeZone.cx} ${activeZone.cy}`;
  };

  return (
    <div className="glass-panel p-5 border border-stadium-750/30 flex flex-col items-center">
      <div className="flex justify-between w-full mb-3 text-xs text-silver-400">
        <span className="flex items-center gap-1">
          <Navigation size={12} className="text-gold-400 animate-pulse" />
          Interactive Stadium Map
        </span>
        <span className="flex items-center gap-1">
          <Shield size={12} className="text-pitch-400" />
          Privacy-by-Design
        </span>
      </div>

      <div className="relative w-full aspect-square max-w-[360px] bg-stadium-900/60 overflow-hidden border border-stadium-700/50">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Grid circles */}
          <circle cx="200" cy="200" r="180" fill="none" stroke="#1c2f55" strokeWidth="1" strokeDasharray="5,5" />
          <circle cx="200" cy="200" r="140" fill="none" stroke="#1c2f55" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx="200" cy="200" r="90" fill="none" stroke="#1c2f55" strokeWidth="1" />

          {/* Pitch */}
          <rect x="150" y="130" width="100" height="140" rx="4" fill="#0c1426" stroke="#1a7a3d" strokeWidth="1.5" opacity="0.5" />
          <line x1="150" y1="200" x2="250" y2="200" stroke="#1a7a3d" strokeWidth="1" opacity="0.35" />
          <circle cx="200" cy="200" r="25" fill="none" stroke="#1a7a3d" strokeWidth="1" opacity="0.35" />

          {/* Active Route Path */}
          {routeSteps.length > 0 && (
            <>
              <path
                d={getPathD()}
                fill="none"
                stroke="#c8a84e"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.2"
                className="blur-sm"
              />
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

          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c8a84e" />
              <stop offset="50%" stopColor="#dbbe5a" />
              <stop offset="100%" stopColor="#22a352" />
            </linearGradient>
            <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c8a84e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Amenities */}
          {amenities.map((amenity, idx) => (
            <g key={idx} opacity="0.8">
              <circle
                cx={amenity.cx}
                cy={amenity.cy}
                r="6"
                fill={amenity.type === 'lift' || amenity.type === 'accessible-toilet' ? '#3a8fd4' : '#162544'}
                stroke="#243b6a"
                strokeWidth="1"
              />
              <text
                x={amenity.cx}
                y={amenity.cy - 10}
                fill="#8892a8"
                fontSize="8"
                textAnchor="middle"
                className="pointer-events-none"
              >
                {amenity.label}
              </text>
            </g>
          ))}

          {/* Gates */}
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
                  fill="#0c1426"
                  stroke={isEntry ? '#c8a84e' : gate.color}
                  strokeWidth={isEntry ? 3 : 1.5}
                />
                <circle cx={gate.cx} cy={gate.cy} r="4" fill={isEntry ? '#dbbe5a' : gate.color} />
                <text
                  x={gate.cx}
                  y={gate.cy + 22}
                  fill={isEntry ? '#f0e0a8' : '#8892a8'}
                  fontSize="9"
                  fontWeight={isEntry ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {id.replace('_', ' ')}
                </text>
              </g>
            );
          })}

          {/* Zones */}
          {Object.entries(zones).map(([id, zone]) => {
            const isTarget = id === ticketZone;
            return (
              <g key={id}>
                <rect
                  x={zone.cx - 24}
                  y={zone.cy - 12}
                  width="48"
                  height="24"
                  rx="3"
                  fill={isTarget ? '#c8a84e' : '#162544'}
                  stroke={isTarget ? '#dbbe5a' : '#243b6a'}
                  strokeWidth={isTarget ? 1.5 : 1}
                  opacity={isTarget ? 0.95 : 0.6}
                />
                <text
                  x={zone.cx}
                  y={zone.cy + 4}
                  fill={isTarget ? '#060b18' : '#b0b8c8'}
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

        {/* Overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-stadium-950/85 backdrop-blur-md px-3 py-2.5 border border-stadium-700/40 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-silver-500 font-semibold uppercase">Active Route</span>
            <span className="text-xs text-white font-medium">
              {gateEntry.replace('_', ' ')} → {ticketZone.replace('_', ' ')}
            </span>
          </div>
          <div className="flex gap-2">
            {requireStepFree && (
              <span className="text-[9px] bg-status-info/10 text-status-info px-2 py-0.5 font-bold border border-status-info/30">
                Step-Free
              </span>
            )}
            <span className="text-[9px] bg-pitch-500/10 text-pitch-400 px-2 py-0.5 font-bold border border-pitch-500/30">
              Live
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-[10px] text-silver-500 mt-2 text-center max-w-[280px]">
        Aggregate sensor flow overlay. Privacy-preserved analytics only.
      </p>
    </div>
  );
};
