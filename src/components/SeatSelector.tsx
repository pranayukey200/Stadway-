import React, { useState } from 'react';
import { Check, Accessibility, Shield } from 'lucide-react';

interface SeatSelectorProps {
  selectedZone: string;
  selectedSeat: string;
  onChangeSeat: (zone: string, seat: string, isAccessible: boolean) => void;
  isWheelchairUser: boolean;
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  selectedZone,
  selectedSeat,
  onChangeSeat,
  isWheelchairUser
}) => {
  const [activeZone, setActiveZone] = useState<string>(selectedZone || 'Zone_A');
  
  // Parse currently selected row and seat number from props
  // e.g. "Row C, Seat 8" -> Row = "C", Seat = "8"
  const parseCurrentSeat = () => {
    if (!selectedSeat) return { row: '', number: 0 };
    const match = selectedSeat.match(/Row\s([A-E]),\sSeat\s(\d+)/i);
    if (match) {
      return { row: match[1], number: parseInt(match[2]) };
    }
    return { row: '', number: 0 };
  };

  const currentSelection = parseCurrentSeat();

  // Grid definition
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 14;

  // Generate deterministic sold seats based on seat row and number so they don't jump around on render
  const isSeatSold = (row: string, num: number, zone: string) => {
    // Accessible seats are in Row E
    if (row === 'E' && (num === 6 || num === 7 || num === 8 || num === 9)) {
      return false; // Never sold by default so they can be selected
    }
    
    // Hash function for seat status
    const val = (row.charCodeAt(0) * 7 + num * 13 + zone.charCodeAt(5) * 3) % 100;
    return val < 35; // 35% sold
  };

  const handleSeatClick = (row: string, num: number) => {
    const isAccessible = row === 'E' && (num === 6 || num === 7 || num === 8 || num === 9);
    const seatString = `Row ${row}, Seat ${num}`;
    onChangeSeat(activeZone, seatString, isAccessible);
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 text-left space-y-5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/5 rounded-full blur-2xl"></div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="text-accent-purple" size={20} />
          <h3 className="font-display font-semibold text-white text-base">Select Stadium Seat</h3>
        </div>
        <span className="text-[10px] bg-purple-950/40 text-accent-light px-2.5 py-1 rounded-full border border-purple-500/25 font-bold">
          Interactive Seating HUD
        </span>
      </div>

      {/* Zone Switcher Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-navy-950/65 rounded-xl border border-navy-850 text-xs text-center font-semibold">
        {['Zone_A', 'Zone_B', 'Zone_C', 'Zone_D'].map((zoneId) => {
          const isActive = activeZone === zoneId;
          const label = zoneId.replace('Zone_', 'Section ');
          return (
            <button
              key={zoneId}
              type="button"
              onClick={() => setActiveZone(zoneId)}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-accent-purple text-white shadow-md shadow-purple-500/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Curved Screen / Pitch Representation */}
      <div className="relative pt-6 pb-2 text-center">
        <div className="w-11/12 h-6 border-t-2 border-dashed border-purple-500/40 mx-auto rounded-[50%] flex items-center justify-center">
          <span className="text-[9px] uppercase tracking-widest text-accent-cyan font-bold bg-navy-950 px-4 py-0.5 border border-cyan-500/20 rounded-full shadow-inner animate-pulse">
            ⚽ PITCH / FIELD DIRECTION ⚽
          </span>
        </div>
      </div>

      {/* Seating Grid Container */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="min-w-[420px] flex flex-col gap-2.5 items-center justify-center py-2 px-1">
          {rows.map((row) => {
            const isAccessibleRow = row === 'E';
            return (
              <div key={row} className="flex gap-1.5 items-center">
                {/* Row label */}
                <span className="w-4 text-xs font-mono font-bold text-gray-500 text-center mr-1">
                  {row}
                </span>

                {/* Seats */}
                {Array.from({ length: seatsPerRow }, (_, i) => i + 1).map((num) => {
                  const isSold = isSeatSold(row, num, activeZone);
                  const isAccessibleSeat = isAccessibleRow && (num === 6 || num === 7 || num === 8 || num === 9);
                  const isSelected = selectedZone === activeZone && currentSelection.row === row && currentSelection.number === num;
                  // Introduce Aisle gaps after seat 4 and seat 10
                  const isAisle = num === 4 || num === 10;

                  return (
                    <React.Fragment key={num}>
                      <button
                        type="button"
                        disabled={isSold}
                        onClick={() => handleSeatClick(row, num)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer text-[9px] font-mono font-bold ${
                          isSold
                            ? 'bg-navy-900 text-gray-700 border border-navy-800 opacity-40 cursor-not-allowed'
                            : isSelected
                            ? 'bg-accent-emerald text-white border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-115'
                            : isAccessibleSeat
                            ? isWheelchairUser
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-500 animate-pulse hover:bg-cyan-900'
                              : 'bg-navy-800 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-950/40'
                            : 'bg-navy-800 text-gray-400 border border-purple-500/10 hover:border-accent-purple/50 hover:bg-navy-750'
                        }`}
                        title={`${activeZone.replace('_', ' ')} Row ${row} Seat ${num} ${
                          isSold ? '(Sold)' : isAccessibleSeat ? '(Accessible Wheelchair Spot)' : '(Available)'
                        }`}
                      >
                        {isAccessibleSeat ? (
                          <Accessibility size={11} className="shrink-0" />
                        ) : isSelected ? (
                          <Check size={10} className="shrink-0 stroke-[3]" />
                        ) : (
                          num
                        )}
                      </button>
                      
                      {/* Render aisle spacer */}
                      {isAisle && <div className="w-4 h-6 pointer-events-none"></div>}
                    </React.Fragment>
                  );
                })}

                {/* Row label right */}
                <span className="w-4 text-xs font-mono font-bold text-gray-500 text-center ml-1">
                  {row}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Summary Details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-navy-800/80 text-xs">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-navy-800 border border-purple-500/10"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-accent-emerald border border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-navy-900 border border-navy-800 opacity-40"></div>
            <span>Sold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-navy-800 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Accessibility size={9} />
            </div>
            <span>Wheelchair Area</span>
          </div>
        </div>

        {/* Selected Seat Text */}
        {selectedSeat && selectedZone === activeZone && (
          <div className="bg-emerald-950/20 border border-emerald-500/25 px-3 py-1.5 rounded-xl text-emerald-400 font-semibold text-center flex items-center gap-1.5 shadow-sm">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div>
            Selected: {activeZone.replace('Zone_', 'Sec ')}, {selectedSeat}
          </div>
        )}
      </div>
    </div>
  );
};
