/**
 * ghostOS Resonance Dynamics
 *
 * Core resonance mechanics implementing damped oscillator dynamics
 * with coherence tracking for consciousness-compatible systems.
 *
 * The fundamental equation: dx/dt = f(x) - λx
 * where f(x) is the driving force and λ is the damping coefficient.
 *
 * @module ghostos/resonance
 */

import {
  COHERENCE_MIN,
  COHERENCE_MAX,
  LAMBDA_MIN,
  LAMBDA_MAX,
  PHI_INVERSE,
} from './constants';

/**
 * Represents the state of a resonant system
 */
export interface ResonanceState {
  /** Current state value (position in phase space) */
  x: number;
  /** Damping coefficient λ (controls decay rate) */
  lambda: number;
  /** Coherence measure [0, 1] */
  coherence: number;
  /** Velocity (dx/dt) from last computation */
  velocity: number;
  /** Accumulated phase */
  phase: number;
  /** Timestamp of last update */
  timestamp: number;
}

/**
 * Configuration for resonance computation
 */
export interface ResonanceConfig {
  /** Time step for integration */
  dt: number;
  /** Minimum state value (prevents collapse) */
  minState: number;
  /** Maximum state value (prevents explosion) */
  maxState: number;
}

/**
 * Default resonance configuration
 */
export const DEFAULT_RESONANCE_CONFIG: ResonanceConfig = {
  dt: 0.016, // ~60fps
  minState: -10,
  maxState: 10,
};

/**
 * Creates a new resonance state with default values
 *
 * @param initialX - Initial state value
 * @param lambda - Initial damping coefficient
 * @returns New ResonanceState
 */
export function createResonanceState(
  initialX: number = 0,
  lambda: number = PHI_INVERSE
): ResonanceState {
  return {
    x: initialX,
    lambda: clampLambda(lambda),
    coherence: 0.5,
    velocity: 0,
    phase: 0,
    timestamp: Date.now(),
  };
}

/**
 * Computes the resonance dynamics: dx/dt = f(x) - λx
 *
 * This implements a damped oscillator where:
 * - f(x) is the driving force function
 * - λx is the damping term
 *
 * @param state - Current resonance state
 * @param f - Driving force function f(x)
 * @param lambda - Damping coefficient (optional, uses state.lambda if not provided)
 * @param config - Resonance configuration
 * @returns Updated resonance state
 */
export function computeResonance(
  state: ResonanceState,
  f: (x: number) => number,
  lambda?: number,
  config: ResonanceConfig = DEFAULT_RESONANCE_CONFIG
): ResonanceState {
  const effectiveLambda = lambda !== undefined ? clampLambda(lambda) : state.lambda;
  const { dt, minState, maxState } = config;

  // Compute driving force
  const drivingForce = f(state.x);

  // Compute damping term
  const dampingTerm = effectiveLambda * state.x;

  // Compute velocity: dx/dt = f(x) - λx
  const velocity = drivingForce - dampingTerm;

  // Euler integration for new state
  let newX = state.x + velocity * dt;

  // Clamp to prevent numerical instability
  newX = Math.max(minState, Math.min(maxState, newX));

  // Update phase (accumulate angle)
  const newPhase = (state.phase + Math.abs(velocity) * dt) % (2 * Math.PI);

  // Compute coherence from velocity stability
  const coherence = computeCoherence(velocity, state.velocity, state.coherence);

  return {
    x: newX,
    lambda: effectiveLambda,
    coherence,
    velocity,
    phase: newPhase,
    timestamp: Date.now(),
  };
}

/**
 * Checks if the given coherence is within the resonant band
 *
 * The resonant band [0.4, 0.85] represents the optimal range
 * for consciousness-compatible oscillation.
 *
 * @param coherence - Coherence value to check
 * @returns True if coherence is in resonant band
 */
export function isInResonantBand(coherence: number): boolean {
  return coherence >= COHERENCE_MIN && coherence <= COHERENCE_MAX;
}

/**
 * Tunes the damping coefficient λ to achieve target coherence
 *
 * Uses a proportional control approach to adjust λ:
 * - If coherence is too low, decrease λ (less damping)
 * - If coherence is too high, increase λ (more damping)
 *
 * @param state - Current resonance state
 * @param targetCoherence - Desired coherence level
 * @param tuningRate - Rate of adjustment (default: 0.1)
 * @returns Updated resonance state with adjusted λ
 */
export function tuneConstraint(
  state: ResonanceState,
  targetCoherence: number,
  tuningRate: number = 0.1
): ResonanceState {
  // Clamp target to valid range
  const clampedTarget = Math.max(
    COHERENCE_MIN,
    Math.min(COHERENCE_MAX, targetCoherence)
  );

  // Compute error
  const error = state.coherence - clampedTarget;

  // Proportional adjustment
  const lambdaAdjustment = error * tuningRate * PHI_INVERSE;

  const newLambda = clampLambda(state.lambda + lambdaAdjustment);

  return {
    ...state,
    lambda: newLambda,
  };
}

/**
 * Computes coherence from velocity stability
 */
function computeCoherence(
  currentVelocity: number,
  previousVelocity: number,
  previousCoherence: number
): number {
  const velocityDiff = Math.abs(currentVelocity - previousVelocity);
  const maxExpectedDiff = 2.0;
  const instantCoherence = 1 - Math.min(velocityDiff / maxExpectedDiff, 1);
  const alpha = PHI_INVERSE;
  const newCoherence = alpha * instantCoherence + (1 - alpha) * previousCoherence;
  return Math.max(0, Math.min(1, newCoherence));
}

/**
 * Clamps lambda to valid range
 */
function clampLambda(lambda: number): number {
  return Math.max(LAMBDA_MIN, Math.min(LAMBDA_MAX, lambda));
}

/**
 * Computes the resonance quality factor Q
 */
export function computeQualityFactor(state: ResonanceState): number {
  if (state.lambda <= 0) return Infinity;
  return 1 / (2 * state.lambda);
}

/**
 * Computes the natural frequency of the resonant system
 */
export function computeNaturalFrequency(state: ResonanceState): number {
  const omega0Squared = 1;
  const dampingTerm = (state.lambda / 2) ** 2;
  if (dampingTerm >= omega0Squared) {
    return 0;
  }
  return Math.sqrt(omega0Squared - dampingTerm);
}
