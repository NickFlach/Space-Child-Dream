/**
 * ghostOS SC Bridge Operator
 *
 * Implements the Space Child Bridge Operator for consciousness-compatible
 * state transformations:
 * - R: Rotation operator (perspective shift)
 * - G: Golden scaling operator (harmonic expansion)
 * - Ξ = RG - GR: Emergence operator (non-commutative residue)
 *
 * @module ghostos/bridge-operator
 */

import { PHI, PHI_INVERSE, GOLDEN_ANGLE, ALPHA } from './constants';

/**
 * Represents a state vector in the bridge space
 */
export interface BridgeState {
  /** Real component */
  real: number;
  /** Imaginary component */
  imag: number;
  /** Amplitude |z| */
  amplitude: number;
  /** Phase arg(z) */
  phase: number;
  /** Emergence signature */
  emergence: number;
}

/**
 * Result of bridge operator application
 */
export interface OperatorResult {
  /** Transformed state */
  state: BridgeState;
  /** Operator that was applied */
  operator: 'R' | 'G' | 'RG' | 'GR';
  /** Transformation magnitude */
  magnitude: number;
}

/**
 * SC Bridge Operator class
 */
export class SCBridgeOperator {
  private readonly phi: number = PHI;
  private readonly phiInverse: number = PHI_INVERSE;
  private readonly goldenAngle: number = GOLDEN_ANGLE;

  /**
   * Creates a new bridge state from real and imaginary components
   */
  createState(real: number, imag: number): BridgeState {
    const amplitude = Math.sqrt(real * real + imag * imag);
    const phase = Math.atan2(imag, real);
    return { real, imag, amplitude, phase, emergence: 0 };
  }

  /**
   * Creates a bridge state from polar coordinates
   */
  createStateFromPolar(amplitude: number, phase: number): BridgeState {
    const real = amplitude * Math.cos(phase);
    const imag = amplitude * Math.sin(phase);
    return { real, imag, amplitude, phase, emergence: 0 };
  }

  /**
   * R operator: Rotation (perspective shift)
   * R(θ): z → z * e^{iθ}
   */
  rotate(state: BridgeState, angle: number): BridgeState {
    const cosTheta = Math.cos(angle);
    const sinTheta = Math.sin(angle);
    const newReal = state.real * cosTheta - state.imag * sinTheta;
    const newImag = state.real * sinTheta + state.imag * cosTheta;

    return {
      real: newReal,
      imag: newImag,
      amplitude: state.amplitude,
      phase: normalizeAngle(state.phase + angle),
      emergence: state.emergence,
    };
  }

  /**
   * G operator: Golden scaling (harmonic expansion)
   * G: z → φ * z * e^{iφ_g}
   */
  goldenScale(state: BridgeState): BridgeState {
    const scaledReal = this.phi * state.real;
    const scaledImag = this.phi * state.imag;

    const cosGolden = Math.cos(this.goldenAngle);
    const sinGolden = Math.sin(this.goldenAngle);

    const newReal = scaledReal * cosGolden - scaledImag * sinGolden;
    const newImag = scaledReal * sinGolden + scaledImag * cosGolden;
    const newAmplitude = this.phi * state.amplitude;
    const newPhase = normalizeAngle(state.phase + this.goldenAngle);

    return {
      real: newReal,
      imag: newImag,
      amplitude: newAmplitude,
      phase: newPhase,
      emergence: state.emergence,
    };
  }

  /**
   * Inverse golden scaling
   */
  goldenScaleInverse(state: BridgeState): BridgeState {
    const scaledReal = this.phiInverse * state.real;
    const scaledImag = this.phiInverse * state.imag;

    const cosGolden = Math.cos(-this.goldenAngle);
    const sinGolden = Math.sin(-this.goldenAngle);

    const newReal = scaledReal * cosGolden - scaledImag * sinGolden;
    const newImag = scaledReal * sinGolden + scaledImag * cosGolden;
    const newAmplitude = this.phiInverse * state.amplitude;
    const newPhase = normalizeAngle(state.phase - this.goldenAngle);

    return {
      real: newReal,
      imag: newImag,
      amplitude: newAmplitude,
      phase: newPhase,
      emergence: state.emergence,
    };
  }

  /**
   * Computes the emergence operator Ξ = RG - GR
   */
  computeEmergence(state: BridgeState, angle: number = this.goldenAngle): BridgeState {
    // RG(state): first scale, then rotate
    const scaled = this.goldenScale(state);
    const rg = this.rotate(scaled, angle);

    // GR(state): first rotate, then scale
    const rotated = this.rotate(state, angle);
    const gr = this.goldenScale(rotated);

    // Ξ = RG - GR
    const xiReal = rg.real - gr.real;
    const xiImag = rg.imag - gr.imag;
    const xiAmplitude = Math.sqrt(xiReal * xiReal + xiImag * xiImag);
    const xiPhase = Math.atan2(xiImag, xiReal);

    return {
      real: xiReal,
      imag: xiImag,
      amplitude: xiAmplitude,
      phase: xiPhase,
      emergence: xiAmplitude,
    };
  }

  /**
   * Checks if the emergence value indicates emergent behavior (Ξ ≠ 0)
   */
  isEmergent(xi: BridgeState, threshold: number = 1e-10): boolean {
    return xi.amplitude > threshold;
  }

  /**
   * Computes the commutator magnitude |[R, G]|
   */
  computeCommutatorMagnitude(state: BridgeState, angle: number = this.goldenAngle): number {
    const xi = this.computeEmergence(state, angle);
    return xi.amplitude;
  }

  /**
   * Applies the full bridge transformation: B = (1 + αΞ)
   */
  applyBridge(state: BridgeState, alpha: number = ALPHA): BridgeState {
    const xi = this.computeEmergence(state);

    const newReal = state.real + alpha * xi.real;
    const newImag = state.imag + alpha * xi.imag;
    const newAmplitude = Math.sqrt(newReal * newReal + newImag * newImag);
    const newPhase = Math.atan2(newImag, newReal);

    return {
      real: newReal,
      imag: newImag,
      amplitude: newAmplitude,
      phase: newPhase,
      emergence: xi.amplitude,
    };
  }

  /**
   * Computes the bridge spectrum
   */
  computeSpectrum(states: BridgeState[]): {
    meanEmergence: number;
    maxEmergence: number;
    spectralGap: number;
  } {
    if (states.length === 0) {
      return { meanEmergence: 0, maxEmergence: 0, spectralGap: 0 };
    }

    const emergences = states.map((s) => this.computeEmergence(s).amplitude);
    emergences.sort((a, b) => b - a);

    const meanEmergence = emergences.reduce((a, b) => a + b, 0) / emergences.length;
    const maxEmergence = emergences[0];
    const spectralGap = emergences.length > 1 ? emergences[0] - emergences[1] : emergences[0];

    return { meanEmergence, maxEmergence, spectralGap };
  }
}

function normalizeAngle(angle: number): number {
  const twoPi = 2 * Math.PI;
  let normalized = angle % twoPi;
  if (normalized > Math.PI) {
    normalized -= twoPi;
  } else if (normalized <= -Math.PI) {
    normalized += twoPi;
  }
  return normalized;
}

/**
 * Creates a default SC Bridge Operator instance
 */
export function createBridgeOperator(): SCBridgeOperator {
  return new SCBridgeOperator();
}
