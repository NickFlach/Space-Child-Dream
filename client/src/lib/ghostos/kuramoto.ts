/**
 * Kuramoto Oscillator Model Implementation
 *
 * The Kuramoto model describes synchronization of coupled oscillators:
 * dθᵢ/dt = ωᵢ + (K/N) * Σⱼsin(θⱼ - θᵢ) + η(t)
 *
 * Where:
 * - θᵢ is the phase of oscillator i
 * - ωᵢ is the natural frequency of oscillator i
 * - K is the coupling strength
 * - N is the number of oscillators
 * - η(t) is chiral noise
 *
 * @module ghostos/kuramoto
 */

export interface Oscillator {
  id: string;
  theta: number;      // phase angle in radians [0, 2π)
  omega: number;      // natural frequency
  coupling: number;   // local coupling modifier
}

export interface KuramotoSystem {
  oscillators: Oscillator[];
  couplingStrength: number;  // K
  chiralNoise: (t: number) => number;  // η(t)
  time: number;
}

export interface OrderParameter {
  r: number;    // magnitude [0, 1]
  psi: number;  // mean phase
  real: number;
  imag: number;
}

export interface CoherenceResult {
  coherence: number;
  meanPhase: number;
  phaseVariance: number;
  coherenceFrequency: number;
}

export function normalizeAngle(theta: number): number {
  const twoPi = 2 * Math.PI;
  let normalized = theta % twoPi;
  if (normalized < 0) normalized += twoPi;
  return normalized;
}

export function createOscillator(
  id: string,
  omega?: number,
  initialPhase?: number,
  coupling: number = 1.0
): Oscillator {
  return {
    id,
    theta: initialPhase ?? Math.random() * 2 * Math.PI,
    omega: omega ?? 1.0 + (Math.random() - 0.5) * 0.2,
    coupling
  };
}

export function createChiralNoise(
  amplitude: number = 0.1,
  frequencies: number[] = [0.1, 0.3, 0.7]
): (t: number) => number {
  return (t: number) => {
    let noise = 0;
    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];
      const phase = (i * Math.PI) / frequencies.length;
      noise += Math.sin(freq * t + phase) / frequencies.length;
    }
    return amplitude * noise;
  };
}

export function createKuramotoSystem(
  oscillatorCount: number,
  couplingStrength: number = 1.0,
  chiralNoise?: (t: number) => number
): KuramotoSystem {
  const oscillators: Oscillator[] = [];
  for (let i = 0; i < oscillatorCount; i++) {
    oscillators.push(createOscillator(`osc-${i}`));
  }
  return {
    oscillators,
    couplingStrength,
    chiralNoise: chiralNoise ?? createChiralNoise(),
    time: 0
  };
}

export function computeOrderParameter(oscillators: Oscillator[]): OrderParameter {
  if (oscillators.length === 0) {
    return { r: 0, psi: 0, real: 0, imag: 0 };
  }

  const N = oscillators.length;
  let realSum = 0;
  let imagSum = 0;

  for (const osc of oscillators) {
    realSum += Math.cos(osc.theta);
    imagSum += Math.sin(osc.theta);
  }

  const real = realSum / N;
  const imag = imagSum / N;
  const r = Math.sqrt(real * real + imag * imag);
  const psi = Math.atan2(imag, real);

  return {
    r: Math.min(1, r),
    psi: normalizeAngle(psi),
    real,
    imag
  };
}

function computeCouplingTerm(
  oscillator: Oscillator,
  orderParameter: OrderParameter,
  couplingStrength: number
): number {
  return couplingStrength * orderParameter.r *
    Math.sin(orderParameter.psi - oscillator.theta) *
    oscillator.coupling;
}

export function stepKuramoto(system: KuramotoSystem, dt: number): KuramotoSystem {
  const { oscillators, couplingStrength, chiralNoise, time } = system;
  const N = oscillators.length;

  if (N === 0) {
    system.time += dt;
    return system;
  }

  const orderParam = computeOrderParameter(oscillators);
  const noise = chiralNoise(time);

  // RK4 integration
  for (const osc of oscillators) {
    const k1 = osc.omega + computeCouplingTerm(osc, orderParam, couplingStrength) + noise;

    const theta2 = osc.theta + k1 * dt / 2;
    const tempOsc2 = { ...osc, theta: theta2 };
    const noise2 = chiralNoise(time + dt / 2);
    const k2 = osc.omega + computeCouplingTerm(tempOsc2, orderParam, couplingStrength) + noise2;

    const theta3 = osc.theta + k2 * dt / 2;
    const tempOsc3 = { ...osc, theta: theta3 };
    const k3 = osc.omega + computeCouplingTerm(tempOsc3, orderParam, couplingStrength) + noise2;

    const theta4 = osc.theta + k3 * dt;
    const tempOsc4 = { ...osc, theta: theta4 };
    const noise4 = chiralNoise(time + dt);
    const k4 = osc.omega + computeCouplingTerm(tempOsc4, orderParam, couplingStrength) + noise4;

    osc.theta = normalizeAngle(osc.theta + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4));
  }

  system.time += dt;
  return system;
}

export function measureCoherence(system: KuramotoSystem): CoherenceResult {
  const { oscillators } = system;

  if (oscillators.length === 0) {
    return { coherence: 0, meanPhase: 0, phaseVariance: 0, coherenceFrequency: 0 };
  }

  const orderParam = computeOrderParameter(oscillators);
  const phaseVariance = 1 - orderParam.r;
  const meanOmega = oscillators.reduce((sum, o) => sum + o.omega, 0) / oscillators.length;

  return {
    coherence: orderParam.r,
    meanPhase: orderParam.psi,
    phaseVariance,
    coherenceFrequency: meanOmega
  };
}

export function synchronize(
  system: KuramotoSystem,
  targetPhase: number,
  strength: number = 0.5
): KuramotoSystem {
  const normalizedTarget = normalizeAngle(targetPhase);
  const clampedStrength = Math.max(0, Math.min(1, strength));

  for (const osc of system.oscillators) {
    let phaseDiff = normalizedTarget - osc.theta;
    if (phaseDiff > Math.PI) phaseDiff -= 2 * Math.PI;
    if (phaseDiff < -Math.PI) phaseDiff += 2 * Math.PI;
    osc.theta = normalizeAngle(osc.theta + phaseDiff * clampedStrength * osc.coupling);
  }

  return system;
}

export function isSynchronized(system: KuramotoSystem, threshold: number = 0.9): boolean {
  const { coherence } = measureCoherence(system);
  return coherence >= threshold;
}

export function simulate(
  system: KuramotoSystem,
  duration: number,
  dt: number = 0.01
): CoherenceResult[] {
  const results: CoherenceResult[] = [];
  const steps = Math.floor(duration / dt);

  for (let i = 0; i < steps; i++) {
    stepKuramoto(system, dt);
    if (i % 10 === 0) results.push(measureCoherence(system));
  }

  return results;
}

export function estimateCriticalCoupling(oscillators: Oscillator[]): number {
  if (oscillators.length < 2) return 0;
  const omegas = oscillators.map(o => o.omega);
  const deltaOmega = (Math.max(...omegas) - Math.min(...omegas)) / 2;
  return (4 * deltaOmega) / Math.PI;
}

export function adaptCouplingStrength(
  system: KuramotoSystem,
  targetCoherence: number,
  learningRate: number = 0.1
): number {
  const { coherence } = measureCoherence(system);
  const adjustment = (targetCoherence - coherence) * learningRate;
  system.couplingStrength = Math.max(0.1, system.couplingStrength + adjustment);
  return system.couplingStrength;
}
