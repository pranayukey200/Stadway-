export interface AccessibilityAgentOutput {
  requireStepFree: boolean;
  requireSensoryFriendly: boolean;
  recommendedAmenities: string[];
  uiThemeModifiers: {
    highContrast: boolean;
    simplifiedLanguage: boolean;
    textScale: 'normal' | 'lg' | 'xl';
  };
  recommendation: string;
  reasoning: string;
}

export function runAccessibilityAgent(accessibilityNeeds: string[]): AccessibilityAgentOutput {
  const needs = accessibilityNeeds.map(n => n.toLowerCase());
  
  const requireStepFree = needs.some(n => n.includes('wheelchair') || n.includes('mobility') || n.includes('stroller') || n.includes('step-free'));
  const requireSensoryFriendly = needs.some(n => n.includes('sensory') || n.includes('autism') || n.includes('quiet'));
  const requireVisualSupport = needs.some(n => n.includes('visual') || n.includes('blind') || n.includes('contrast') || n.includes('large-text'));
  const requireSimplified = needs.some(n => n.includes('cognitive') || n.includes('simplified') || n.includes('learning'));

  const recommendedAmenities: string[] = [];
  const uiThemeModifiers = {
    highContrast: requireVisualSupport,
    simplifiedLanguage: requireSimplified,
    textScale: (requireVisualSupport ? 'lg' as const : 'normal' as const)
  };

  if (requireStepFree) {
    recommendedAmenities.push('Accessible Lift (L3)', 'Ramp Accessway West', 'Step-Free Row Seating');
  }
  if (requireSensoryFriendly) {
    recommendedAmenities.push('Sensory Room (Gate C, Level 2)', 'Complimentary Noise-Canceling Headphones at Helpdesk 2');
  }
  if (requireVisualSupport) {
    recommendedAmenities.push('Audio Descriptive Commentary Headset', 'Tactile Paving Paths');
  }

  let recommendation = 'Standard stadium facilities are suitable for your visit.';
  let reasoning = 'No specific accessibility accommodations were flagged in your profile.';

  if (requireStepFree || requireSensoryFriendly || requireVisualSupport || requireSimplified) {
    const list: string[] = [];
    if (requireStepFree) list.push('step-free pathing (lifts & ramps)');
    if (requireSensoryFriendly) list.push('quiet zones/sensory rooms');
    if (requireVisualSupport) list.push('high contrast visual guidance');
    if (requireSimplified) list.push('simplified visual steps');
    
    recommendation = `Use specialized facilities: ${recommendedAmenities.join(', ')}.`;
    reasoning = `Based on profile accessibility flags (${list.join(', ')}), we have filtered wayfinding routes to exclude stairs and enabled accessibility accommodations.`;
  }

  return {
    requireStepFree,
    requireSensoryFriendly,
    recommendedAmenities,
    uiThemeModifiers,
    recommendation,
    reasoning
  };
}
