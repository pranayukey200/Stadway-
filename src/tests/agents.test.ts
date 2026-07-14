import { describe, it, expect } from 'vitest';
import { runCrowdAgent } from '../../functions/src/agents/crowd';
import { runTransitAgent } from '../../functions/src/agents/transit';
import { runAccessibilityAgent } from '../../functions/src/agents/accessibility';
import { runSustainabilityAgent } from '../../functions/src/agents/sustainability';
import { runWayfindingAgent } from '../../functions/src/agents/wayfinding';
import { runLanguageAgent } from '../../functions/src/agents/language';

describe('StandWay Agent Logic Tests', () => {
  
  describe('Crowd Agent', () => {
    it('should flag congestion if occupancy >= 80%', () => {
      const gates = {
        Gate_A: { occupancyPct: 30, queueLength: 10, status: 'smooth' as const },
        Gate_B: { occupancyPct: 85, queueLength: 120, status: 'congested' as const },
        Gate_C: { occupancyPct: 15, queueLength: 4, status: 'smooth' as const }
      };
      
      const result = runCrowdAgent(gates);
      expect(result.alertTriggered).toBe(true);
      expect(result.congestedGates).toContain('Gate_B');
      expect(result.clearGates).toContain('Gate_C');
    });

    it('should stay clear if all gates are under 80%', () => {
      const gates = {
        Gate_A: { occupancyPct: 30, queueLength: 10, status: 'smooth' as const },
        Gate_B: { occupancyPct: 50, queueLength: 30, status: 'moderate' as const }
      };
      
      const result = runCrowdAgent(gates);
      expect(result.alertTriggered).toBe(false);
      expect(result.congestedGates.length).toBe(0);
    });
  });

  describe('Transit Agent', () => {
    it('should recommend transit line with lowest ETA and no major delays', () => {
      const transit = {
        Metro_Red_Line: { etaMins: 5, delayMins: 0 },
        Shuttle_Bus_101: { etaMins: 12, delayMins: 20 }, // High delay
        Express_Train_A: { etaMins: 8, delayMins: 1 }
      };
      
      const result = runTransitAgent(transit, 'Zone_A');
      expect(result.recommendedLine).toBe('Metro_Red_Line');
      expect(result.delayAlerts.length).toBe(1);
    });

    it('should reroute Zone B ticket holders if Metro is delayed', () => {
      const transit = {
        Metro_Red_Line: { etaMins: 5, delayMins: 25 }, // High delay on Metro
        Express_Train_A: { etaMins: 8, delayMins: 0 }
      };
      
      const result = runTransitAgent(transit, 'Zone_B_1');
      expect(result.recommendedLine).toBe('Express_Train_A');
    });
  });

  describe('Accessibility Agent', () => {
    it('should filter step-free path and accessible amenities for wheelchair users', () => {
      const needs = ['Wheelchair User', 'Simplified Language'];
      const result = runAccessibilityAgent(needs);
      
      expect(result.requireStepFree).toBe(true);
      expect(result.recommendedAmenities).toContain('Accessible Lift (L3)');
      expect(result.uiThemeModifiers.simplifiedLanguage).toBe(true);
    });
  });

  describe('Sustainability Agent', () => {
    it('should calculate carbon savings for Metro compared to rideshare', () => {
      const result = runSustainabilityAgent('Metro');
      expect(result.co2SavedKg).toBe(2.6);
      expect(result.pointsEarned).toBe(260);
    });

    it('should not earn carbon savings points for taking a car', () => {
      const result = runSustainabilityAgent('Car');
      expect(result.co2SavedKg).toBe(0);
      expect(result.pointsEarned).toBe(10);
    });
  });

  describe('Wayfinding Agent', () => {
    it('should recommend default gate if not congested', () => {
      const gates = {
        Gate_A: { occupancyPct: 30, queueLength: 10, status: 'smooth' as const },
        Gate_B: { occupancyPct: 40, queueLength: 15, status: 'smooth' as const }
      };
      
      const result = runWayfindingAgent('Zone_A', 'Row 12, Seat 4', gates, []);
      expect(result.gateEntry).toBe('Gate_A');
      expect(result.recommendedRoute).toContain('Proceed through main ticket turnstile');
    });

    it('should reroute entry gate if preferred gate is congested', () => {
      const gates = {
        Gate_A: { occupancyPct: 90, queueLength: 100, status: 'congested' as const }, // Congested
        Gate_B: { occupancyPct: 30, queueLength: 12, status: 'smooth' as const }
      };
      
      const result = runWayfindingAgent('Zone_A', 'Row 12, Seat 4', gates, []);
      expect(result.gateEntry).toBe('Gate_B'); // Rerouted
    });
  });

  describe('Language Agent', () => {
    it('should translate known text if language matches', () => {
      const result = runLanguageAgent('Welcome to StandWay', 'Spanish');
      expect(result.translatedText).toBe('Bienvenido a StandWay');
      expect(result.isTranslated).toBe(true);
    });

    it('should return original text for English', () => {
      const result = runLanguageAgent('Welcome to StandWay', 'English');
      expect(result.translatedText).toBe('Welcome to StandWay');
      expect(result.isTranslated).toBe(false);
    });
  });
});
