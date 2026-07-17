import { describe, it, expect, vi } from 'vitest';

// Mock the openai module before importing orchestrator so the import doesn't fail
vi.mock('openai', () => {
  const OpenAI = vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"finalRecommendation":"Mock LLM response","confidence":0.9}' } }]
        })
      }
    }
  }));
  return { default: OpenAI };
});

import { runCrowdAgent } from '../../functions/src/agents/crowd';
import { runTransitAgent } from '../../functions/src/agents/transit';
import { runAccessibilityAgent } from '../../functions/src/agents/accessibility';
import { runSustainabilityAgent } from '../../functions/src/agents/sustainability';
import { runWayfindingAgent } from '../../functions/src/agents/wayfinding';
import { runLanguageAgent } from '../../functions/src/agents/language';
import { runOrchestration } from '../../functions/src/orchestrator';

// Shared mock data
const mockFan = {
  id: 'test_fan_1',
  name: 'Test User',
  language: 'English',
  accessibilityNeeds: [],
  ticketZone: 'Zone_A',
  seat: 'Row 5, Seat 12',
  homeCity: 'London'
};

const mockVenue = {
  gates: {
    Gate_A: { occupancyPct: 25, queueLength: 8, status: 'smooth' as const },
    Gate_B: { occupancyPct: 85, queueLength: 95, status: 'congested' as const },
    Gate_C: { occupancyPct: 15, queueLength: 5, status: 'smooth' as const },
    Gate_D: { occupancyPct: 40, queueLength: 18, status: 'moderate' as const }
  },
  transit: {
    Metro_Red_Line: { etaMins: 5, delayMins: 0 },
    Shuttle_Bus_101: { etaMins: 10, delayMins: 2 },
    Express_Train_A: { etaMins: 7, delayMins: 0 }
  },
  weather: { condition: 'Clear', tempC: 22 },
  updatedAt: new Date().toISOString()
};

describe('StandWay Integration Tests — Full Orchestration Pipeline', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Full pipeline structure tests
  // ──────────────────────────────────────────────────────────────────────────

  it('1. agentTrail should have exactly 6 entries (one per agent)', async () => {
    const result = await runOrchestration({
      fanProfile: mockFan,
      venueState: mockVenue,
      question: 'How do I get to my seat?'
    });
    expect(result.agentTrail).toHaveLength(6);
  });

  it('2. finalRecommendation should be a non-empty string', async () => {
    const result = await runOrchestration({
      fanProfile: mockFan,
      venueState: mockVenue,
      question: 'How do I navigate to my seat?'
    });
    expect(result.finalRecommendation).toBeTruthy();
    expect(typeof result.finalRecommendation).toBe('string');
    expect(result.finalRecommendation.length).toBeGreaterThan(0);
  });

  it('3. confidence should be a number between 0 and 1 (inclusive)', async () => {
    const result = await runOrchestration({
      fanProfile: mockFan,
      venueState: mockVenue,
      question: 'What is the best route to my seat?'
    });
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('4. agentTrail should contain all 6 expected agents by name', async () => {
    const result = await runOrchestration({
      fanProfile: mockFan,
      venueState: mockVenue,
      question: 'Get me to my seat'
    });
    const agentNames = result.agentTrail.map(a => a.agent);
    expect(agentNames).toContain('Crowd Agent');
    expect(agentNames).toContain('Transit Agent');
    expect(agentNames).toContain('Accessibility Agent');
    expect(agentNames).toContain('Sustainability Agent');
    expect(agentNames).toContain('Wayfinding Agent');
    expect(agentNames).toContain('Language Agent');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Wheelchair routing — accessibility integration
  // ──────────────────────────────────────────────────────────────────────────

  it('5. wheelchair user: agentTrail recommendation includes step-free route', async () => {
    const wheelchairFan = {
      ...mockFan,
      accessibilityNeeds: ['Wheelchair User']
    };
    const result = await runOrchestration({
      fanProfile: wheelchairFan,
      venueState: mockVenue,
      question: 'How do I get to my seat?'
    });
    // The wayfinding and accessibility agents should reflect step-free routing
    const accessEntry = result.agentTrail.find(a => a.agent === 'Accessibility Agent');
    expect(accessEntry).toBeDefined();
    expect((accessEntry!.output as any).requireStepFree).toBe(true);
  });

  it('6. wheelchair user: wayfinding route includes accessible lift step', async () => {
    const gates = {
      Gate_A: { occupancyPct: 25, queueLength: 8, status: 'smooth' as const }
    };
    const result = runWayfindingAgent('Zone_A', 'Row 5, Seat 12', gates, ['Wheelchair User']);
    expect(result.recommendedRoute).toContain('Take Accessible Lift L3 to Concourse Level 2');
    expect(result.etaMins).toBeGreaterThan(12); // extra 5 mins for accessibility
  });

  it('7. accessibility agent correctly flags wheelchair as step-free requirement', () => {
    const result = runAccessibilityAgent(['Wheelchair User', 'Sensory Friendly']);
    expect(result.requireStepFree).toBe(true);
    expect(result.requireSensoryFriendly).toBe(true);
    expect(result.recommendedAmenities).toContain('Accessible Lift (L3)');
    expect(result.recommendedAmenities).toContain('Sensory Room (Gate C, Level 2)');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Non-English language routing
  // ──────────────────────────────────────────────────────────────────────────

  it('8. non-English fan (Spanish): finalRecommendation should be non-empty', async () => {
    const spanishFan = { ...mockFan, language: 'Spanish' };
    const result = await runOrchestration({
      fanProfile: spanishFan,
      venueState: mockVenue,
      question: '¿Cómo llego a mi asiento?'
    });
    expect(result.finalRecommendation).toBeTruthy();
    expect(result.finalRecommendation.length).toBeGreaterThan(0);
  });

  it('9. language agent: Spanish translation works for known phrases', () => {
    const result = runLanguageAgent('Welcome to StandWay', 'Spanish');
    expect(result.isTranslated).toBe(true);
    expect(result.translatedText).toBe('Bienvenido a StandWay');
    expect(result.language).toBe('Spanish');
  });

  it('10. language agent: French translation works for known phrases', () => {
    const result = runLanguageAgent('Go to Gate C', 'French');
    expect(result.isTranslated).toBe(true);
    expect(result.translatedText).toBe('Allez à la porte C');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Gate surge — crowd management
  // ──────────────────────────────────────────────────────────────────────────

  it('11. gate surge: crowd agent triggers alert and identifies congested gate', async () => {
    const surgeVenue = {
      ...mockVenue,
      gates: {
        Gate_A: { occupancyPct: 92, queueLength: 150, status: 'congested' as const },
        Gate_B: { occupancyPct: 20, queueLength: 6, status: 'smooth' as const }
      }
    };
    const result = await runOrchestration({
      fanProfile: mockFan,
      venueState: surgeVenue,
      question: 'Which gate should I use?'
    });
    const crowdEntry = result.agentTrail.find(a => a.agent === 'Crowd Agent');
    expect((crowdEntry!.output as any).congestedGates).toContain('Gate_A');
  });

  it('12. crowd agent: recommendation mentions redirecting away from congested gate', () => {
    const gates = {
      Gate_A: { occupancyPct: 90, queueLength: 130, status: 'congested' as const },
      Gate_B: { occupancyPct: 18, queueLength: 4, status: 'smooth' as const }
    };
    const result = runCrowdAgent(gates);
    expect(result.alertTriggered).toBe(true);
    expect(result.recommendation).toContain('Gate B');
    expect(result.clearGates).toContain('Gate_B');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Transit delay scenarios
  // ──────────────────────────────────────────────────────────────────────────

  it('13. transit delay: agent picks alternative when Metro has major delay', () => {
    const delayedTransit = {
      Metro_Red_Line: { etaMins: 5, delayMins: 20 },  // Significant delay
      Express_Train_A: { etaMins: 7, delayMins: 0 }
    };
    const result = runTransitAgent(delayedTransit, 'Zone_A');
    expect(result.recommendedLine).toBe('Express_Train_A');
    expect(result.delayAlerts.length).toBeGreaterThan(0);
  });

  it('14. transit delay: orchestration finalRecommendation is non-empty even with delays', async () => {
    const delayedVenue = {
      ...mockVenue,
      transit: {
        Metro_Red_Line: { etaMins: 5, delayMins: 15 },
        Shuttle_Bus_101: { etaMins: 10, delayMins: 20 },
        Express_Train_A: { etaMins: 7, delayMins: 0 }
      }
    };
    const result = await runOrchestration({
      fanProfile: mockFan,
      venueState: delayedVenue,
      question: 'When should I leave for the metro?'
    });
    expect(result.finalRecommendation.length).toBeGreaterThan(0);
    const transitEntry = result.agentTrail.find(a => a.agent === 'Transit Agent');
    expect((transitEntry!.output as any).recommendedLine).toBeDefined();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Sustainability mode selection
  // ──────────────────────────────────────────────────────────────────────────

  it('15. sustainability: Metro transit earns 260 points and saves 2.6kg CO2', () => {
    const result = runSustainabilityAgent('Metro');
    expect(result.co2SavedKg).toBe(2.6);
    expect(result.pointsEarned).toBe(260);
    expect(result.recommendation).toContain('carbon-efficient');
  });

  it('16. sustainability: Shuttle Bus earns 220 points and saves 2.2kg CO2', () => {
    const result = runSustainabilityAgent('Shuttle Bus');
    expect(result.co2SavedKg).toBe(2.2);
    expect(result.pointsEarned).toBe(220);
  });

  it('17. sustainability: Walking/Cycling earns max 300 points', () => {
    const result = runSustainabilityAgent('bicycle');
    expect(result.co2SavedKg).toBe(3.0);
    expect(result.pointsEarned).toBe(300);
  });

  it('18. sustainability: orchestration sets correct mode from transit recommendation', async () => {
    const result = await runOrchestration({
      fanProfile: mockFan,
      venueState: mockVenue,
      question: 'How sustainable is my trip?'
    });
    const sustainEntry = result.agentTrail.find(a => a.agent === 'Sustainability Agent');
    expect(sustainEntry).toBeDefined();
    expect((sustainEntry!.output as any).co2SavedKg).toBeGreaterThanOrEqual(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Question type: seat navigation
  // ──────────────────────────────────────────────────────────────────────────

  it('19. seat navigation question: response includes wayfinding information', async () => {
    const result = await runOrchestration({
      fanProfile: mockFan,
      venueState: mockVenue,
      question: 'How do I get to my seat Row 5, Seat 12?'
    });
    expect(result.finalRecommendation).toBeTruthy();
    expect(result.agentTrail.find(a => a.agent === 'Wayfinding Agent')).toBeDefined();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Question type: transit
  // ──────────────────────────────────────────────────────────────────────────

  it('20. transit question: response covers transit recommendation', async () => {
    const result = await runOrchestration({
      fanProfile: mockFan,
      venueState: mockVenue,
      question: 'Which metro line should I take to the stadium?'
    });
    expect(result.finalRecommendation).toBeTruthy();
    expect(result.finalRecommendation.length).toBeGreaterThan(5);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Question type: sustainability
  // ──────────────────────────────────────────────────────────────────────────

  it('21. sustainability question: response covers CO2 and sustainability info', async () => {
    const result = await runOrchestration({
      fanProfile: mockFan,
      venueState: mockVenue,
      question: 'How can I reduce my carbon footprint today?'
    });
    expect(result.finalRecommendation).toBeTruthy();
    // Should include sustainability-related content
    const sustainEntry = result.agentTrail.find(a => a.agent === 'Sustainability Agent');
    expect((sustainEntry!.output as any).pointsEarned).toBeGreaterThan(0);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Question type: restroom
  // ──────────────────────────────────────────────────────────────────────────

  it('22. restroom question: response provides restroom directions', async () => {
    const result = await runOrchestration({
      fanProfile: mockFan,
      venueState: mockVenue,
      question: 'Where is the nearest restroom?'
    });
    expect(result.finalRecommendation).toBeTruthy();
    expect(result.finalRecommendation.toLowerCase()).toMatch(/restroom|toilet|accessible/i);
  });

  it('23. restroom question for wheelchair user: mentions accessible toilet', async () => {
    const wheelchairFan = { ...mockFan, accessibilityNeeds: ['Wheelchair User'] };
    const result = await runOrchestration({
      fanProfile: wheelchairFan,
      venueState: mockVenue,
      question: 'Where is the nearest toilet?'
    });
    expect(result.finalRecommendation).toBeTruthy();
    expect(result.finalRecommendation.toLowerCase()).toMatch(/accessible|lift|step-free/i);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Wayfinding reroute on congested preferred gate
  // ──────────────────────────────────────────────────────────────────────────

  it('24. wayfinding: reroutes from congested Zone_B gate to lowest occupancy alternative', () => {
    const gates = {
      Gate_A: { occupancyPct: 20, queueLength: 5, status: 'smooth' as const },
      Gate_B: { occupancyPct: 88, queueLength: 110, status: 'congested' as const },
      Gate_C: { occupancyPct: 10, queueLength: 2, status: 'smooth' as const },
      Gate_D: { occupancyPct: 45, queueLength: 20, status: 'moderate' as const }
    };
    const result = runWayfindingAgent('Zone_B', 'Row 10, Seat 3', gates, []);
    // Preferred gate Gate_B is congested — should reroute to Gate_C (lowest occupancy)
    expect(result.gateEntry).not.toBe('Gate_B');
    expect(result.etaMins).toBeGreaterThan(12); // rerouted adds time
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 12. agentTrail item structure validation
  // ──────────────────────────────────────────────────────────────────────────

  it('25. every agentTrail entry has required fields: agent, input, reasoning, output', async () => {
    const result = await runOrchestration({
      fanProfile: mockFan,
      venueState: mockVenue,
      question: 'General question about the stadium'
    });
    result.agentTrail.forEach(entry => {
      expect(entry).toHaveProperty('agent');
      expect(entry).toHaveProperty('input');
      expect(entry).toHaveProperty('reasoning');
      expect(entry).toHaveProperty('output');
      expect(typeof entry.agent).toBe('string');
      expect(typeof entry.reasoning).toBe('string');
    });
  });
});
