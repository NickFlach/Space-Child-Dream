/**
 * Sigil Avatar Component
 * 
 * Procedural, abstract avatar that represents becoming, not appearance.
 * Responds to heart state and biofield context with subtle animation.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { generateSigil, generateSigilSeed, getTempoMultiplier, type SigilConfig } from "@/lib/sigil-generator";
import type { PrimaryField, HeartState, BiofieldState } from "@shared/models/biofield-profile";
import { HEART_STATES } from "@shared/models/biofield-profile";

interface SigilAvatarProps {
  seed?: string;
  primaryField?: PrimaryField;
  heartState?: HeartState;
  biofieldState?: BiofieldState;
  size?: number;
  animate?: boolean;
  className?: string;
  onClick?: () => void;
}

export function SigilAvatar({
  seed,
  primaryField = "aurora",
  heartState,
  biofieldState,
  size = 80,
  animate = true,
  className = "",
  onClick,
}: SigilAvatarProps) {
  const effectiveSeed = seed || generateSigilSeed();
  
  const tempo = heartState ? HEART_STATES[heartState].tempo : "steady";
  const tempoMultiplier = getTempoMultiplier(tempo);
  
  const sigil = useMemo(() => {
    return generateSigil({
      seed: effectiveSeed,
      primaryField,
      size: 200,
      animate,
      heartStateTempo: tempo as any,
    });
  }, [effectiveSeed, primaryField, tempo, animate]);

  const rotationDuration = 60 / tempoMultiplier;
  const pulseDuration = 4 / tempoMultiplier;
  
  const biofieldOpacity = biofieldState === "depleted" ? 0.5 : 
                          biofieldState === "charged" ? 1.0 : 
                          biofieldState === "focused" ? 0.9 : 0.75;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: `radial-gradient(circle, ${sigil.paths[0]?.stroke || "#00ff88"}40 0%, transparent 70%)`,
        }}
        animate={animate ? {
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        } : undefined}
        transition={{
          duration: pulseDuration * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Main sigil SVG */}
      <motion.svg
        viewBox={sigil.viewBox}
        width={size}
        height={size}
        style={{ opacity: biofieldOpacity }}
        animate={animate ? {
          rotate: [0, 360],
        } : undefined}
        transition={{
          duration: rotationDuration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {sigil.paths.map((path, i) => (
          <motion.path
            key={i}
            d={path.d}
            fill={path.fill || "none"}
            stroke={path.stroke || "none"}
            strokeWidth={path.strokeWidth || 1}
            opacity={path.opacity || 1}
            animate={animate && i < 3 ? {
              opacity: [(path.opacity || 1) * 0.8, path.opacity || 1, (path.opacity || 1) * 0.8],
            } : undefined}
            transition={{
              duration: pulseDuration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.svg>
    </motion.div>
  );
}

interface SigilAvatarEditableProps extends SigilAvatarProps {
  onRegenerateSeed?: () => void;
  onFieldChange?: (field: PrimaryField) => void;
}

export function SigilAvatarEditable({
  seed,
  primaryField = "aurora",
  size = 120,
  onRegenerateSeed,
  onFieldChange,
  ...props
}: SigilAvatarEditableProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <SigilAvatar
        seed={seed}
        primaryField={primaryField}
        size={size}
        {...props}
      />
      
      {(onRegenerateSeed || onFieldChange) && (
        <div className="flex gap-2">
          {onRegenerateSeed && (
            <button
              onClick={onRegenerateSeed}
              className="text-xs text-gray-400 hover:text-cyan-400 transition-colors px-2 py-1 rounded border border-white/10 hover:border-cyan-500/50"
            >
              regenerate sigil
            </button>
          )}
        </div>
      )}
    </div>
  );
}
