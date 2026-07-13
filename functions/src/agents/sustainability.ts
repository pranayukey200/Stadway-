export interface SustainabilityAgentOutput {
  co2SavedKg: number;
  pointsEarned: number;
  recommendation: string;
  reasoning: string;
}

export function runSustainabilityAgent(chosenTransport: string): SustainabilityAgentOutput {
  const mode = chosenTransport.toLowerCase();
  
  // Baseline is private car/ride-share: ~0.25 kg CO2 per km.
  // Average trip length: 12 km.
  // Car = 3.0 kg CO2.
  // Metro = 0.4 kg CO2.
  // Shuttle Bus = 0.8 kg CO2.
  // Walking/Cycling = 0.0 kg CO2.
  
  let co2SavedKg = 0;
  let pointsEarned = 0;
  let recommendation = '';
  let reasoning = '';

  if (mode.includes('metro') || mode.includes('rail') || mode.includes('train')) {
    co2SavedKg = 2.6; // 3.0 - 0.4
    pointsEarned = 260;
    recommendation = 'Excellent choice! The metro is the most carbon-efficient transit option today.';
    reasoning = 'Saved 2.6kg of CO₂ emissions compared to taking an individual rideshare/taxi. You earned 260 sustainability points!';
  } else if (mode.includes('bus') || mode.includes('shuttle')) {
    co2SavedKg = 2.2; // 3.0 - 0.8
    pointsEarned = 220;
    recommendation = 'Great choice! Shuttles keep cars off the road and reduce gate drop-off congestion.';
    reasoning = 'Saved 2.2kg of CO₂ emissions compared to taking an individual rideshare/taxi. You earned 220 sustainability points!';
  } else if (mode.includes('walk') || mode.includes('bicycle') || mode.includes('cycle')) {
    co2SavedKg = 3.0; // 3.0 - 0.0
    pointsEarned = 300;
    recommendation = 'Amazing choice! Walking or cycling has zero carbon emissions.';
    reasoning = 'Saved 3.0kg of CO₂ emissions. Zero carbon footprint, plus promotes health. You earned 300 sustainability points!';
  } else {
    // Car or rideshare
    co2SavedKg = 0;
    pointsEarned = 10;
    recommendation = 'Consider public transit (Metro or Shuttle) for your next trip to reduce environmental impact.';
    reasoning = 'Rideshare matches baseline emission levels. Choosing public transit for your return journey can save up to 2.6kg of CO₂.';
  }

  return {
    co2SavedKg,
    pointsEarned,
    recommendation,
    reasoning
  };
}
