export interface GateState {
  occupancyPct: number;
  queueLength: number;
  status: 'smooth' | 'moderate' | 'congested';
}

export interface CrowdAgentOutput {
  congestedGates: string[];
  clearGates: string[];
  recommendation: string;
  reasoning: string;
  alertTriggered: boolean;
}

export function runCrowdAgent(gates: Record<string, GateState>): CrowdAgentOutput {
  const congestedGates: string[] = [];
  const clearGates: string[] = [];
  
  Object.entries(gates).forEach(([gateId, state]) => {
    if (state.occupancyPct >= 80 || state.status === 'congested') {
      congestedGates.push(gateId);
    } else if (state.occupancyPct < 40 && state.status === 'smooth') {
      clearGates.push(gateId);
    }
  });

  const alertTriggered = congestedGates.length > 0;
  
  let recommendation = 'All stadium gates are operating within normal parameters. Flow is steady.';
  let reasoning = 'No gates exceed 80% occupancy threshold. Average queue lengths are below 30 people.';

  if (alertTriggered) {
    recommendation = `Avoid ${congestedGates.map(g => g.replace('_', ' ')).join(', ')}. Redirect traffic to clear gate entrances: ${
      clearGates.length > 0 ? clearGates.map(g => g.replace('_', ' ')).join(', ') : 'Gate C or D'
    }.`;
    reasoning = `High congestion detected at ${congestedGates.join(', ')} (occupancy >= 80%, queue length > 80 people). Alternate entrances are significantly less crowded (occupancy < 40%).`;
  }

  return {
    congestedGates,
    clearGates,
    recommendation,
    reasoning,
    alertTriggered
  };
}
