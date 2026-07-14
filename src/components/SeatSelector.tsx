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
    const match = selectedSeat.match(/Row\s([A-E]),\sSeat\s(\\d+)/i);
    if (match) {
      return { row: match[1], number: parseInt(match[2]) };
    }
    const fallbackMatch = selectedSeat.match(/Row\s([A-E]),\sSeat\s(\d+)/i);
    if (fallbackMatch) {
      return { row: fallbackMatch[1], number: parseInt(fallbackMatch[2]) };
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
    <div className="glass-panel p-5 border-4 border-[#0E7C3A] bg-[#121E36] shadow-[6px_6px_0px_0px_#0B1120] text-left space-y-5 relative overflow-hidden font-sans text-white">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#16A34A]/10 rounded-full blur-2xl"></div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="text-[#D4A017]" size={20} />
          <h3 className="font-display font-black text-white uppercase text-base">Select Stadium Seat</h3>
        </div>
        <span className="text-[10px] bg-[#0B1120] text-white px-2.5 py-1 border-2 border-white font-black uppercase rounded-full">
          Interactive Seating Map
        </span>
      </div>

      {/* Zone Switcher Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#0B1120] border-4 border-[#0B1120] text-xs text-center font-black rounded-xl overflow-hidden">
        {['Zone_A', 'Zone_B', 'Zone_C', 'Zone_D'].map((zoneId) => {
          const isActive = activeZone === zoneId;
          const label = zoneId.replace('Zone_', 'Section ');
          const labelShort = zoneId.replace('Zone_', 'Sec ');
          return (
            <button
              key={zoneId}
              type="button"
              onClick={() => setActiveZone(zoneId)}
              className={`py-2 transition-all cursor-pointer rounded-lg uppercase tracking-wider ${
                isActive
                  ? 'bg-[#16A34A] text-white shadow-[2px_2px_0px_0px_#0B1120] border-2 border-white'
                  : 'text-white/70 hover:text-[#16A34A]'
              }`}
            >
              <span className="hidden sm:inline">{label}</span>
              <span className="inline sm:hidden text-[10px]">{labelShort}</span>
            </button>
          );
        })}
      </div>

      {/* Curved Pitch Indicator */}
      <div className="relative pt-6 pb-2 text-center">
        <div className="w-11/12 h-6 border-t-2 border-dashed border-[#16A34A]/50 mx-auto rounded-[50%] flex items-center justify-center">
          <span className="text-[9px] uppercase tracking-widest text-[#16A34A] font-black bg-[#121E36] px-4 py-0.5 border-2 border-[#0B1120] rounded-full">
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
                <span className="w-4 text-xs font-mono font-bold text-white/60 text-center mr-1">
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
                        className={`w-6 h-6 flex items-center justify-center transition-all cursor-pointer text-[9px] font-mono font-bold rounded-md ${
                          isSold
                            ? 'bg-[#0B1120] text-white/20 border-2 border-[#0B1120]/40 opacity-30 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#16A34A] text-white border-2 border-white shadow-[2px_2px_0px_0px_#0B1120] scale-110'
                            : isAccessibleSeat
                            ? isWheelchairUser
                              ? 'bg-[#0EA5E9] text-white border-2 border-white shadow-[2px_2px_0px_0px_#0B1120] animate-pulse'
                              : 'bg-[#121E36] text-[#0EA5E9] border-2 border-[#0EA5E9]'
                            : 'bg-[#0B1120] text-white border-2 border-[#0B1120] hover:border-[#16A34A] hover:bg-[#121E36]'
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

                <span className="w-4 text-xs font-mono font-bold text-white/60 text-center ml-1">
                  {row}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t-2 border-[#0B1120] text-xs">
        <div className="flex flex-wrap gap-4 text-white/75 font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-[#0B1120] border-2 border-white rounded-sm"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-[#16A34A] border-2 border-white shadow-[1px_1px_0px_0px_#0B1120] rounded-sm"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-[#0B1120] border-2 border-[#0B1120]/45 opacity-30 rounded-sm"></div>
            <span>Sold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-[#121E36] border-2 border-[#0EA5E9] flex items-center justify-center text-[#0EA5E9] rounded-sm">
              <Accessibility size={9} />
            </div>
            <span>Wheelchair Area</span>
          </div>
        </div>

        {selectedSeat && selectedZone === activeZone && (
          <div className="bg-[#0B1120] border-4 border-[#0E7C3A] px-3 py-1.5 text-[#16A34A] font-black text-center flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0B1120] rounded-full uppercase text-[10px]">
            <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-ping"></div>
            Selected: {activeZone.replace('Zone_', 'Sec ')}, {selectedSeat}
          </div>
        )}
      </div>
    </div>
  );
};
