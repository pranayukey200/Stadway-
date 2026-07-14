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
    Gate_A: { cx: 200, cy: 60, label: 'Gate A (North)', color: '#16A34A' },
    Gate_B: { cx: 340, cy: 200, label: 'Gate B (East)', color: '#E5399A' },
    Gate_C: { cx: 200, cy: 340, label: 'Gate C (South)', color: '#16A34A' },
    Gate_D: { cx: 60, cy: 200, label: 'Gate D (West)', color: '#16A34A' }
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
    <div className="glass-panel p-5 border-4 border-[#0E7C3A] bg-[#FAF7F0] shadow-[6px_6px_0px_0px_#0B1120] flex flex-col items-center font-sans">
      <div className="flex justify-between w-full mb-3 text-xs text-[#0B1120]/75 font-black uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <Navigation size={12} className="text-[#D4A017] animate-pulse" />
          Interactive Stadium Map
        </span>
        <span className="flex items-center gap-1">
          <Shield size={12} className="text-[#16A34A]" />
          Privacy-by-Design
        </span>
      </div>

      <div className="relative w-full aspect-square max-w-[360px] bg-white overflow-hidden border-4 border-[#0B1120] rounded-2xl shadow-[4px_4px_0px_0px_#0B1120]">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Grid circles */}
          <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(11, 17, 32, 0.1)" strokeWidth="1" strokeDasharray="5,5" />
          <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(11, 17, 32, 0.1)" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx="200" cy="200" r="90" fill="none" stroke="rgba(11, 17, 32, 0.1)" strokeWidth="1" />

          {/* Pitch */}
          <rect x="150" y="130" width="100" height="140" rx="4" fill="#FAF7F0" stroke="#16A34A" strokeWidth="2" opacity="0.6" />
          <line x1="150" y1="200" x2="250" y2="200" stroke="#16A34A" strokeWidth="1" opacity="0.5" />
          <circle cx="200" cy="200" r="25" fill="none" stroke="#16A34A" strokeWidth="1" opacity="0.5" />

          {/* Active Route Path */}
          {routeSteps.length > 0 && (
            <>
              <path
                d={getPathD()}
                fill="none"
                stroke="#D4A017"
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
              <stop offset="0%" stopColor="#D4A017" />
              <stop offset="50%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
            <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D4A017" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FAF7F0" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Amenities */}
          {amenities.map((amenity, idx) => (
            <g key={idx} opacity="0.8">
              <circle
                cx={amenity.cx}
                cy={amenity.cy}
                r="6"
                fill={amenity.type === 'lift' || amenity.type === 'accessible-toilet' ? '#0EA5E9' : '#FAF7F0'}
                stroke="#0B1120"
                strokeWidth="2"
              />
              <text
                x={amenity.cx}
                y={amenity.cy - 10}
                fill="#0B1120"
                fontSize="8"
                fontWeight="bold"
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
                  fill="white"
                  stroke={isEntry ? '#D4A017' : '#0B1120'}
                  strokeWidth={isEntry ? 4 : 2}
                />
                <circle cx={gate.cx} cy={gate.cy} r="4" fill={isEntry ? '#D4A017' : '#16A34A'} />
                <text
                  x={gate.cx}
                  y={gate.cy + 22}
                  fill="#0B1120"
                  fontSize="9"
                  fontWeight="bold"
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
                  rx="4"
                  fill={isTarget ? '#D4A017' : 'white'}
                  stroke="#0B1120"
                  strokeWidth={isTarget ? 3 : 2}
                  opacity={isTarget ? 1 : 0.7}
                />
                <text
                  x={zone.cx}
                  y={zone.cy + 4}
                  fill={isTarget ? 'white' : '#0B1120'}
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
        <div className="absolute bottom-3 left-3 right-3 bg-[#EAF3EC] px-3 py-2.5 border-4 border-[#0B1120] rounded-xl shadow-[3px_3px_0px_0px_#0B1120] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] text-[#0B1120]/60 font-black uppercase">Active Route</span>
            <span className="text-xs text-[#0B1120] font-black">
              {gateEntry.replace('_', ' ')} → {ticketZone.replace('_', ' ')}
            </span>
          </div>
          <div className="flex gap-2">
            {requireStepFree && (
              <span className="text-[9px] bg-[#EAF3EC] text-[#0EA5E9] px-2 py-0.5 border-2 border-[#0B1120] font-black uppercase rounded-full">
                Step-Free
              </span>
            )}
            <span className="text-[9px] bg-[#EAF3EC] text-[#16A34A] px-2 py-0.5 border-2 border-[#0B1120] font-black uppercase rounded-full">
              Live
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-[10px] text-[#0B1120]/60 mt-2 text-center max-w-[280px] font-bold">
        Aggregate sensor flow overlay. Privacy-preserved analytics only.
      </p>
    </div>
  );
};
