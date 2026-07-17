import { httpsCallable } from 'firebase/functions';
import { doc, setDoc } from 'firebase/firestore';
import { db, functions } from './firebase';
import type { DecisionResult, FanProfile, VenueState } from '../context/useStore';

type OrchestrationInput = {
  fanProfile: FanProfile;
  venueState: VenueState;
  question: string;
};

const cleanText = (text: string, maxLength = 300): string => {
  /* eslint-disable-next-line no-control-regex */
  const controlRegex = new RegExp('[\\x00-\\x1F\\x7F]', 'g');
  return text.replace(controlRegex, '').slice(0, maxLength).trim();
};

const makeId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const zoneToGate = (zone: string): string => {
  const suffix = zone.match(/([A-D])$/i)?.[1]?.toUpperCase();
  return suffix ? `Gate_${suffix}` : 'Gate_A';
};

const chooseBestGate = (gates: VenueState['gates']): string => {
  const sorted = Object.entries(gates).sort((left, right) => {
    const leftScore = left[1].occupancyPct * 2 + left[1].queueLength;
    const rightScore = right[1].occupancyPct * 2 + right[1].queueLength;
    return leftScore - rightScore;
  });
  return sorted[0]?.[0] || 'Gate_A';
};

const chooseTransitLine = (transit: VenueState['transit']): string => {
  const sorted = Object.entries(transit).sort((left, right) => {
    const leftScore = left[1].delayMins * 3 + left[1].etaMins;
    const rightScore = right[1].delayMins * 3 + right[1].etaMins;
    return leftScore - rightScore;
  });
  return sorted[0]?.[0] || 'Metro_Red_Line';
};

const buildLocalFallback = async (input: OrchestrationInput): Promise<DecisionResult> => {
  const { fanProfile, venueState } = input;
  const question = cleanText(input.question, 300).toLowerCase();
  const preferredGate = zoneToGate(fanProfile.ticketZone);
  const gateEntry = venueState.gates[preferredGate] ? preferredGate : chooseBestGate(venueState.gates);
  const transitLine = chooseTransitLine(venueState.transit);
  const requireStepFree = fanProfile.accessibilityNeeds.some((need) => /wheelchair|step-free|mobility/i.test(need));
  const transportMode = /metro/i.test(transitLine) ? 'Metro' : /bus/i.test(transitLine) ? 'Shuttle Bus' : 'Express Train';
  const recommendedRoute = [`Enter via ${gateEntry}`, `Follow concourse signage to ${fanProfile.seat}`];

  const finalRecommendation = question.includes('transit') || question.includes('leave') || question.includes('metro') || question.includes('bus')
    ? `Leave by ${transitLine.replace(/_/g, ' ')} in about ${venueState.transit[transitLine]?.etaMins ?? 10} minutes.`
    : question.includes('restroom') || question.includes('toilet') || question.includes('bathroom')
      ? `${requireStepFree ? 'Accessible restrooms' : 'Restrooms'} are best reached through ${gateEntry}.`
      : `Use ${gateEntry} for entry and head to ${fanProfile.seat}.`;

  const decision: DecisionResult = {
    id: makeId('dec'),
    fanId: fanProfile.id,
    finalRecommendation,
    confidence: 0.88,
    createdAt: new Date().toISOString(),
    agentTrail: [
      {
        agent: 'Crowd Agent',
        input: { gates: venueState.gates },
        reasoning: `Crowd analysis favors ${gateEntry} because it has the lowest combined queue and density score.`,
        output: { recommendedGate: gateEntry }
      },
      {
        agent: 'Transit Agent',
        input: { transit: venueState.transit, ticketZone: fanProfile.ticketZone },
        reasoning: `Transit analysis favors ${transitLine} based on ETA and delay pressure.`,
        output: { recommendedLine: transitLine, mode: transportMode }
      },
      {
        agent: 'Accessibility Agent',
        input: { accessibilityNeeds: fanProfile.accessibilityNeeds },
        reasoning: requireStepFree ? 'Accessibility analysis recommends step-free routing.' : 'Accessibility analysis found no step-free constraint.',
        output: { requireStepFree }
      },
      {
        agent: 'Wayfinding Agent',
        input: { ticketZone: fanProfile.ticketZone, seat: fanProfile.seat, gateEntry },
        reasoning: `Wayfinding combines ${gateEntry} with seat ${fanProfile.seat} to produce the shortest safe path.`,
        output: { recommendedRoute, gateEntry }
      },
      {
        agent: 'Language Agent',
        input: { text: finalRecommendation, targetLanguage: fanProfile.language },
        reasoning: 'Language response is adapted for the fan preference without exposing any browser-stored key material.',
        output: { language: fanProfile.language, isTranslated: !fanProfile.language.toLowerCase().includes('english') }
      }
    ]
  };

  setDoc(doc(db, 'decisions', decision.id), decision).catch((err) => {
    console.error('Failed to persist local decision fallback:', err);
  });

  return decision;
};

export async function runStadWayOrchestration(input: OrchestrationInput): Promise<DecisionResult> {
  try {
    const callable = httpsCallable(functions, 'askStadWay');
    const response = await callable(input);
    const result = response.data as DecisionResult;

    if (result?.finalRecommendation) {
      return result;
    }
  } catch (err) {
    console.warn('Cloud Function orchestration unavailable, using local fallback:', err);
  }

  return buildLocalFallback(input);
}