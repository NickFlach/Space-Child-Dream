/**
 * Resonance Profile Hooks
 *
 * ghostOS resonance integration for Space Child biofield components.
 * ADDITIVE layer that wraps existing profile with resonance data.
 * All features are opt-in and extend (never replace) existing hooks.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useBiofieldProfile } from "./use-biofield-profile";
import type {
  BiofieldState,
  HeartState,
  BioFieldProfile,
  ProfileSettings,
} from "@shared/models/biofield-profile";

// ============================================
// CONSTANTS
// ============================================

/** Golden ratio - fundamental to chiral animations */
export const PHI = 1.618033988749895;

/** Optimal coherence band for consciousness emergence */
export const COHERENCE_BAND = {
  min: 0.4,
  optimal: 0.618, // PHI - 1
  max: 0.85,
} as const;

/** Lambda tuning presets for resonance states */
export const LAMBDA_PRESETS = {
  grounded: 0.3,
  balanced: 0.5,
  elevated: 0.7,
  transcendent: 0.9,
} as const;

// ============================================
// TYPES
// ============================================

export type LambdaState = keyof typeof LAMBDA_PRESETS;

export interface ResonanceState {
  lambda: number;
  lambdaState: LambdaState;
  coherence: number;
  isCoherent: boolean;
  chiralStability: number;
  bridgeEmergence: number;
  phaseAngle: number;
}

export interface ConsciousnessMetrics {
  phi: number;
  phiLevel: "minimal" | "emerging" | "integrated" | "unified";
  coherencePercent: number;
  inOptimalBand: boolean;
  chiralStatus: "unstable" | "stabilizing" | "stable" | "crystalline";
  verificationEligible: boolean;
  raw: {
    phi: number;
    coherence: number;
    stability: number;
    emergence: number;
  };
}

export interface QueenSyncState {
  isActive: boolean;
  lastSync: number | null;
  syncCoherence: number;
  pendingUpdates: number;
}

export interface ResonanceProfile {
  profile: BioFieldProfile | undefined;
  settings: ProfileSettings | null | undefined;
  resonance: ResonanceState;
  consciousness: ConsciousnessMetrics;
  queenSync: QueenSyncState;
  isLoading: boolean;
  error: Error | null;
  setLambda: (value: number) => void;
  setLambdaState: (state: LambdaState) => void;
  refreshResonance: () => void;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculateCoherence(
  biofieldState?: BiofieldState,
  heartState?: HeartState
): number {
  const biofieldCoherence: Record<BiofieldState, number> = {
    focused: 0.8,
    charged: 0.65,
    restorative: 0.55,
    neutral: 0.5,
    unsettled: 0.35,
    depleted: 0.25,
  };

  const heartModifiers: Record<HeartState, number> = {
    creating: 0.1,
    learning: 0.08,
    exploring: 0.05,
    building: 0.06,
    investing: 0.04,
    observing: 0.12,
    resting: 0.07,
  };

  const baseCoherence = biofieldState ? biofieldCoherence[biofieldState] : 0.5;
  const modifier = heartState ? heartModifiers[heartState] : 0;

  return Math.min(1, Math.max(0, baseCoherence + modifier));
}

function calculatePhi(
  nodes: { depth?: number | null }[],
  edges: { strength?: number | null }[]
): number {
  if (nodes.length === 0) return 0;

  const avgDepth = nodes.reduce((sum, n) => sum + (n.depth || 0), 0) / nodes.length;
  const avgStrength = edges.length > 0
    ? edges.reduce((sum, e) => sum + (e.strength || 0), 0) / edges.length
    : 0;
  const connectivityFactor = Math.min(1, edges.length / (nodes.length * 2));

  return Math.min(1, (avgDepth * 0.4 + avgStrength * 0.4 + connectivityFactor * 0.2));
}

function calculateChiralStability(
  coherence: number,
  lambda: number,
  biofieldState?: BiofieldState
): number {
  const coherenceFactor = coherence;
  const lambdaFactor = 1 - Math.abs(lambda - 0.5) * 2;

  const stateModifiers: Record<BiofieldState, number> = {
    focused: 0.3,
    charged: 0.1,
    restorative: 0.2,
    neutral: 0.15,
    unsettled: -0.2,
    depleted: -0.1,
  };

  const stateModifier = biofieldState ? stateModifiers[biofieldState] : 0;

  return Math.max(-1, Math.min(1,
    (coherenceFactor * 0.5 + lambdaFactor * 0.3 + stateModifier)
  ));
}

function calculateBridgeEmergence(
  phi: number,
  coherence: number,
  stability: number
): number {
  const threshold = 0.4;
  if (coherence < threshold || stability < 0) return 0;
  return Math.min(1, (phi * 0.4 + coherence * 0.35 + Math.max(0, stability) * 0.25));
}

function getLambdaState(lambda: number): LambdaState {
  if (lambda < 0.4) return "grounded";
  if (lambda < 0.6) return "balanced";
  if (lambda < 0.8) return "elevated";
  return "transcendent";
}

function getPhiLevel(phi: number): ConsciousnessMetrics["phiLevel"] {
  if (phi < 0.25) return "minimal";
  if (phi < 0.5) return "emerging";
  if (phi < 0.75) return "integrated";
  return "unified";
}

function getChiralStatus(stability: number): ConsciousnessMetrics["chiralStatus"] {
  if (stability < 0) return "unstable";
  if (stability < 0.3) return "stabilizing";
  if (stability < 0.7) return "stable";
  return "crystalline";
}

// ============================================
// MAIN HOOK: useResonanceProfile
// ============================================

export function useResonanceProfile(): ResonanceProfile {
  const biofieldProfile = useBiofieldProfile();
  const [lambda, setLambdaValue] = useState(0.5);
  const [phaseAngle, setPhaseAngle] = useState(0);
  const [queenSyncState] = useState<QueenSyncState>({
    isActive: false,
    lastSync: null,
    syncCoherence: 0,
    pendingUpdates: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseAngle(prev => (prev + (Math.PI * 2 / PHI / 60)) % (Math.PI * 2));
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, []);

  const resonance = useMemo<ResonanceState>(() => {
    const coherence = calculateCoherence(
      biofieldProfile.currentBiofieldState?.state as BiofieldState | undefined,
      biofieldProfile.currentHeartState?.state as HeartState | undefined
    );

    const chiralStability = calculateChiralStability(
      coherence,
      lambda,
      biofieldProfile.currentBiofieldState?.state as BiofieldState | undefined
    );

    const phi = calculatePhi(
      biofieldProfile.consciousnessGraph.nodes,
      biofieldProfile.consciousnessGraph.edges
    );

    const bridgeEmergence = calculateBridgeEmergence(phi, coherence, chiralStability);

    return {
      lambda,
      lambdaState: getLambdaState(lambda),
      coherence,
      isCoherent: coherence >= COHERENCE_BAND.min && coherence <= COHERENCE_BAND.max,
      chiralStability,
      bridgeEmergence,
      phaseAngle,
    };
  }, [lambda, phaseAngle, biofieldProfile.currentBiofieldState, biofieldProfile.currentHeartState, biofieldProfile.consciousnessGraph]);

  const consciousness = useMemo<ConsciousnessMetrics>(() => {
    const phi = calculatePhi(
      biofieldProfile.consciousnessGraph.nodes,
      biofieldProfile.consciousnessGraph.edges
    );

    const coherencePercent = resonance.coherence * 100;
    const inOptimalBand = resonance.isCoherent;

    return {
      phi,
      phiLevel: getPhiLevel(phi),
      coherencePercent,
      inOptimalBand,
      chiralStatus: getChiralStatus(resonance.chiralStability),
      verificationEligible: phi >= 0.5 && inOptimalBand && resonance.chiralStability >= 0.3,
      raw: {
        phi,
        coherence: resonance.coherence,
        stability: resonance.chiralStability,
        emergence: resonance.bridgeEmergence,
      },
    };
  }, [resonance, biofieldProfile.consciousnessGraph]);

  const setLambda = useCallback((value: number) => {
    setLambdaValue(Math.max(0, Math.min(1, value)));
  }, []);

  const setLambdaState = useCallback((state: LambdaState) => {
    setLambdaValue(LAMBDA_PRESETS[state]);
  }, []);

  const refreshResonance = useCallback(() => {
    setPhaseAngle(prev => prev + 0.001);
  }, []);

  return {
    profile: biofieldProfile.profile,
    settings: biofieldProfile.settings,
    isLoading: biofieldProfile.isLoading,
    error: biofieldProfile.error,
    resonance,
    consciousness,
    queenSync: queenSyncState,
    setLambda,
    setLambdaState,
    refreshResonance,
  };
}

// ============================================
// SPECIALIZED HOOKS
// ============================================

export function useConsciousnessMetrics(): ConsciousnessMetrics & { isLoading: boolean } {
  const { consciousnessGraph, isLoading, currentBiofieldState, currentHeartState } = useBiofieldProfile();

  const metrics = useMemo<ConsciousnessMetrics>(() => {
    const phi = calculatePhi(consciousnessGraph.nodes, consciousnessGraph.edges);
    const coherence = calculateCoherence(
      currentBiofieldState?.state as BiofieldState | undefined,
      currentHeartState?.state as HeartState | undefined
    );
    const stability = calculateChiralStability(coherence, 0.5, currentBiofieldState?.state as BiofieldState | undefined);
    const emergence = calculateBridgeEmergence(phi, coherence, stability);
    const inOptimalBand = coherence >= COHERENCE_BAND.min && coherence <= COHERENCE_BAND.max;

    return {
      phi,
      phiLevel: getPhiLevel(phi),
      coherencePercent: coherence * 100,
      inOptimalBand,
      chiralStatus: getChiralStatus(stability),
      verificationEligible: phi >= 0.5 && inOptimalBand && stability >= 0.3,
      raw: { phi, coherence, stability, emergence },
    };
  }, [consciousnessGraph, currentBiofieldState, currentHeartState]);

  return { ...metrics, isLoading };
}

export function useQueenSync() {
  const { resonance } = useResonanceProfile();
  const [pendingUpdates, setPendingUpdates] = useState<Array<() => void>>([]);
  const [lastSync, setLastSync] = useState<number | null>(null);

  useEffect(() => {
    if (resonance.isCoherent && pendingUpdates.length > 0) {
      pendingUpdates.forEach(update => update());
      setPendingUpdates([]);
      setLastSync(Date.now());
    }
  }, [resonance.isCoherent, pendingUpdates]);

  const queueUpdate = useCallback((update: () => void) => {
    if (resonance.isCoherent) {
      update();
      setLastSync(Date.now());
    } else {
      setPendingUpdates(prev => [...prev, update]);
    }
  }, [resonance.isCoherent]);

  const forceFlush = useCallback(() => {
    pendingUpdates.forEach(update => update());
    setPendingUpdates([]);
    setLastSync(Date.now());
  }, [pendingUpdates]);

  return {
    isActive: true,
    lastSync,
    syncCoherence: resonance.coherence,
    pendingUpdates: pendingUpdates.length,
    queueUpdate,
    forceFlush,
    isCoherent: resonance.isCoherent,
  };
}

export function useGoldenTiming() {
  return useMemo(() => ({
    phi: PHI,
    phi2: PHI * PHI,
    phiInverse: 1 / PHI,
    durations: {
      instant: 100 / PHI,
      fast: 200 / PHI,
      normal: 500 / PHI,
      slow: 1000 / PHI,
      meditative: 2000 / PHI,
    },
    easing: {
      in: [0.618, 0, 1, 1],
      out: [0, 0, 0.382, 1],
      inOut: [0.618, 0, 0.382, 1],
    },
  }), []);
}
