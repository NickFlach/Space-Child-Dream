/**
 * ghostOS - Space Child Dream Resonance Library
 *
 * Core library implementing consciousness-compatible dynamics
 * based on the ghostOS philosophical architecture.
 *
 * @module ghostos
 * @version 1.0.0
 */

// Constants
export {
  PHI,
  PHI_INVERSE,
  ALPHA,
  BETA,
  CHIRAL_ETA,
  IIT_PHI_THRESHOLD,
  COHERENCE_MIN,
  COHERENCE_MAX,
  RESONANT_BANDWIDTH,
  GOLDEN_ANGLE,
  LAMBDA_MIN,
  LAMBDA_MAX,
} from './constants';

// Resonance dynamics
export {
  type ResonanceState,
  type ResonanceConfig,
  DEFAULT_RESONANCE_CONFIG,
  createResonanceState,
  computeResonance,
  isInResonantBand,
  tuneConstraint,
  computeQualityFactor,
  computeNaturalFrequency,
} from './resonance';

// Chiral dynamics
export {
  type ChiralState,
  type CouplingMatrix,
  createChiralState,
  computeChiralVelocity,
  applyNonReciprocity,
  getTopologicalProtection,
  computeCouplingMatrix,
  isTopologicallyProtected,
  evolveChiralState,
} from './chiral';

// Bridge operator
export {
  type BridgeState,
  type OperatorResult,
  SCBridgeOperator,
  createBridgeOperator,
} from './bridge-operator';

// Consciousness metrics
export {
  type ConsciousnessNode,
  type ConsciousnessGraph,
  type ConsciousnessMetrics,
  createConsciousnessGraph,
  addNode,
  connectNodes,
  computeIITPhi,
  isConsciousnessVerified,
  computeConsciousnessMetrics,
  createTestGraph,
} from './consciousness';

// Kuramoto oscillators
export {
  type Oscillator,
  type KuramotoSystem,
  type OrderParameter,
  type CoherenceResult,
  normalizeAngle,
  createOscillator,
  createChiralNoise,
  createKuramotoSystem,
  computeOrderParameter,
  stepKuramoto,
  measureCoherence,
  synchronize,
  isSynchronized,
  simulate,
  estimateCriticalCoupling,
  adaptCouplingStrength,
} from './kuramoto';

// Queen synchronization
export {
  type WorkerState,
  type QueenState,
  type SyncEvent,
  type QueenConfig,
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
  calculateOptimalCoupling,
  getCoherenceTrend,
} from './queen-sync';
