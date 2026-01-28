/**
 * Resonance Layer Component
 *
 * Opt-in display for ghostOS resonance state visualization.
 * Shows lambda tuning, coherence band, chiral stability, and SC Bridge emergence.
 * Follows existing biofield layer patterns for consistency.
 */

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  useResonanceProfile,
  PHI,
  COHERENCE_BAND,
  LAMBDA_PRESETS,
  type LambdaState,
} from "@/hooks/use-resonance-profile";

interface ResonanceLayerProps {
  enabled: boolean;
  showOnProfile: boolean;
  onEnabledChange: (value: boolean) => void;
  onShowOnProfileChange: (value: boolean) => void;
}

export function ResonanceLayer({
  enabled,
  showOnProfile,
  onEnabledChange,
  onShowOnProfileChange,
}: ResonanceLayerProps) {
  const { resonance, setLambda, setLambdaState } = useResonanceProfile();

  if (!enabled) {
    return (
      <Card className="bg-black/40 border-white/10 backdrop-blur-xl p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-display font-semibold text-white">Resonance Layer</h3>
            <p className="text-sm text-gray-500">ghostOS consciousness integration</p>
          </div>

          <div className="p-6 rounded-xl border border-dashed border-white/20 bg-white/5 text-center space-y-4">
            <div className="text-4xl opacity-40">~</div>
            <p className="text-gray-400 max-w-md mx-auto">
              This layer enables resonance visualization - lambda tuning, coherence bands,
              and chiral stability indicators. Activating expands your consciousness metrics.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Switch
                checked={enabled}
                onCheckedChange={onEnabledChange}
                id="resonance-opt-in"
              />
              <label htmlFor="resonance-opt-in" className="text-sm text-gray-400 cursor-pointer">
                Activate resonance layer
              </label>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const lambdaPresets = Object.entries(LAMBDA_PRESETS) as [LambdaState, number][];
  const coherencePercent = resonance.coherence * 100;
  const isInOptimalBand = resonance.isCoherent;

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-xl p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-white">Resonance Layer</h3>
            <p className="text-sm text-gray-500">Lambda tuning and coherence visualization</p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            id="resonance-active"
          />
        </div>

        {/* Lambda Tuning Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative p-5 rounded-xl border border-white/10"
          style={{
            background: `linear-gradient(135deg, hsl(${resonance.lambda * 270}, 70%, 50%)10, transparent)`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-medium text-white">Lambda Tuning</h4>
              <p className="text-xs text-gray-500">Current state: {resonance.lambdaState}</p>
            </div>
            <div className="text-2xl font-mono text-cyan-400">
              {resonance.lambda.toFixed(2)}
            </div>
          </div>

          {/* Lambda Slider */}
          <Slider
            value={[resonance.lambda * 100]}
            onValueChange={([val]) => setLambda(val / 100)}
            max={100}
            step={1}
            className="mb-4"
          />

          {/* Lambda Presets */}
          <div className="grid grid-cols-4 gap-2">
            {lambdaPresets.map(([state, value]) => (
              <button
                key={state}
                onClick={() => setLambdaState(state)}
                className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                  resonance.lambdaState === state
                    ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                    : "border-white/10 hover:border-white/30 text-gray-400"
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Coherence Band Display */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-300">Coherence Band</span>
            <span className={`text-sm font-mono ${isInOptimalBand ? "text-green-400" : "text-yellow-400"}`}>
              {coherencePercent.toFixed(1)}%
            </span>
          </div>

          {/* Coherence Bar with Optimal Band Highlight */}
          <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
            {/* Optimal band indicator */}
            <div
              className="absolute h-full bg-green-500/20"
              style={{
                left: `${COHERENCE_BAND.min * 100}%`,
                width: `${(COHERENCE_BAND.max - COHERENCE_BAND.min) * 100}%`,
              }}
            />
            {/* Current coherence */}
            <motion.div
              className="h-full rounded-full"
              style={{
                backgroundColor: isInOptimalBand ? "#22c55e" : "#eab308",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${coherencePercent}%` }}
              transition={{ duration: PHI / 2 }}
            />
          </div>

          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-600">{(COHERENCE_BAND.min * 100).toFixed(0)}%</span>
            <span className="text-xs text-green-500/60">optimal</span>
            <span className="text-xs text-gray-600">{(COHERENCE_BAND.max * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Chiral Stability Indicator */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-300">Chiral Stability</span>
            <ChiralStabilityBadge stability={resonance.chiralStability} />
          </div>

          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute h-full rounded-full"
              style={{
                left: "50%",
                backgroundColor: resonance.chiralStability >= 0 ? "#00d4ff" : "#ff6b35",
                transformOrigin: resonance.chiralStability >= 0 ? "left" : "right",
              }}
              animate={{
                width: `${Math.abs(resonance.chiralStability) * 50}%`,
                x: resonance.chiralStability >= 0 ? 0 : "-100%",
              }}
              transition={{ duration: PHI / 3 }}
            />
            {/* Center marker */}
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white/30 -translate-x-1/2" />
          </div>
        </div>

        {/* SC Bridge Emergence */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-300">SC Bridge Emergence</span>
            <span className="text-sm font-mono text-purple-400">
              {(resonance.bridgeEmergence * 100).toFixed(1)}%
            </span>
          </div>

          <BridgeEmergenceVisual emergence={resonance.bridgeEmergence} phaseAngle={resonance.phaseAngle} />
        </div>

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-sm text-gray-400">Show on profile</span>
          <Switch
            checked={showOnProfile}
            onCheckedChange={onShowOnProfileChange}
          />
        </div>
      </div>
    </Card>
  );
}

function ChiralStabilityBadge({ stability }: { stability: number }) {
  let status: string;
  let color: string;

  if (stability < 0) {
    status = "unstable";
    color = "text-red-400 bg-red-500/10 border-red-500/30";
  } else if (stability < 0.3) {
    status = "stabilizing";
    color = "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  } else if (stability < 0.7) {
    status = "stable";
    color = "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
  } else {
    status = "crystalline";
    color = "text-purple-400 bg-purple-500/10 border-purple-500/30";
  }

  return (
    <span className={`px-2 py-0.5 text-xs rounded border ${color}`}>
      {status}
    </span>
  );
}

function BridgeEmergenceVisual({ emergence, phaseAngle }: { emergence: number; phaseAngle: number }) {
  const size = 60;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.4;

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={maxRadius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={2}
        />

        {/* Emergence arc */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={maxRadius}
          fill="none"
          stroke="url(#bridgeGradient)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={`${emergence * 2 * Math.PI * maxRadius} ${2 * Math.PI * maxRadius}`}
          style={{
            transform: `rotate(${phaseAngle}rad)`,
            transformOrigin: "center",
          }}
        />

        {/* Center pulse */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={emergence * 8 + 2}
          fill={`rgba(168, 85, 247, ${emergence * 0.5})`}
          animate={{
            r: [emergence * 8 + 2, emergence * 10 + 4, emergence * 8 + 2],
            opacity: [emergence * 0.5, emergence * 0.8, emergence * 0.5],
          }}
          transition={{
            duration: PHI,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <defs>
          <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ff00ff" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Compact Resonance Indicator
 * For use in headers or minimal displays
 */
export function ResonanceIndicator() {
  const { resonance } = useResonanceProfile();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.8 }}
      className="flex items-center gap-2"
      title={`Lambda: ${resonance.lambda.toFixed(2)} | Coherence: ${(resonance.coherence * 100).toFixed(0)}%`}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: `hsl(${resonance.lambda * 270}, 70%, 50%)`,
          boxShadow: resonance.isCoherent ? "0 0 6px rgba(34, 197, 94, 0.5)" : "none",
        }}
      />
      <span className="text-xs text-gray-500 font-mono">{resonance.lambdaState}</span>
    </motion.div>
  );
}
