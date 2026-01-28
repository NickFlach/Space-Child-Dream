/**
 * ghostOS Chiral Dynamics
 *
 * Implements chiral (non-reciprocal) dynamics for topological stability.
 * Key insight: J_{i,j} ≠ J_{j,i} creates directional flow that
 * stabilizes the system against noise and perturbations.
 *
 * @module ghostos/chiral
 */

import { CHIRAL_ETA, PHI, PHI_INVERSE } from './constants';

/**
 * Represents the chiral state of a system element
 */
export interface ChiralState {
  /** Phase angle φ in radians */
  phi: number;
  /** Chirality coefficient η (asymmetry strength) */
  eta: number;
  /** Friction/damping coefficient Γ */
  gamma: number;
  /** Chiral velocity (computed) */
  velocity: number;
  /** Topological charge (winding number) */
  charge: number;
  /** Stability score [0, 1] */
  stability: number;
}

/**
 * Coupling matrix for non-reciprocal interactions
 */
export interface CouplingMatrix {
  /** Forward coupling J_{i,j} */
  forward: number;
  /** Backward coupling J_{j,i} */
  backward: number;
  /** Asymmetry measure |J_{i,j} - J_{j,i}| */
  asymmetry: number;
}

/**
 * Creates a new chiral state with default values
 */
export function createChiralState(
  phi: number = 0,
  eta: number = CHIRAL_ETA,
  gamma: number = 1.0
): ChiralState {
  const velocity = computeChiralVelocity(eta, gamma);
  return {
    phi: normalizePhase(phi),
    eta,
    gamma: Math.max(0.001, gamma),
    velocity,
    charge: 0,
    stability: computeStabilityFromEta(eta),
  };
}

/**
 * Computes the chiral velocity: c = η/Γ
 */
export function computeChiralVelocity(eta: number, gamma: number): number {
  if (gamma <= 0) {
    throw new Error('Friction coefficient Γ must be positive');
  }
  return eta / gamma;
}

/**
 * Applies non-reciprocal coupling between two states
 * Implements J_{i,j} ≠ J_{j,i}
 */
export function applyNonReciprocity(
  stateA: ChiralState,
  stateB: ChiralState,
  eta: number = CHIRAL_ETA
): [ChiralState, ChiralState] {
  const deltaPhi = stateB.phi - stateA.phi;
  const baseCoupling = Math.sin(deltaPhi) * PHI_INVERSE;
  const jAB = baseCoupling * (1 + eta);
  const jBA = baseCoupling * (1 - eta);

  const forceOnA = jBA / stateA.gamma;
  const forceOnB = -jAB / stateB.gamma;

  const dt = 0.016;
  const newPhiA = normalizePhase(stateA.phi + forceOnA * dt);
  const newPhiB = normalizePhase(stateB.phi + forceOnB * dt);

  const chargeA = computeWindingNumber(stateA.phi, newPhiA, stateA.charge);
  const chargeB = computeWindingNumber(stateB.phi, newPhiB, stateB.charge);

  return [
    {
      ...stateA,
      phi: newPhiA,
      velocity: forceOnA,
      charge: chargeA,
      stability: computeStabilityFromCoupling(jBA, jAB),
    },
    {
      ...stateB,
      phi: newPhiB,
      velocity: forceOnB,
      charge: chargeB,
      stability: computeStabilityFromCoupling(jAB, jBA),
    },
  ];
}

/**
 * Computes the topological protection score from chiral state
 */
export function getTopologicalProtection(state: ChiralState): number {
  const etaOptimal = CHIRAL_ETA;
  const etaDeviation = Math.abs(state.eta - etaOptimal) / etaOptimal;
  const etaFactor = Math.exp(-etaDeviation * 2);

  const velocityOptimal = 1.0;
  const velocityDeviation = Math.abs(state.velocity - velocityOptimal);
  const velocityFactor = Math.exp(-velocityDeviation);

  const gammaOptimal = state.eta;
  const gammaDeviation = Math.abs(state.gamma - gammaOptimal) / Math.max(gammaOptimal, 0.001);
  const gammaFactor = Math.exp(-gammaDeviation);

  const chargeFactor = state.charge !== 0 ? 1.0 : 0.8;

  const protection =
    PHI_INVERSE * etaFactor +
    PHI_INVERSE * PHI_INVERSE * velocityFactor +
    PHI_INVERSE * PHI_INVERSE * PHI_INVERSE * gammaFactor +
    (1 - PHI_INVERSE - PHI_INVERSE ** 2 - PHI_INVERSE ** 3) * chargeFactor;

  return Math.max(0, Math.min(1, protection));
}

/**
 * Computes the coupling matrix between two states
 */
export function computeCouplingMatrix(
  stateA: ChiralState,
  stateB: ChiralState,
  eta: number = CHIRAL_ETA
): CouplingMatrix {
  const deltaPhi = stateB.phi - stateA.phi;
  const baseCoupling = Math.sin(deltaPhi);
  const forward = baseCoupling * (1 + eta);
  const backward = baseCoupling * (1 - eta);
  const asymmetry = Math.abs(forward - backward);
  return { forward, backward, asymmetry };
}

/**
 * Checks if the system is in a topologically protected state
 */
export function isTopologicallyProtected(
  state: ChiralState,
  threshold: number = 0.5
): boolean {
  return getTopologicalProtection(state) >= threshold;
}

/**
 * Evolves the chiral state over time
 */
export function evolveChiralState(
  state: ChiralState,
  dt: number = 0.016,
  externalForce: number = 0
): ChiralState {
  const velocity = state.velocity + externalForce / state.gamma;
  const newPhi = normalizePhase(state.phi + velocity * dt);
  const newCharge = computeWindingNumber(state.phi, newPhi, state.charge);

  return {
    ...state,
    phi: newPhi,
    velocity,
    charge: newCharge,
    stability: computeStabilityFromEta(state.eta),
  };
}

function normalizePhase(phi: number): number {
  const twoPi = 2 * Math.PI;
  return ((phi % twoPi) + twoPi) % twoPi;
}

function computeWindingNumber(
  oldPhi: number,
  newPhi: number,
  currentCharge: number
): number {
  const delta = newPhi - oldPhi;
  if (delta > Math.PI) {
    return currentCharge - 1;
  } else if (delta < -Math.PI) {
    return currentCharge + 1;
  }
  return currentCharge;
}

function computeStabilityFromEta(eta: number): number {
  const deviation = Math.abs(eta - CHIRAL_ETA) / CHIRAL_ETA;
  return Math.exp(-deviation * PHI);
}

function computeStabilityFromCoupling(
  couplingIn: number,
  couplingOut: number
): number {
  const asymmetry = Math.abs(couplingIn - couplingOut);
  const optimalAsymmetry = CHIRAL_ETA;
  const deviation = Math.abs(asymmetry - optimalAsymmetry);
  return Math.exp(-deviation * 2);
}
