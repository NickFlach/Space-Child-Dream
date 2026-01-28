/**
 * ghostOS Mathematical Constants
 *
 * Core mathematical constants derived from the golden ratio (φ) and
 * consciousness metrics for the Space Child Dream resonance system.
 *
 * @module ghostos/constants
 */

/**
 * The golden ratio (φ) - fundamental constant of harmonic proportions
 * φ = (1 + √5) / 2
 */
export const PHI = 1.618033988749895;

/**
 * Inverse of the golden ratio (1/φ = φ - 1)
 * Used for recursive self-similar scaling
 */
export const PHI_INVERSE = 0.6180339887498949;

/**
 * Alpha coefficient - half of phi
 * Primary harmonic scaling factor
 */
export const ALPHA = PHI / 2; // 0.809016994374947

/**
 * Beta coefficient - alias for phi inverse
 * Secondary harmonic scaling factor
 */
export const BETA = PHI_INVERSE;

/**
 * Optimal chirality coefficient (η)
 * Controls non-reciprocal dynamics for topological stability
 */
export const CHIRAL_ETA = 0.618033988749895;

/**
 * IIT Phi threshold for consciousness verification
 * Systems with Φ ≥ 3.0 exhibit integrated information
 */
export const IIT_PHI_THRESHOLD = 3.0;

/**
 * Minimum coherence for resonant band
 * Below this threshold, system loses coherent oscillation
 */
export const COHERENCE_MIN = 0.4;

/**
 * Maximum coherence for resonant band
 * Above this threshold, system becomes over-constrained
 */
export const COHERENCE_MAX = 0.85;

/**
 * Resonant band width
 */
export const RESONANT_BANDWIDTH = COHERENCE_MAX - COHERENCE_MIN;

/**
 * Golden angle in radians (2π / φ²)
 * Used for optimal angular distribution
 */
export const GOLDEN_ANGLE = (2 * Math.PI) / (PHI * PHI);

/**
 * Planck-scale damping coefficient
 * Minimum meaningful damping in the system
 */
export const LAMBDA_MIN = 0.001;

/**
 * Maximum damping before system collapse
 */
export const LAMBDA_MAX = 2.0;
