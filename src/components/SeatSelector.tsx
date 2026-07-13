import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (selectedZone) {
      setActiveZone(selectedZone);
    }
  }, [selectedZone]);

  
  const parseCurrentSeat = () => {
    if (!selectedSeat) return { row: '', number: 0 };
    const match = selectedSeat.match(/Row\s([A-E]),\sSeat\s(\d+)/i);
    if (match) {
      return { row: match[1], number: parseInt(match[2]) };
    }
    return { row: '', number: 0 };
  };

  const currentSelection = parseCurrentSeat();

  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 14;

  const isSeatSold = (row: string, num: number, zone: string) => {
    if (row === 'E' && (num === 6 || num === 7 || num === 8 || num === 9)) {
      return false;
    }
    const val = (row.charCodeAt(0) * 7 + num * 13 + zone.charCodeAt(5) * 3) % 100;
    return val < 35;
  };

  const handleSeatClick = (row: string, num: number) => {
    const isAccessible = row === 'E' && (num === 6 || num === 7 || num === 8 || num === 9);
    const seatString = `Row ${row}, Seat ${num}`;
    onChangeSeat(activeZone, seatString, isAccessible);
  };

  return (
    <div className="glass-panel p-5 border border-gold-500/10 text-left space-y-5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-pitch-400/5 rounded-full blur-2xl"></div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="text-gold-400" size={20} />
          <h3 className="font-display font-semibold text-white text-base">Select Stadium Seat</h3>
        </div>
        <span className="text-[10px] bg-stadium-900 text-gold-300 px-2.5 py-1 border border-gold-500/20 font-bold">
          Interactive Seating Map
        </span>
      </div>

      {/* Zone Switcher Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-stadium-950/65 border border-stadium-750/40 text-xs text-center font-semibold">
        {['Zone_A', 'Zone_B', 'Zone_C', 'Zone_D'].map((zoneId) => {
          const isActive = activeZone === zoneId;
          const label = zoneId.replace('Zone_', 'Section ');
          return (
            <button
              key={zoneId}
              type="button"
              onClick={() => setActiveZone(zoneId)}
              className={`py-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-stadium-950 font-bold'
                  : 'text-silver-400 hover:text-gold-300'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Curved Pitch Indicator */}
      <div className="relative pt-6 pb-2 text-center">
        <div className="w-11/12 h-6 border-t-2 border-dashed border-pitch-500/40 mx-auto rounded-[50%] flex items-center justify-center">
          <span className="text-[9px] uppercase tracking-widest text-pitch-400 font-bold bg-stadium-950 px-4 py-0.5 border border-pitch-500/20">
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
                <span className="w-4 text-xs font-mono font-bold text-silver-500 text-center mr-1">
                  {row}
                </span>

                {Array.from({ length: seatsPerRow }, (_, i) => i + 1).map((num) => {
                  const isSold = isSeatSold(row, num, activeZone);
                  const isAccessibleSeat = isAccessibleRow && (num === 6 || num === 7 || num === 8 || num === 9);
                  const isSelected = selectedZone === activeZone && currentSelection.row === row && currentSelection.number === num;
                  const isAisle = num === 4 || num === 10;

                  return (
                    <React.Fragment key={num}>
                      <button
                        type="button"
                        disabled={isSold}
                        onClick={() => handleSeatClick(row, num)}
                        className={`w-6 h-6 flex items-center justify-center transition-all cursor-pointer text-[9px] font-mono font-bold ${
                          isSold
                            ? 'bg-stadium-900 text-silver-500 border border-stadium-800 opacity-40 cursor-not-allowed'
                            : isSelected
                            ? 'bg-pitch-500 text-white border border-pitch-400 shadow-[0_0_12px_rgba(34,163,82,0.5)] scale-115'
                            : isAccessibleSeat
                            ? isWheelchairUser
                              ? 'bg-stadium-850 text-status-info border border-status-info animate-pulse hover:bg-stadium-800'
                              : 'bg-stadium-800 text-status-info border border-status-info/50 hover:bg-stadium-850'
                            : 'bg-stadium-800 text-silver-400 border border-stadium-700/30 hover:border-gold-500/40 hover:bg-stadium-750'
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
                      
                      {isAisle && <div className="w-4 h-6 pointer-events-none"></div>}
                    </React.Fragment>
                  );
                })}

                <span className="w-4 text-xs font-mono font-bold text-silver-500 text-center ml-1">
                  {row}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-stadium-800/80 text-xs">
        <div className="flex flex-wrap gap-4 text-silver-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-stadium-800 border border-stadium-700/30"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-pitch-500 border border-pitch-400 shadow-[0_0_8px_rgba(34,163,82,0.3)]"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-stadium-900 border border-stadium-800 opacity-40"></div>
            <span>Sold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-stadium-800 border border-status-info/50 flex items-center justify-center text-status-info">
              <Accessibility size={9} />
            </div>
            <span>Wheelchair Area</span>
          </div>
        </div>

        {selectedSeat && selectedZone === activeZone && (
          <div className="bg-pitch-500/10 border border-pitch-500/25 px-3 py-1.5 text-pitch-400 font-semibold text-center flex items-center gap-1.5 shadow-sm">
            <div className="w-1.5 h-1.5 bg-pitch-400 rounded-full animate-ping"></div>
            Selected: {activeZone.replace('Zone_', 'Sec ')}, {selectedSeat}
          </div>
        )}
      </div>
    </div>
  );
};
