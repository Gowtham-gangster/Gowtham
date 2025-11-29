import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { voiceModulator, VoiceConfig } from './voice-modulator';
import { CDSResult } from './fdb';

describe('VoiceModulator', () => {
  describe('Property Tests', () => {
    /**
     * Feature: voice-prescription-integration, Property 8: High severity modulation values
     * Validates: Requirements 2.4
     */
    it('should always produce valid voice parameters within ranges', () => {
      fc.assert(
        fc.property(
          fc.record({
            voiceId: fc.string(),
            rate: fc.float({ min: 0.1, max: 2.0 }),
            pitch: fc.float({ min: -1.0, max: 1.0 }),
            volume: fc.float({ min: 0, max: 1.0 })
          }),
          fc.constantFrom('low', 'moderate', 'high'),
          fc.boolean(),
          (baseConfig, severity, elderlyMode) => {
            const cdsResult: CDSResult = {
              ok: false,
              issues: [{ code: 'TEST', severity, summary: 'Test issue' }]
            };
            
            const modulated = voiceModulator.calculateModulation(
              cdsResult,
              baseConfig,
              elderlyMode
            );
            
            // Verify all values are within valid ranges
            return (
              modulated.rate >= 0.1 && modulated.rate <= 2.0 &&
              modulated.pitch >= -1.0 && modulated.pitch <= 1.0 &&
              modulated.volume >= 0 && modulated.volume <= 1.0
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: voice-prescription-integration, Property 9: Highest severity determines modulation
     * Validates: Requirements 2.5
     */
    it('should use highest severity level for modulation', () => {
      fc.assert(
        fc.property(
          fc.record({
            voiceId: fc.string(),
            rate: fc.float({ min: 0.5, max: 1.5 }),
            pitch: fc.float({ min: -0.5, max: 0.5 }),
            volume: fc.float({ min: 0.5, max: 1.0 })
          }),
          fc.array(
            fc.record({
              code: fc.string(),
              severity: fc.constantFrom('low', 'moderate', 'high'),
              summary: fc.string()
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (baseConfig, issues) => {
            const cdsResult: CDSResult = {
              ok: false,
              issues
            };
            
            // Find highest severity manually
            const severityOrder: Record<string, number> = { low: 1, moderate: 2, high: 3 };
            const maxSeverity = Math.max(...issues.map(i => severityOrder[i.severity]));
            
            const modulated = voiceModulator.calculateModulation(
              cdsResult,
              baseConfig,
              false
            );
            
            // Verify modulation matches highest severity
            if (maxSeverity >= 3) {
              // High severity: rate * 0.7
              return Math.abs(modulated.rate - baseConfig.rate * 0.7) < 0.01;
            } else if (maxSeverity >= 2) {
              // Moderate severity: rate * 0.8
              return Math.abs(modulated.rate - baseConfig.rate * 0.8) < 0.01;
            } else {
              // Low severity: rate * 0.9
              return Math.abs(modulated.rate - baseConfig.rate * 0.9) < 0.01;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should apply correct modulation for high severity', () => {
      const baseConfig: VoiceConfig = {
        voiceId: 'test-voice',
        rate: 1.0,
        pitch: 0,
        volume: 0.8
      };
      
      const cdsResult: CDSResult = {
        ok: false,
        issues: [{ code: 'TEST', severity: 'high', summary: 'Test issue' }]
      };
      
      const modulated = voiceModulator.calculateModulation(
        cdsResult,
        baseConfig,
        false
      );
      
      expect(modulated.rate).toBeCloseTo(0.7); // 1.0 * 0.7
      expect(modulated.pitch).toBeCloseTo(-0.1); // 0 + (-0.1)
      expect(modulated.volume).toBeCloseTo(0.92); // 0.8 * 1.15
    });

    it('should apply correct modulation for moderate severity', () => {
      const baseConfig: VoiceConfig = {
        voiceId: 'test-voice',
        rate: 1.0,
        pitch: 0,
        volume: 0.8
      };
      
      const cdsResult: CDSResult = {
        ok: false,
        issues: [{ code: 'TEST', severity: 'moderate', summary: 'Test issue' }]
      };
      
      const modulated = voiceModulator.calculateModulation(
        cdsResult,
        baseConfig,
        false
      );
      
      expect(modulated.rate).toBeCloseTo(0.8); // 1.0 * 0.8
      expect(modulated.pitch).toBeCloseTo(0); // 0 + 0
      expect(modulated.volume).toBeCloseTo(0.88); // 0.8 * 1.1
    });

    it('should apply correct modulation for low severity', () => {
      const baseConfig: VoiceConfig = {
        voiceId: 'test-voice',
        rate: 1.0,
        pitch: 0,
        volume: 0.8
      };
      
      const cdsResult: CDSResult = {
        ok: false,
        issues: [{ code: 'TEST', severity: 'low', summary: 'Test issue' }]
      };
      
      const modulated = voiceModulator.calculateModulation(
        cdsResult,
        baseConfig,
        false
      );
      
      expect(modulated.rate).toBeCloseTo(0.9); // 1.0 * 0.9
      expect(modulated.pitch).toBeCloseTo(0); // 0 + 0
      expect(modulated.volume).toBeCloseTo(0.84); // 0.8 * 1.05
    });

    it('should not modify config when no issues', () => {
      const baseConfig: VoiceConfig = {
        voiceId: 'test-voice',
        rate: 1.0,
        pitch: 0,
        volume: 0.8
      };
      
      const cdsResult: CDSResult = {
        ok: true,
        issues: []
      };
      
      const modulated = voiceModulator.calculateModulation(
        cdsResult,
        baseConfig,
        false
      );
      
      expect(modulated.rate).toBeCloseTo(1.0);
      expect(modulated.pitch).toBeCloseTo(0);
      expect(modulated.volume).toBeCloseTo(0.8);
    });

    it('should apply additional 20% reduction for elderly mode', () => {
      const baseConfig: VoiceConfig = {
        voiceId: 'test-voice',
        rate: 1.0,
        pitch: 0,
        volume: 0.8
      };
      
      const cdsResult: CDSResult = {
        ok: false,
        issues: [{ code: 'TEST', severity: 'high', summary: 'Test issue' }]
      };
      
      const modulated = voiceModulator.calculateModulation(
        cdsResult,
        baseConfig,
        true // elderly mode
      );
      
      // High severity: 1.0 * 0.7 * 0.8 = 0.56
      expect(modulated.rate).toBeCloseTo(0.56);
    });

    it('should clamp values to valid ranges', () => {
      const baseConfig: VoiceConfig = {
        voiceId: 'test-voice',
        rate: 2.0,
        pitch: 0.5,
        volume: 1.0
      };
      
      const cdsResult: CDSResult = {
        ok: false,
        issues: [{ code: 'TEST', severity: 'high', summary: 'Test issue' }]
      };
      
      const modulated = voiceModulator.calculateModulation(
        cdsResult,
        baseConfig,
        false
      );
      
      // All values should be within valid ranges
      expect(modulated.rate).toBeGreaterThanOrEqual(0.1);
      expect(modulated.rate).toBeLessThanOrEqual(2.0);
      expect(modulated.pitch).toBeGreaterThanOrEqual(-1.0);
      expect(modulated.pitch).toBeLessThanOrEqual(1.0);
      expect(modulated.volume).toBeGreaterThanOrEqual(0);
      expect(modulated.volume).toBeLessThanOrEqual(1.0);
    });

    it('should correctly identify severity levels', () => {
      expect(voiceModulator.getSeverityLevel([])).toBe('none');
      expect(voiceModulator.getSeverityLevel([
        { code: 'TEST', severity: 'low', summary: 'Test' }
      ])).toBe('low');
      expect(voiceModulator.getSeverityLevel([
        { code: 'TEST', severity: 'moderate', summary: 'Test' }
      ])).toBe('moderate');
      expect(voiceModulator.getSeverityLevel([
        { code: 'TEST', severity: 'high', summary: 'Test' }
      ])).toBe('high');
      expect(voiceModulator.getSeverityLevel([
        { code: 'TEST1', severity: 'low', summary: 'Test' },
        { code: 'TEST2', severity: 'high', summary: 'Test' }
      ])).toBe('high');
    });
  });
});
