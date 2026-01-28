/**
 * Kuramoto Oscillator Module Tests
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeAngle,
  createOscillator,
  createKuramotoSystem,
  computeOrderParameter,
  stepKuramoto,
  measureCoherence,
  synchronize,
  isSynchronized,
  simulate,
} from '../kuramoto';

describe('Kuramoto Module', () => {
  describe('normalizeAngle', () => {
    it('should normalize angle to [0, 2π)', () => {
      expect(normalizeAngle(0)).toBe(0);
      const result = normalizeAngle(Math.PI);
      expect(result).toBeCloseTo(Math.PI, 10);
    });

    it('should wrap angles > 2π', () => {
      const result = normalizeAngle(3 * Math.PI);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(2 * Math.PI);
    });

    it('should wrap negative angles', () => {
      const result = normalizeAngle(-Math.PI);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(2 * Math.PI);
    });
  });

  describe('createOscillator', () => {
    it('should create oscillator with id', () => {
      const osc = createOscillator('test');
      expect(osc.id).toBe('test');
      expect(osc.theta).toBeDefined();
      expect(osc.omega).toBeDefined();
    });

    it('should create oscillator with custom omega and phase', () => {
      const osc = createOscillator('test', 2.0, Math.PI / 4);
      expect(osc.omega).toBe(2.0);
      expect(osc.theta).toBe(Math.PI / 4);
    });
  });

  describe('createKuramotoSystem', () => {
    it('should create system with specified oscillator count', () => {
      const system = createKuramotoSystem(5);
      expect(system.oscillators.length).toBe(5);
    });

    it('should set coupling strength', () => {
      const system = createKuramotoSystem(3, 0.5);
      expect(system.couplingStrength).toBe(0.5);
    });

    it('should initialize time to 0', () => {
      const system = createKuramotoSystem(4);
      expect(system.time).toBe(0);
    });
  });

  describe('computeOrderParameter', () => {
    it('should return high r for synchronized oscillators', () => {
      const oscillators = [
        createOscillator('a', 1.0, 0),
        createOscillator('b', 1.0, 0),
        createOscillator('c', 1.0, 0),
      ];
      const order = computeOrderParameter(oscillators);
      expect(order.r).toBeCloseTo(1, 5);
    });

    it('should return low r for desynchronized oscillators', () => {
      const oscillators = [
        createOscillator('a', 1.0, 0),
        createOscillator('b', 1.0, Math.PI * 2 / 3),
        createOscillator('c', 1.0, Math.PI * 4 / 3),
      ];
      const order = computeOrderParameter(oscillators);
      expect(order.r).toBeLessThan(0.5);
    });

    it('should return zero for empty array', () => {
      const order = computeOrderParameter([]);
      expect(order.r).toBe(0);
    });
  });

  describe('stepKuramoto', () => {
    it('should evolve system by one time step', () => {
      const system = createKuramotoSystem(3, 0.5);
      const initialTime = system.time;
      const stepped = stepKuramoto(system, 0.1);
      expect(stepped.time).toBeGreaterThan(initialTime);
    });

    it('should update oscillator phases', () => {
      const system = createKuramotoSystem(3, 0.5);
      const initialPhases = system.oscillators.map(o => o.theta);
      const stepped = stepKuramoto(system, 0.1);
      const newPhases = stepped.oscillators.map(o => o.theta);
      // At least some phases should have changed
      expect(newPhases).not.toEqual(initialPhases);
    });
  });

  describe('measureCoherence', () => {
    it('should return coherence result', () => {
      const system = createKuramotoSystem(4, 0.5);
      const result = measureCoherence(system);
      expect(result.coherence).toBeGreaterThanOrEqual(0);
      expect(result.coherence).toBeLessThanOrEqual(1);
      expect(result.meanPhase).toBeDefined();
    });
  });

  describe('synchronize', () => {
    it('should return a system', () => {
      const system = createKuramotoSystem(3, 0.5);
      const synced = synchronize(system, 0, 0.5);
      expect(synced).toBeDefined();
      expect(synced.oscillators).toBeDefined();
    });
  });

  describe('isSynchronized', () => {
    it('should return boolean', () => {
      const system = createKuramotoSystem(3, 1.0);
      const result = isSynchronized(system);
      expect(typeof result).toBe('boolean');
    });

    it('should accept custom threshold', () => {
      const system = createKuramotoSystem(3, 0.5);
      const resultLow = isSynchronized(system, 0.1);
      const resultHigh = isSynchronized(system, 0.99);
      expect(typeof resultLow).toBe('boolean');
      expect(typeof resultHigh).toBe('boolean');
    });
  });

  describe('simulate', () => {
    it('should run simulation and return coherence results', () => {
      const system = createKuramotoSystem(3, 0.5);
      const results = simulate(system, 1.0, 0.1);
      expect(Array.isArray(results)).toBe(true);
      // Results are recorded every 10 steps
      expect(results.length).toBeGreaterThan(0);
    });

    it('should record coherence measurements', () => {
      const system = createKuramotoSystem(3, 0.5);
      const results = simulate(system, 0.5, 0.01);
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => {
        expect(r.coherence).toBeDefined();
        expect(r.meanPhase).toBeDefined();
      });
    });
  });
});
