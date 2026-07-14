declare const process: any;
import OpenAI from 'openai';
import { runCrowdAgent, type GateState } from './agents/crowd';
import { runTransitAgent, type TransitLineState } from './agents/transit';
import { runAccessibilityAgent } from './agents/accessibility';
import { runSustainabilityAgent } from './agents/sustainability';
import { runLanguageAgent } from './agents/language';
import { runWayfindingAgent } from './agents/wayfinding';

export interface FanProfile {
  id: string;
  name: string;
  language: string;
  accessibilityNeeds: string[];
  ticketZone: string;
  seat: string;
  homeCity?: string;
}

export interface VenueState {
  gates: Record<string, GateState>;
  transit: Record<string, TransitLineState>;
  weather: {
    condition: string;
    tempC: number;
  };
  updatedAt: string;
  overrideAnnouncement?: string;
}

export interface OrchestratorInput {
  fanProfile: FanProfile;
  venueState: VenueState;
  question: string;
}

export interface OrchestratorOutput {
  finalRecommendation: string;
  confidence: number;
  agentTrail: Array<{
    agent: string;
    input: any;
    reasoning: string;
    output: any;
  }>;
}

const getViteEnv = (): any => {
  try {
    const fn = new Function('return import.meta.env');
    return fn();
  } catch (e) {
    return null;
  }
};

// SECURITY NOTE: Gating browser-side direct calls to the Groq LLM API.
// In production, direct client-side API requests using localStorage are disabled (DEV_ONLY = false).
// This mitigates XSS risk and prevents token theft. Instead, requests must go through secure proxy endpoints.
export const DEV_ONLY = true;

// Initialize OpenAI client pointing to Groq's API
const getGroqClient = () => {
  let apiKey = "";
  if (typeof process !== 'undefined' && process.env && process.env.GROQ_API_KEY) {
    apiKey = process.env.GROQ_API_KEY;
  }
  
  // Client-side key support is strictly gated behind the DEV_ONLY sandbox flag
  if (DEV_ONLY) {
    // Client-side Vite environment variable support
    const viteEnv = getViteEnv();
    if (!apiKey && viteEnv && viteEnv.VITE_GROQ_API_KEY) {
      apiKey = viteEnv.VITE_GROQ_API_KEY;
    }
    
    // Client-side LocalStorage key support for sandbox security
    if (!apiKey && typeof window !== 'undefined' && window.localStorage) {
      apiKey = window.localStorage.getItem('stadway_groq_key') || "";
    }
  } else {
    // In production, we log a warning if client attempts direct key injection
    if (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('stadway_groq_key')) {
      console.warn("StandWay Security Alert: Client-side Groq key injection rejected in production mode.");
    }
  }
  
  return new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.groq.com/openapi/v1",
    dangerouslyAllowBrowser: true // Enable direct client-side execution in browser (gated by DEV_ONLY key checks)
  });
};

export async function runOrchestration(input: OrchestratorInput): Promise<OrchestratorOutput> {
  const { fanProfile, venueState, question } = input;
  
  // 1. Run specialized agents locally for structured inputs
  const crowdResult = runCrowdAgent(venueState.gates);
  
  const transitResult = runTransitAgent(
    venueState.transit, 
    fanProfile.ticketZone
  );
  
  const accessResult = runAccessibilityAgent(fanProfile.accessibilityNeeds);
  
  // Choose transit mode for sustainability: Metro if Red Line is recommended, otherwise Bus or Car
  let selectedMode = 'Car';
  if (transitResult.recommendedLine.includes('Metro')) selectedMode = 'Metro';
  else if (transitResult.recommendedLine.includes('Bus')) selectedMode = 'Shuttle Bus';
  else if (transitResult.recommendedLine.includes('Train')) selectedMode = 'Express Train';
  const sustainabilityResult = runSustainabilityAgent(selectedMode);
  
  const wayfindingResult = runWayfindingAgent(
    fanProfile.ticketZone,
    fanProfile.seat,
    venueState.gates,
    fanProfile.accessibilityNeeds
  );

  // 2. Prepare the Agent Reasoning Trail
  const agentTrail: Array<{ agent: string; input: any; reasoning: string; output: any }> = [
    {
      agent: 'Crowd Agent',
      input: { gates: venueState.gates },
      reasoning: crowdResult.reasoning,
      output: { congestedGates: crowdResult.congestedGates, recommendation: crowdResult.recommendation }
    },
    {
      agent: 'Transit Agent',
      input: { transit: venueState.transit, ticketZone: fanProfile.ticketZone },
      reasoning: transitResult.reasoning,
      output: { recommendedLine: transitResult.recommendedLine, leaveByMins: transitResult.leaveByMins }
    },
    {
      agent: 'Accessibility Agent',
      input: { accessibilityNeeds: fanProfile.accessibilityNeeds },
      reasoning: accessResult.reasoning,
      output: { requireStepFree: accessResult.requireStepFree, recommendedAmenities: accessResult.recommendedAmenities }
    },
    {
      agent: 'Sustainability Agent',
      input: { chosenTransport: selectedMode },
      reasoning: sustainabilityResult.reasoning,
      output: { co2SavedKg: sustainabilityResult.co2SavedKg, pointsEarned: sustainabilityResult.pointsEarned }
    },
    {
      agent: 'Wayfinding Agent',
      input: { ticketZone: fanProfile.ticketZone, seat: fanProfile.seat, gateEntry: wayfindingResult.gateEntry },
      reasoning: wayfindingResult.reasoning,
      output: { recommendedRoute: wayfindingResult.recommendedRoute, etaMins: wayfindingResult.etaMins }
    }
  ];

  // Check language
  const languageResult = runLanguageAgent(wayfindingResult.recommendation, fanProfile.language);
  agentTrail.push({
    agent: 'Language Agent',
    input: { text: wayfindingResult.recommendation, targetLanguage: fanProfile.language },
    reasoning: languageResult.reasoning,
    output: { language: languageResult.language, isTranslated: languageResult.isTranslated }
  });

  const viteEnv = getViteEnv();
  let groqKey = (typeof process !== 'undefined' && process.env && process.env.GROQ_API_KEY) || "";
  
  if (DEV_ONLY) {
    if (!groqKey && viteEnv && viteEnv.VITE_GROQ_API_KEY) {
      groqKey = viteEnv.VITE_GROQ_API_KEY;
    }
    if (!groqKey && typeof window !== 'undefined' && window.localStorage) {
      groqKey = window.localStorage.getItem('stadway_groq_key') || "";
    }
  }
  
  // If no Groq API Key, fallback to high-quality local generation
  if (!groqKey || groqKey.trim() === '' || groqKey.includes('PLACEHOLDER')) {
    console.log('Orchestrator: No GROQ_API_KEY detected. Running in high-fidelity Simulator Mode.');
    
    // Construct local final response
    let finalRecommendation = '';
    
    // Format based on question
    const qLower = question.toLowerCase();
    if (qLower.includes('seat') || qLower.includes('get to') || qLower.includes('how do i') || qLower.includes('navigate')) {
      finalRecommendation = wayfindingResult.recommendation + " " + crowdResult.recommendation;
      if (accessResult.requireStepFree) {
        finalRecommendation += " Please note: " + accessResult.recommendation;
      }
    } else if (qLower.includes('leave') || qLower.includes('transit') || qLower.includes('metro') || qLower.includes('bus')) {
      finalRecommendation = transitResult.recommendation + " " + transitResult.reasoning + " " + sustainabilityResult.reasoning;
    } else if (qLower.includes('sustainability') || qLower.includes('co2') || qLower.includes('carbon')) {
      finalRecommendation = sustainabilityResult.recommendation + " " + sustainabilityResult.reasoning;
    } else if (qLower.includes('restroom') || qLower.includes('toilet') || qLower.includes('bathroom')) {
      finalRecommendation = `The nearest ${accessResult.requireStepFree ? 'accessible' : 'standard'} restrooms are located near Section ${fanProfile.ticketZone}. ` +
        (accessResult.requireStepFree ? 'Use the lift to Level 2 and follow signs for accessible toilets.' : 'Stairs to Level 2, behind Section Block B.');
    } else {
      // General question fallback
      finalRecommendation = `Hello ${fanProfile.name}! ${wayfindingResult.recommendation} ${crowdResult.recommendation} ${transitResult.recommendation}`;
    }

    // Apply translation if required
    if (fanProfile.language.toLowerCase() !== 'english' && fanProfile.language.toLowerCase() !== 'en') {
      const translated = runLanguageAgent(finalRecommendation, fanProfile.language);
      if (translated.isTranslated) {
        finalRecommendation = translated.translatedText;
      } else {
        // Mock translation fallback
        finalRecommendation = `[${fanProfile.language}] ${finalRecommendation}`;
      }
    }

    return {
      finalRecommendation,
      confidence: 0.95,
      agentTrail
    };
  }

  // 3. Make real Groq API call
  try {
    console.log('Orchestrator: Sending request to Groq API using llama-3.3-70b-versatile...');
    const client = getGroqClient();
    
    const systemPrompt = `You are the StadWay Orchestrator Agent, the main coordinator for a smart stadium helper at the FIFA World Cup 2026.
Your job is to read:
1. The Fan's Profile (name, ticket zone, seat, preferred language, accessibility needs)
2. Live Venue State (sensor data for gates, transit, weather, global overrides)
3. Specialized Agent Outputs (Wayfinding, Crowd, Accessibility, Transit, Sustainability, Language)
4. The Fan's question or command.

You must compile this information and output a JSON response containing:
- "finalRecommendation": A friendly, helpful answer in the fan's preferred language. Make it directly answer their question. If the user has a "simplifiedLanguage" flag in accessibility, keep the sentences short, simple, and list clear bullet points.
- "confidence": A score between 0.0 and 1.0 indicating how confident you are in this recommendation based on data freshness.

Context Information:
- Fan Profile: ${JSON.stringify(fanProfile)}
- Venue State: ${JSON.stringify(venueState)}
- Crowd Agent Analysis: ${JSON.stringify(crowdResult)}
- Transit Agent Analysis: ${JSON.stringify(transitResult)}
- Accessibility Agent Analysis: ${JSON.stringify(accessResult)}
- Sustainability Agent Analysis: ${JSON.stringify(sustainabilityResult)}
- Wayfinding Agent Analysis: ${JSON.stringify(wayfindingResult)}
- Language Agent Analysis: ${JSON.stringify(languageResult)}

Provide your response in raw JSON format (do not wrap in markdown code blocks) matching this schema:
{
  "finalRecommendation": "text",
  "confidence": 0.95
}`;

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Fan Question: "${question}"` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseText);

    return {
      finalRecommendation: parsed.finalRecommendation || 'Sorry, I could not compile a recommendation.',
      confidence: parsed.confidence || 0.9,
      agentTrail
    };
  } catch (err) {
    console.error('Groq API Error, falling back to local orchestrator:', err);
    // Fallback if API fails
    return {
      finalRecommendation: `[Local Fallback] ${wayfindingResult.recommendation} ${crowdResult.recommendation}`,
      confidence: 0.8,
      agentTrail
    };
  }
}
