export interface TransitLineState {
  etaMins: number;
  delayMins: number;
}

export interface TransitAgentOutput {
  recommendedLine: string;
  delayAlerts: string[];
  leaveByMins: number;
  recommendation: string;
  reasoning: string;
}

export function runTransitAgent(
  transit: Record<string, TransitLineState>,
  ticketZone: string
): TransitAgentOutput {
  const delayAlerts: string[] = [];
  let bestLine = 'Metro_Red_Line';
  let bestEta = 999;
  
  // Identify lines with delays and find the best operating line
  Object.entries(transit).forEach(([lineId, state]) => {
    if (state.delayMins > 10) {
      delayAlerts.push(`${lineId.replace(/_/g, ' ')} has a significant delay of ${state.delayMins} minutes.`);
    }
    
    // Choose the line with the lowest ETA that has minor delays (< 10m)
    if (state.delayMins < 10 && state.etaMins < bestEta) {
      bestEta = state.etaMins;
      bestLine = lineId;
    }
  });

  // Calculate recommended leave time (standard buffer is 15 minutes, plus eta, plus extra if there are delays)
  // If best line is not found, fallback to first line
  const selectedLineState = transit[bestLine] || { etaMins: 15, delayMins: 0 };
  const leaveByMins = Math.max(5, selectedLineState.etaMins - 2); // Leave 2 minutes before the transit vehicle arrives

  let recommendation = `We recommend taking the ${bestLine.replace(/_/g, ' ')}. It arrives in ${selectedLineState.etaMins} minutes.`;
  let reasoning = `The ${bestLine.replace(/_/g, ' ')} is currently operating smoothly with only a ${selectedLineState.delayMins}m delay.`;

  if (delayAlerts.length > 0) {
    reasoning += ` Other transit modes are experiencing major delays: ${delayAlerts.join(' ')}`;
    // If the preferred transit for ticketZone is delayed, reroute
    if (ticketZone.startsWith('Zone_B') && transit['Metro_Red_Line']?.delayMins > 10) {
      bestLine = 'Express_Train_A';
      recommendation = `Metro is delayed. We recommend taking the Express Train A instead, which arrives in ${transit['Express_Train_A']?.etaMins || 10} minutes.`;
      reasoning = `Metro Red Line is experiencing a ${transit['Metro_Red_Line']?.delayMins}m delay. Rerouting to Express Train A for Zone B tickets.`;
    }
  }

  return {
    recommendedLine: bestLine,
    delayAlerts,
    leaveByMins,
    recommendation,
    reasoning
  };
}
