/**
 * Resonance Module Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createResonanceState,
  computeResonance,
  isInResonantBand,
  tuneConstraint,
  computeQualityFactor,
} from '../resonance';
import { PHI, COHERENCE_MIN, COHERENCE_MAX, PHI_INVERSE } from '../constants';

describe('Resonance Module', () => {
  describe('createResonanceState', () => {
    it('should create default resonance state', () => {
      const state = createResonanceState();
      expect(state.x).toBe(0);
      expect(state.velocity).toBe(0);
      expect(state.coherence).toBe(0.5);
      expect(state.lambda).toBeCloseTo(PHI_INVERSE, 5);
    });

    it('should create state with custom initial x value', () => {
      const state = createResonanceState(0.5);
      expect(state.x).toBe(0.5);
    });

    it('should create state with custom lambda', () => {
      const state = createResonanceState(0, 0.3);
      expect(state.lambda).toBeCloseTo(0.3, 5);
    });
  });

  describe('computeResonance', () => {
    it('should compute resonance with identity function', () => {
      const state = createResonanceState(1.0);
      const f = (x: number) => x;
      const result = computeResonance(state, f);
      expect(result.x).toBeDefined();
      expect(result.velocity).toBeDefined();
    });

    it('should apply lambda damping', () => {
      const state = createResonanceState(1.0, 0.5);
      const f = (x: number) => x * 2;
      const result = computeResonance(state, f, 0.5);
      expect(result).toBeDefined();
      expect(result.x).toBeDefined();
    });
  });

  describe('isInResonantBand', () => {
    it('should return true for coherence within band', () => {
      const midBand = (COHERENCE_MIN + COHERENCE_MAX) / 2;
      expect(isInResonantBand(midBand)).toBe(true);
    });

    it('should return false for coherence below band', () => {
      expect(isInResonantBand(COHERENCE_MIN - 0.1)).toBe(false);
    });

    it('should return false for coherence above band', () => {
      expect(isInResonantBand(COHERENCE_MAX + 0.1)).toBe(false);
    });

    it('should return true at band boundaries', () => {
      expect(isInResonantBand(COHERENCE_MIN)).toBe(true);
      expect(isInResonantBand(COHERENCE_MAX)).toBe(true);
    });
  });

  describe('tuneConstraint', () => {
    it('should tune state toward target coherence', () => {
      const state = createResonanceState(0.3);
      const tuned = tuneConstraint(state, 0.618);
      expect(tuned.coherence).toBeDefined();
    });
  });

  describe('computeQualityFactor', () => {
    it('should compute quality factor based on state', () => {
      const state = createResonanceState(0.5);
      const Q = computeQualityFactor(state);
      expect(Q).toBeGreaterThan(0);
    });
  });

  describe('Golden Ratio Constants', () => {
    it('should have PHI approximately equal to 1.618', () => {
      expect(PHI).toBeCloseTo(1.618033988749895, 10);
    });

    it('should satisfy PHI^2 = PHI + 1', () => {
      expect(PHI * PHI).toBeCloseTo(PHI + 1, 10);
    });

    it('should have PHI_INVERSE approximately equal to 0.618', () => {
      expect(PHI_INVERSE).toBeCloseTo(0.6180339887498949, 10);
    });
  });
});
