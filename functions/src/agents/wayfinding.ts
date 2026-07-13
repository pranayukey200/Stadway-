export interface WayfindingAgentOutput {
  recommendedRoute: string[];
  gateEntry: string;
  etaMins: number;
  recommendation: string;
  reasoning: string;
}

export function runWayfindingAgent(
  ticketZone: string,
  seat: string,
  gates: Record<string, { occupancyPct: number; queueLength: number; status: string }>,
  accessibilityNeeds: string[]
): WayfindingAgentOutput {
  // Logic: 
  // Map zones to preferred gates.
  // Zone A -> Gate A
  // Zone B -> Gate B
  // Zone C -> Gate C
  // Zone D -> Gate D
  // If the preferred gate is congested (>80% occupancy), route to the next best gate.
  // If accessibilityNeeds includes wheelchair/mobility, route via step-free checkpoints (e.g. Ramp Access, Lifts).

  const zone = ticketZone.toUpperCase();
  let preferredGate = 'Gate_A';
  if (zone.includes('B') || zone.includes('2')) preferredGate = 'Gate_B';
  else if (zone.includes('C') || zone.includes('3')) preferredGate = 'Gate_C';
  else if (zone.includes('D') || zone.includes('4')) preferredGate = 'Gate_D';

  let gateEntry = preferredGate;
  let rerouted = false;
  let reroutedReason = '';

  const gateState = gates[preferredGate];
  if (gateState && (gateState.occupancyPct >= 80 || gateState.status === 'congested')) {
    // Reroute to a neighboring gate with lower occupancy
    const gateOrder = ['Gate_A', 'Gate_B', 'Gate_C', 'Gate_D'];
    // Find gate with lowest occupancy
    let minOcc = 999;
    let bestAltGate = preferredGate;
    
    gateOrder.forEach(g => {
      const state = gates[g];
      if (state && state.occupancyPct < minOcc) {
        minOcc = state.occupancyPct;
        bestAltGate = g;
      }
    });

    if (bestAltGate !== preferredGate) {
      gateEntry = bestAltGate;
      rerouted = true;
      reroutedReason = `preferred ${preferredGate.replace('_', ' ')} is congested (${gateState.occupancyPct}% occupancy). Rerouted to ${bestAltGate.replace('_', ' ')} which is clear (${minOcc}% occupancy).`;
    }
  }

  // Define route steps
  const isStepFree = accessibilityNeeds.some(n => 
    n.toLowerCase().includes('wheelchair') || 
    n.toLowerCase().includes('mobility') || 
    n.toLowerCase().includes('step-free')
  );

  const routeSteps: string[] = [];
  routeSteps.push(`Arrive at ${gateEntry.replace('_', ' ')}`);
  
  if (isStepFree) {
    routeSteps.push('Proceed to Step-Free Checkpoint 3');
    routeSteps.push('Take Accessible Lift L3 to Concourse Level 2');
  } else {
    routeSteps.push('Proceed through main ticket turnstile');
    routeSteps.push('Take Stairs/Escalator A to Concourse Level 2');
  }

  routeSteps.push(`Locate Section ${zone}`);
  routeSteps.push(`Find Seat ${seat}`);

  const etaMins = 12 + (isStepFree ? 5 : 0) + (rerouted ? 6 : 0);

  const recommendation = `Enter via ${gateEntry.replace('_', ' ')} and follow the ${isStepFree ? 'accessible step-free' : 'standard'} path to Section ${zone}, Seat ${seat}.`;
  const reasoning = rerouted 
    ? `Rerouted entrance: ${reroutedReason} Total ETA is ${etaMins} mins.`
    : `Optimal route selected. Using ${preferredGate.replace('_', ' ')} which is near Section ${zone}. Total ETA is ${etaMins} mins.`;

  return {
    recommendedRoute: routeSteps,
    gateEntry,
    etaMins,
    recommendation,
    reasoning
  };
}
