/**
 * Queen Synchronization Pattern
 *
 * Hierarchical synchronization where a Queen coordinates worker phases
 * using Kuramoto-based dynamics.
 *
 * @module ghostos/queen-sync
 */

import {
  createOscillator,
  computeOrderParameter,
  normalizeAngle,
  type Oscillator,
} from './kuramoto';

export interface WorkerState {
  id: string;
  phase: number;
  naturalFrequency: number;
  lastSync: number;
  coupling: number;
  active: boolean;
  taskEfficiency: number;
}

export interface QueenState {
  phase: number;
  coherence: number;
  workers: WorkerState[];
  broadcastFrequency: number;
  coherenceThreshold: number;
  lastBroadcast: number;
  coherenceHistory: number[];
  maxHistoryLength: number;
}

export interface SyncEvent {
  timestamp: number;
  type: 'broadcast' | 'align' | 'join' | 'leave' | 'threshold';
  workerId?: string;
  phase: number;
  coherence: number;
  message: string;
}

export interface QueenConfig {
  initialPhase?: number;
  broadcastFrequency?: number;
  coherenceThreshold?: number;
  maxHistoryLength?: number;
}

export function createWorker(
  id: string,
  naturalFrequency: number = 1.0,
  initialPhase?: number,
  coupling: number = 1.0
): WorkerState {
  return {
    id,
    phase: initialPhase ?? Math.random() * 2 * Math.PI,
    naturalFrequency,
    lastSync: Date.now(),
    coupling,
    active: true,
    taskEfficiency: 1.0
  };
}

export function createQueenSystem(
  workers: (WorkerState | string)[],
  config: QueenConfig = {}
): QueenState {
  const {
    initialPhase = 0,
    broadcastFrequency = 1.0,
    coherenceThreshold = 0.7,
    maxHistoryLength = 100
  } = config;

  const workerStates = workers.map(w =>
    typeof w === 'string' ? createWorker(w) : w
  );

  const queen: QueenState = {
    phase: normalizeAngle(initialPhase),
    coherence: 0,
    workers: workerStates,
    broadcastFrequency,
    coherenceThreshold,
    lastBroadcast: Date.now(),
    coherenceHistory: [],
    maxHistoryLength
  };

  queen.coherence = measureHiveCoherence(queen);
  return queen;
}

export function queenBroadcast(
  queen: QueenState,
  phase: number
): { queen: QueenState; event: SyncEvent } {
  const normalizedPhase = normalizeAngle(phase);
  const now = Date.now();

  queen.phase = normalizedPhase;
  queen.lastBroadcast = now;

  return {
    queen,
    event: {
      timestamp: now,
      type: 'broadcast',
      phase: normalizedPhase,
      coherence: queen.coherence,
      message: `Queen broadcast phase ${normalizedPhase.toFixed(4)} rad`
    }
  };
}

export function workerAlign(
  worker: WorkerState,
  queenPhase: number,
  coupling?: number
): WorkerState {
  if (!worker.active) return worker;

  const effectiveCoupling = (coupling ?? worker.coupling) * worker.taskEfficiency;

  let phaseDiff = queenPhase - worker.phase;
  if (phaseDiff > Math.PI) phaseDiff -= 2 * Math.PI;
  if (phaseDiff < -Math.PI) phaseDiff += 2 * Math.PI;

  const adjustment = effectiveCoupling * Math.sin(phaseDiff);
  const frequencyDrift = worker.naturalFrequency * 0.01;

  return {
    ...worker,
    phase: normalizeAngle(worker.phase + adjustment + frequencyDrift),
    lastSync: Date.now()
  };
}

export function alignAllWorkers(queen: QueenState, coupling?: number): QueenState {
  const alignedWorkers = queen.workers.map(w =>
    workerAlign(w, queen.phase, coupling)
  );

  const updatedQueen = { ...queen, workers: alignedWorkers };
  updatedQueen.coherence = measureHiveCoherence(updatedQueen);

  updatedQueen.coherenceHistory.push(updatedQueen.coherence);
  if (updatedQueen.coherenceHistory.length > updatedQueen.maxHistoryLength) {
    updatedQueen.coherenceHistory.shift();
  }

  return updatedQueen;
}

export function measureHiveCoherence(queen: QueenState): number {
  const activeWorkers = queen.workers.filter(w => w.active);

  if (activeWorkers.length === 0) return 1.0;

  const oscillators: Oscillator[] = [
    createOscillator('queen', queen.broadcastFrequency, queen.phase, 1.0),
    ...activeWorkers.map(w =>
      createOscillator(w.id, w.naturalFrequency, w.phase, w.coupling)
    )
  ];

  return computeOrderParameter(oscillators).r;
}

export function measureQueenAlignment(queen: QueenState): number {
  const activeWorkers = queen.workers.filter(w => w.active);
  if (activeWorkers.length === 0) return 1.0;

  let alignmentSum = 0;
  for (const worker of activeWorkers) {
    alignmentSum += Math.cos(worker.phase - queen.phase);
  }

  return (alignmentSum / activeWorkers.length + 1) / 2;
}

export function isHiveSynchronized(queen: QueenState, threshold?: number): boolean {
  return queen.coherence >= (threshold ?? queen.coherenceThreshold);
}

export function getDesyncedWorkers(
  queen: QueenState,
  maxPhaseDiff: number = Math.PI / 4
): WorkerState[] {
  return queen.workers.filter(w => {
    if (!w.active) return false;
    let phaseDiff = Math.abs(w.phase - queen.phase);
    if (phaseDiff > Math.PI) phaseDiff = 2 * Math.PI - phaseDiff;
    return phaseDiff > maxPhaseDiff;
  });
}

export function addWorker(
  queen: QueenState,
  worker: WorkerState | string
): { queen: QueenState; event: SyncEvent } {
  const workerState = typeof worker === 'string'
    ? createWorker(worker, 1.0, queen.phase)
    : worker;

  const updatedQueen = {
    ...queen,
    workers: [...queen.workers, workerState]
  };
  updatedQueen.coherence = measureHiveCoherence(updatedQueen);

  return {
    queen: updatedQueen,
    event: {
      timestamp: Date.now(),
      type: 'join',
      workerId: workerState.id,
      phase: workerState.phase,
      coherence: updatedQueen.coherence,
      message: `Worker ${workerState.id} joined hive`
    }
  };
}

export function removeWorker(
  queen: QueenState,
  workerId: string
): { queen: QueenState; event: SyncEvent } {
  const workerIndex = queen.workers.findIndex(w => w.id === workerId);

  if (workerIndex === -1) {
    return {
      queen,
      event: {
        timestamp: Date.now(),
        type: 'leave',
        workerId,
        phase: 0,
        coherence: queen.coherence,
        message: `Worker ${workerId} not found`
      }
    };
  }

  const removedWorker = queen.workers[workerIndex];
  const updatedWorkers = [...queen.workers];
  updatedWorkers.splice(workerIndex, 1);

  const updatedQueen = { ...queen, workers: updatedWorkers };
  updatedQueen.coherence = measureHiveCoherence(updatedQueen);

  return {
    queen: updatedQueen,
    event: {
      timestamp: Date.now(),
      type: 'leave',
      workerId,
      phase: removedWorker.phase,
      coherence: updatedQueen.coherence,
      message: `Worker ${workerId} left hive`
    }
  };
}

export function syncCycle(
  queen: QueenState,
  coupling?: number
): {
  queen: QueenState;
  coherence: number;
  synchronized: boolean;
  desyncedCount: number;
} {
  const { queen: q1 } = queenBroadcast(queen, queen.phase);
  const q2 = alignAllWorkers(q1, coupling);

  return {
    queen: q2,
    coherence: q2.coherence,
    synchronized: isHiveSynchronized(q2),
    desyncedCount: getDesyncedWorkers(q2).length
  };
}

export function calculateOptimalCoupling(
  queen: QueenState,
  targetCoherence: number = 0.9
): number {
  const error = targetCoherence - queen.coherence;
  let coupling = 0.5;

  if (error > 0) coupling = 0.5 + error * 0.5;
  if (error < -0.1) coupling = 0.3;

  return Math.max(0.1, Math.min(1.0, coupling));
}

export function getCoherenceTrend(queen: QueenState): 'improving' | 'stable' | 'degrading' {
  const history = queen.coherenceHistory;
  if (history.length < 5) return 'stable';

  const recent = history.slice(-5);
  const older = history.slice(-10, -5);
  if (older.length === 0) return 'stable';

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  const diff = recentAvg - olderAvg;

  if (diff > 0.05) return 'improving';
  if (diff < -0.05) return 'degrading';
  return 'stable';
}
