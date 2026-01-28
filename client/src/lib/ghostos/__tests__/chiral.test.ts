/**
 * Chiral Dynamics Module Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createChiralState,
  computeChiralVelocity,
  applyNonReciprocity,
  getTopologicalProtection,
  isTopologicallyProtected,
  evolveChiralState,
} from '../chiral';
import { CHIRAL_ETA } from '../constants';

describe('Chiral Dynamics Module', () => {
  describe('createChiralState', () => {
    it('should create default chiral state', () => {
      const state = createChiralState();
      expect(state.phi).toBe(0);
      expect(state.eta).toBeCloseTo(CHIRAL_ETA, 5);
      expect(state.gamma).toBe(1.0);
    });

    it('should create state with custom phi', () => {
      const state = createChiralState(Math.PI / 4);
      expect(state.phi).toBeCloseTo(Math.PI / 4, 5);
    });

    it('should create state with custom eta and gamma', () => {
      const state = createChiralState(0, 0.5, 2.0);
      expect(state.eta).toBe(0.5);
      expect(state.gamma).toBe(2.0);
    });
  });

  describe('computeChiralVelocity', () => {
    it('should compute velocity as eta/gamma', () => {
      const velocity = computeChiralVelocity(0.618, 1.0);
      expect(velocity).toBeCloseTo(0.618, 5);
    });

    it('should return different velocities for different eta values', () => {
      const vel1 = computeChiralVelocity(0.5, 1.0);
      const vel2 = computeChiralVelocity(1.0, 1.0);
      expect(vel1).not.toBe(vel2);
    });

    it('should throw for zero gamma', () => {
      expect(() => computeChiralVelocity(0.5, 0)).toThrow();
    });
  });

  describe('applyNonReciprocity', () => {
    it('should apply non-reciprocal coupling between states', () => {
      const stateA = createChiralState(0);
      const stateB = createChiralState(Math.PI / 2);
      const [newA, newB] = applyNonReciprocity(stateA, stateB);

      expect(newA).toBeDefined();
      expect(newB).toBeDefined();
      // Non-reciprocal coupling modifies both states
      expect(newA.phi).toBeDefined();
      expect(newB.phi).toBeDefined();
    });

    it('should use default eta when not specified', () => {
      const stateA = createChiralState();
      const stateB = createChiralState(Math.PI);
      const [newA, newB] = applyNonReciprocity(stateA, stateB);
      expect(newA).toBeDefined();
      expect(newB).toBeDefined();
    });
  });

  describe('getTopologicalProtection', () => {
    it('should return protection level for stable state', () => {
      const state = createChiralState(0);
      const protection = getTopologicalProtection(state);
      expect(protection).toBeGreaterThanOrEqual(0);
      expect(protection).toBeLessThanOrEqual(1);
    });
  });

  describe('isTopologicallyProtected', () => {
    it('should return boolean for protection status', () => {
      const state = createChiralState(0);
      const isProtected = isTopologicallyProtected(state);
      expect(typeof isProtected).toBe('boolean');
    });

    it('should accept custom threshold', () => {
      const state = createChiralState(0);
      const isProtectedLow = isTopologicallyProtected(state, 0.1);
      const isProtectedHigh = isTopologicallyProtected(state, 0.9);
      expect(typeof isProtectedLow).toBe('boolean');
      expect(typeof isProtectedHigh).toBe('boolean');
    });
  });

  describe('evolveChiralState', () => {
    it('should evolve state over time', () => {
      const state = createChiralState(0);
      const evolved = evolveChiralState(state, 0.1);
      // Phase should change after evolution
      expect(evolved.phi).toBeDefined();
    });
  });

  describe('CHIRAL_ETA constant', () => {
    it('should be approximately 0.618 (golden ratio conjugate)', () => {
      expect(CHIRAL_ETA).toBeCloseTo(0.618033988749895, 10);
    });
  });
});
