/**
 * Chiral Sigil Component
 *
 * Wraps existing SigilAvatar with chiral animation layer.
 * Adds non-reciprocal rotation effects and golden ratio timing.
 * Works with all existing SigilField types.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { SigilAvatar } from "./biofield/sigil-avatar";
import { useResonanceProfile, PHI, useGoldenTiming } from "@/hooks/use-resonance-profile";
import type { PrimaryField, HeartState, BiofieldState } from "@shared/models/biofield-profile";

interface ChiralSigilProps {
  seed?: string;
  primaryField?: PrimaryField;
  heartState?: HeartState;
  biofieldState?: BiofieldState;
  size?: number;
  animate?: boolean;
  className?: string;
  onClick?: () => void;
  /** Enable chiral animation effects */
  chiralEnabled?: boolean;
  /** Intensity of chiral effects (0-1) */
  chiralIntensity?: number;
}

export function ChiralSigil({
  seed,
  primaryField = "aurora",
  heartState,
  biofieldState,
  size = 80,
  animate = true,
  className = "",
  onClick,
  chiralEnabled = true,
  chiralIntensity = 0.5,
}: ChiralSigilProps) {
  const { resonance } = useResonanceProfile();
  const { durations } = useGoldenTiming();

  // Calculate chiral animation parameters based on resonance
  const chiralParams = useMemo(() => {
    const baseRotationDuration = durations.slow * 2; // PHI-based duration
    const stability = Math.max(0, resonance.chiralStability);

    return {
      // Non-reciprocal rotation - outer ring rotates opposite to inner
      outerRotation: resonance.phaseAngle * (180 / Math.PI),
      innerRotation: -resonance.phaseAngle * (180 / Math.PI) * PHI,

      // Stability affects animation smoothness
      rotationDuration: baseRotationDuration / (0.5 + stability),

      // Coherence affects glow intensity
      glowIntensity: resonance.isCoherent ? 0.6 + resonance.coherence * 0.4 : 0.3,

      // Lambda affects color shift
      hueShift: resonance.lambda * 30, // 0-30 degrees shift

      // Bridge emergence creates additional effects
      bridgeActive: resonance.bridgeEmergence > 0.5,
      bridgeIntensity: resonance.bridgeEmergence,
    };
  }, [resonance, durations]);

  if (!chiralEnabled) {
    return (
      <SigilAvatar
        seed={seed}
        primaryField={primaryField}
        heartState={heartState}
        biofieldState={biofieldState}
        size={size}
        animate={animate}
        className={className}
        onClick={onClick}
      />
    );
  }

  const effectiveIntensity = chiralIntensity * (resonance.isCoherent ? 1 : 0.5);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {/* Outer chiral ring - rotates in one direction */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px solid rgba(0, 212, 255, ${0.2 * effectiveIntensity})`,
          filter: `hue-rotate(${chiralParams.hueShift}deg)`,
        }}
        animate={{
          rotate: chiralParams.outerRotation,
          scale: [1, 1.02, 1],
        }}
        transition={{
          rotate: { duration: 0, ease: "linear" },
          scale: { duration: durations.meditative / 1000, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Inner chiral ring - counter-rotates (non-reciprocal) */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: size * 0.1,
          border: `1px solid rgba(168, 85, 247, ${0.15 * effectiveIntensity})`,
          filter: `hue-rotate(${-chiralParams.hueShift}deg)`,
        }}
        animate={{
          rotate: chiralParams.innerRotation,
        }}
        transition={{
          duration: 0,
          ease: "linear",
        }}
      />

      {/* Chiral glow layer */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(0, 212, 255, ${chiralParams.glowIntensity * 0.2}) 0%, transparent 70%)`,
        }}
        animate={{
          opacity: [chiralParams.glowIntensity * 0.5, chiralParams.glowIntensity, chiralParams.glowIntensity * 0.5],
        }}
        transition={{
          duration: durations.slow / 1000,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Bridge emergence effect */}
      {chiralParams.bridgeActive && (
        <BridgeEmergenceEffect
          size={size}
          intensity={chiralParams.bridgeIntensity}
          phaseAngle={resonance.phaseAngle}
        />
      )}

      {/* Core sigil */}
      <div className="relative z-10">
        <SigilAvatar
          seed={seed}
          primaryField={primaryField}
          heartState={heartState}
          biofieldState={biofieldState}
          size={size * 0.85}
          animate={animate}
        />
      </div>

      {/* Stability crystalline overlay */}
      {resonance.chiralStability > 0.7 && (
        <CrystallineOverlay size={size} stability={resonance.chiralStability} />
      )}
    </div>
  );
}

/**
 * SC Bridge emergence visual effect
 */
function BridgeEmergenceEffect({
  size,
  intensity,
  phaseAngle,
}: {
  size: number;
  intensity: number;
  phaseAngle: number;
}) {
  const { durations } = useGoldenTiming();

  // Generate bridge connection points
  const connectionPoints = useMemo(() => {
    const count = Math.floor(3 + intensity * 5); // 3-8 points
    const radius = size * 0.45;
    const cx = size / 2;
    const cy = size / 2;

    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + phaseAngle;
      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    });
  }, [size, intensity, phaseAngle]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <defs>
        <linearGradient id="bridgeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity={intensity * 0.5} />
          <stop offset="50%" stopColor="#a855f7" stopOpacity={intensity * 0.7} />
          <stop offset="100%" stopColor="#ff00ff" stopOpacity={intensity * 0.5} />
        </linearGradient>
      </defs>

      {/* Connection lines between points */}
      {connectionPoints.map((point, i) => {
        const nextPoint = connectionPoints[(i + 1) % connectionPoints.length];
        return (
          <motion.line
            key={i}
            x1={point.x}
            y1={point.y}
            x2={nextPoint.x}
            y2={nextPoint.y}
            stroke="url(#bridgeGlow)"
            strokeWidth={1}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: intensity * 0.6 }}
            transition={{
              duration: durations.normal / 1000,
              delay: i * 0.05,
            }}
          />
        );
      })}

      {/* Pulse points */}
      {connectionPoints.map((point, i) => (
        <motion.circle
          key={`pulse-${i}`}
          cx={point.x}
          cy={point.y}
          r={2}
          fill="#a855f7"
          animate={{
            r: [2, 3, 2],
            opacity: [intensity * 0.5, intensity, intensity * 0.5],
          }}
          transition={{
            duration: durations.slow / 1000,
            repeat: Infinity,
            delay: i * (durations.fast / 1000),
          }}
        />
      ))}
    </svg>
  );
}

/**
 * Crystalline overlay for high stability states
 */
function CrystallineOverlay({ size, stability }: { size: number; stability: number }) {
  const { durations } = useGoldenTiming();
  const intensity = (stability - 0.7) / 0.3; // 0-1 in crystalline range

  // Generate facet lines
  const facets = useMemo(() => {
    const count = 6;
    const cx = size / 2;
    const cy = size / 2;
    const innerR = size * 0.3;
    const outerR = size * 0.48;

    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        x1: cx + Math.cos(angle) * innerR,
        y1: cy + Math.sin(angle) * innerR,
        x2: cx + Math.cos(angle) * outerR,
        y2: cy + Math.sin(angle) * outerR,
      };
    });
  }, [size]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      {facets.map((facet, i) => (
        <motion.line
          key={i}
          x1={facet.x1}
          y1={facet.y1}
          x2={facet.x2}
          y2={facet.y2}
          stroke="rgba(168, 85, 247, 0.3)"
          strokeWidth={1}
          initial={{ opacity: 0 }}
          animate={{ opacity: intensity * 0.5 }}
          transition={{
            duration: durations.normal / 1000,
            delay: i * 0.1,
          }}
        />
      ))}
    </svg>
  );
}

/**
 * Chiral Sigil with editable controls
 */
interface ChiralSigilEditableProps extends ChiralSigilProps {
  onRegenerateSeed?: () => void;
  onFieldChange?: (field: PrimaryField) => void;
  onChiralToggle?: (enabled: boolean) => void;
}

export function ChiralSigilEditable({
  seed,
  primaryField = "aurora",
  size = 120,
  chiralEnabled = true,
  onRegenerateSeed,
  onFieldChange,
  onChiralToggle,
  ...props
}: ChiralSigilEditableProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <ChiralSigil
        seed={seed}
        primaryField={primaryField}
        size={size}
        chiralEnabled={chiralEnabled}
        {...props}
      />

      <div className="flex gap-2 flex-wrap justify-center">
        {onRegenerateSeed && (
          <button
            onClick={onRegenerateSeed}
            className="text-xs text-gray-400 hover:text-cyan-400 transition-colors px-2 py-1 rounded border border-white/10 hover:border-cyan-500/50"
          >
            regenerate sigil
          </button>
        )}
        {onChiralToggle && (
          <button
            onClick={() => onChiralToggle(!chiralEnabled)}
            className={`text-xs transition-colors px-2 py-1 rounded border ${
              chiralEnabled
                ? "text-purple-400 border-purple-500/50 hover:border-purple-500"
                : "text-gray-400 border-white/10 hover:border-white/30"
            }`}
          >
            {chiralEnabled ? "chiral on" : "chiral off"}
          </button>
        )}
      </div>
    </div>
  );
}
