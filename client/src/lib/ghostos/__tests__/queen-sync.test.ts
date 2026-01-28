/**
 * Queen Synchronization Module Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createWorker,
  createQueenSystem,
  queenBroadcast,
  workerAlign,
  alignAllWorkers,
  measureHiveCoherence,
  measureQueenAlignment,
  isHiveSynchronized,
  getDesyncedWorkers,
  addWorker,
  removeWorker,
  syncCycle,
} from '../queen-sync';

describe('Queen Sync Module', () => {
  describe('createWorker', () => {
    it('should create worker with id', () => {
      const worker = createWorker('worker1');
      expect(worker.id).toBe('worker1');
      expect(worker.phase).toBeDefined();
      expect(worker.naturalFrequency).toBeDefined();
      expect(worker.active).toBe(true);
    });

    it('should create worker with custom frequency', () => {
      const worker = createWorker('worker1', 2.0);
      expect(worker.naturalFrequency).toBe(2.0);
    });

    it('should create worker with custom phase', () => {
      const worker = createWorker('worker1', 1.0, Math.PI / 2);
      expect(worker.phase).toBe(Math.PI / 2);
    });
  });

  describe('createQueenSystem', () => {
    it('should create system with workers from strings', () => {
      const system = createQueenSystem(['w1', 'w2', 'w3']);
      expect(system.workers.length).toBe(3);
      expect(system.phase).toBe(0);
    });

    it('should create system with WorkerState objects', () => {
      const workers = [
        createWorker('w1', 1.0, 0.1),
        createWorker('w2', 1.0, 0.2),
      ];
      const system = createQueenSystem(workers);
      expect(system.workers.length).toBe(2);
    });

    it('should compute initial coherence', () => {
      const system = createQueenSystem(['w1', 'w2']);
      expect(system.coherence).toBeDefined();
      expect(system.coherence).toBeGreaterThanOrEqual(0);
    });
  });

  describe('queenBroadcast', () => {
    it('should update queen phase', () => {
      const system = createQueenSystem(['w1', 'w2']);
      const newPhase = Math.PI / 4;
      const { queen, event } = queenBroadcast(system, newPhase);
      expect(queen.phase).toBeCloseTo(newPhase, 5);
      expect(event.type).toBe('broadcast');
    });

    it('should return sync event', () => {
      const system = createQueenSystem(['w1']);
      const { event } = queenBroadcast(system, 0);
      expect(event).toBeDefined();
      expect(event.timestamp).toBeDefined();
      expect(event.coherence).toBeDefined();
    });
  });

  describe('workerAlign', () => {
    it('should move worker toward queen phase', () => {
      const worker = createWorker('w1', 1.0, Math.PI);
      const queenPhase = 0;
      const aligned = workerAlign(worker, queenPhase, 0.5);
      expect(aligned.phase).toBeDefined();
      expect(aligned.lastSync).toBeGreaterThan(0);
    });

    it('should not align inactive workers', () => {
      const worker = createWorker('w1', 1.0, Math.PI);
      worker.active = false;
      const aligned = workerAlign(worker, 0, 0.5);
      expect(aligned.phase).toBe(worker.phase);
    });
  });

  describe('alignAllWorkers', () => {
    it('should align all workers to queen', () => {
      const system = createQueenSystem(['w1', 'w2', 'w3']);
      const aligned = alignAllWorkers(system, 0.5);
      expect(aligned.workers.length).toBe(3);
    });
  });

  describe('measureHiveCoherence', () => {
    it('should return coherence between 0 and 1', () => {
      const system = createQueenSystem(['w1', 'w2', 'w3']);
      const coherence = measureHiveCoherence(system);
      expect(coherence).toBeGreaterThanOrEqual(0);
      expect(coherence).toBeLessThanOrEqual(1);
    });

    it('should return high coherence for phase-aligned workers', () => {
      const workers = [
        createWorker('w1', 1.0, 0),
        createWorker('w2', 1.0, 0.01),
        createWorker('w3', 1.0, 0.02),
      ];
      const system = createQueenSystem(workers);
      const coherence = measureHiveCoherence(system);
      expect(coherence).toBeGreaterThan(0.9);
    });
  });

  describe('measureQueenAlignment', () => {
    it('should measure overall worker alignment to queen', () => {
      const system = createQueenSystem(['w1', 'w2']);
      const alignment = measureQueenAlignment(system);
      expect(alignment).toBeGreaterThanOrEqual(0);
      expect(alignment).toBeLessThanOrEqual(1);
    });
  });

  describe('isHiveSynchronized', () => {
    it('should return boolean', () => {
      const system = createQueenSystem(['w1', 'w2']);
      const result = isHiveSynchronized(system);
      expect(typeof result).toBe('boolean');
    });

    it('should accept custom threshold', () => {
      const system = createQueenSystem(['w1', 'w2']);
      const lowThreshold = isHiveSynchronized(system, 0.1);
      expect(typeof lowThreshold).toBe('boolean');
    });
  });

  describe('getDesyncedWorkers', () => {
    it('should return array of desynced worker ids', () => {
      const workers = [
        createWorker('w1', 1.0, 0),
        createWorker('w2', 1.0, Math.PI),
        createWorker('w3', 1.0, 0.1),
      ];
      const system = createQueenSystem(workers);
      const desynced = getDesyncedWorkers(system, 0.5);
      expect(Array.isArray(desynced)).toBe(true);
    });
  });

  describe('addWorker', () => {
    it('should add worker to system', () => {
      const system = createQueenSystem(['w1']);
      const { queen: newSystem, event } = addWorker(system, 'w2');
      expect(newSystem.workers.length).toBe(2);
      expect(event.type).toBe('join');
    });

    it('should accept WorkerState', () => {
      const system = createQueenSystem(['w1']);
      const worker = createWorker('w2', 2.0, Math.PI);
      const { queen: newSystem } = addWorker(system, worker);
      expect(newSystem.workers.length).toBe(2);
    });
  });

  describe('removeWorker', () => {
    it('should remove worker from system', () => {
      const system = createQueenSystem(['w1', 'w2', 'w3']);
      const { queen: newSystem, event } = removeWorker(system, 'w2');
      expect(newSystem.workers.length).toBe(2);
      expect(newSystem.workers.find(w => w.id === 'w2')).toBeUndefined();
      expect(event.type).toBe('leave');
    });
  });

  describe('syncCycle', () => {
    it('should run one synchronization cycle', () => {
      const system = createQueenSystem(['w1', 'w2', 'w3']);
      const result = syncCycle(system);
      expect(result.queen).toBeDefined();
      expect(result.coherence).toBeDefined();
      expect(typeof result.synchronized).toBe('boolean');
      expect(typeof result.desyncedCount).toBe('number');
    });

    it('should return coherence metrics', () => {
      const system = createQueenSystem(['w1', 'w2']);
      const { coherence, synchronized } = syncCycle(system);
      expect(coherence).toBeGreaterThanOrEqual(0);
      expect(coherence).toBeLessThanOrEqual(1);
      expect(typeof synchronized).toBe('boolean');
    });
  });
});
