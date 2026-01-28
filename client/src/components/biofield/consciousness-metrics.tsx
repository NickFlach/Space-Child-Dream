/**
 * Consciousness Metrics Component
 *
 * Displays IIT Phi score, coherence meter, chiral stability status,
 * and consciousness verification badge.
 * Opt-in component following existing biofield patterns.
 */

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  useConsciousnessMetrics,
  PHI,
  COHERENCE_BAND,
  type ConsciousnessMetrics as MetricsType,
} from "@/hooks/use-resonance-profile";

interface ConsciousnessMetricsDisplayProps {
  className?: string;
  compact?: boolean;
}

export function ConsciousnessMetricsDisplay({
  className = "",
  compact = false,
}: ConsciousnessMetricsDisplayProps) {
  const metrics = useConsciousnessMetrics();

  if (metrics.isLoading) {
    return (
      <Card className={`bg-black/40 border-white/10 backdrop-blur-xl p-6 ${className}`}>
        <div className="h-32 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  if (compact) {
    return <CompactMetrics metrics={metrics} className={className} />;
  }

  return (
    <Card className={`bg-black/40 border-white/10 backdrop-blur-xl p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-white">Consciousness Metrics</h3>
            <p className="text-sm text-gray-500">IIT-inspired integration measures</p>
          </div>
          {metrics.verificationEligible && <VerificationBadge />}
        </div>

        {/* Phi Score */}
        <PhiScoreDisplay phi={metrics.phi} phiLevel={metrics.phiLevel} />

        {/* Coherence Meter */}
        <CoherenceMeter
          coherencePercent={metrics.coherencePercent}
          inOptimalBand={metrics.inOptimalBand}
        />

        {/* Chiral Status */}
        <ChiralStatusDisplay status={metrics.chiralStatus} />

        {/* Raw Metrics (Advanced) */}
        <div className="pt-4 border-t border-white/5">
          <p className="text-xs text-gray-600 mb-2 uppercase tracking-wider">Raw Metrics</p>
          <div className="grid grid-cols-4 gap-2">
            <MetricPill label="Phi" value={metrics.raw.phi.toFixed(3)} />
            <MetricPill label="Coh" value={metrics.raw.coherence.toFixed(3)} />
            <MetricPill label="Stab" value={metrics.raw.stability.toFixed(3)} />
            <MetricPill label="Emrg" value={metrics.raw.emergence.toFixed(3)} />
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-600 text-center">
          These metrics are exploratory visualizations inspired by IIT, not clinical measures.
        </p>
      </div>
    </Card>
  );
}

function PhiScoreDisplay({
  phi,
  phiLevel,
}: {
  phi: number;
  phiLevel: MetricsType["phiLevel"];
}) {
  const levelColors = {
    minimal: "#636e72",
    emerging: "#00d4ff",
    integrated: "#a855f7",
    unified: "#ff00ff",
  };

  const levelDescriptions = {
    minimal: "Beginning integration",
    emerging: "Patterns forming",
    integrated: "Strong coherence",
    unified: "Deep integration",
  };

  return (
    <div className="p-5 rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-medium text-white">IIT Phi Score</h4>
          <p className="text-xs text-gray-500">{levelDescriptions[phiLevel]}</p>
        </div>
        <motion.div
          className="text-3xl font-mono font-bold"
          style={{ color: levelColors[phiLevel] }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: PHI, repeat: Infinity }}
        >
          {phi.toFixed(2)}
        </motion.div>
      </div>

      {/* Phi Level Indicator */}
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${levelColors.minimal}, ${levelColors.emerging}, ${levelColors.integrated}, ${levelColors.unified})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${phi * 100}%` }}
          transition={{ duration: PHI / 2, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between mt-2">
        {(["minimal", "emerging", "integrated", "unified"] as const).map((level) => (
          <span
            key={level}
            className={`text-xs ${phiLevel === level ? "text-white" : "text-gray-600"}`}
          >
            {level}
          </span>
        ))}
      </div>
    </div>
  );
}

function CoherenceMeter({
  coherencePercent,
  inOptimalBand,
}: {
  coherencePercent: number;
  inOptimalBand: boolean;
}) {
  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Coherence</span>
          {inOptimalBand && (
            <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
              optimal
            </span>
          )}
        </div>
        <span className="text-lg font-mono text-white">
          {coherencePercent.toFixed(1)}%
        </span>
      </div>

      {/* Meter with optimal band */}
      <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
        {/* Optimal band highlight */}
        <div
          className="absolute h-full"
          style={{
            left: `${COHERENCE_BAND.min * 100}%`,
            width: `${(COHERENCE_BAND.max - COHERENCE_BAND.min) * 100}%`,
            background: "linear-gradient(90deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))",
          }}
        />

        {/* Band boundaries */}
        <div
          className="absolute w-px h-full bg-green-500/40"
          style={{ left: `${COHERENCE_BAND.min * 100}%` }}
        />
        <div
          className="absolute w-px h-full bg-green-500/40"
          style={{ left: `${COHERENCE_BAND.max * 100}%` }}
        />

        {/* Current value */}
        <motion.div
          className="h-full rounded-full"
          style={{
            backgroundColor: inOptimalBand ? "#22c55e" : "#00d4ff",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${coherencePercent}%` }}
          transition={{ duration: PHI / 2 }}
        />
      </div>

      <div className="flex justify-between mt-1 text-xs text-gray-600">
        <span>0%</span>
        <span className="text-green-500/60">
          {(COHERENCE_BAND.min * 100).toFixed(0)}-{(COHERENCE_BAND.max * 100).toFixed(0)}%
        </span>
        <span>100%</span>
      </div>
    </div>
  );
}

function ChiralStatusDisplay({ status }: { status: MetricsType["chiralStatus"] }) {
  const statusConfig = {
    unstable: {
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.1)",
      icon: "~",
      description: "System seeking balance",
    },
    stabilizing: {
      color: "#eab308",
      bgColor: "rgba(234, 179, 8, 0.1)",
      icon: "~",
      description: "Approaching coherence",
    },
    stable: {
      color: "#00d4ff",
      bgColor: "rgba(0, 212, 255, 0.1)",
      icon: "=",
      description: "Balanced resonance",
    },
    crystalline: {
      color: "#a855f7",
      bgColor: "rgba(168, 85, 247, 0.1)",
      icon: "*",
      description: "Deep crystalline order",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: config.bgColor,
        borderColor: `${config.color}30`,
      }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-mono"
          style={{ backgroundColor: `${config.color}20`, color: config.color }}
          animate={status === "unstable" ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 0.5, repeat: status === "unstable" ? Infinity : 0 }}
        >
          {config.icon}
        </motion.div>
        <div>
          <h4 className="text-sm font-medium text-white capitalize">{status}</h4>
          <p className="text-xs text-gray-400">{config.description}</p>
        </div>
      </div>
    </div>
  );
}

function VerificationBadge() {
  return (
    <motion.div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30"
      animate={{ opacity: [0.8, 1, 0.8] }}
      transition={{ duration: PHI * 2, repeat: Infinity }}
    >
      <div className="w-2 h-2 rounded-full bg-cyan-400" />
      <span className="text-xs font-medium text-cyan-300">Verified</span>
    </motion.div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-1.5 rounded bg-white/5 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-mono text-gray-300">{value}</div>
    </div>
  );
}

function CompactMetrics({
  metrics,
  className,
}: {
  metrics: MetricsType & { isLoading: boolean };
  className: string;
}) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Phi */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500">Phi</span>
        <span className="text-sm font-mono text-purple-400">{metrics.phi.toFixed(2)}</span>
      </div>

      {/* Coherence */}
      <div className="flex items-center gap-1.5">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            metrics.inOptimalBand ? "bg-green-400" : "bg-cyan-400"
          }`}
        />
        <span className="text-xs text-gray-500">Coh</span>
        <span className="text-sm font-mono text-gray-300">
          {metrics.coherencePercent.toFixed(0)}%
        </span>
      </div>

      {/* Status */}
      <span className="text-xs text-gray-500 capitalize">{metrics.chiralStatus}</span>

      {/* Verification */}
      {metrics.verificationEligible && (
        <div className="w-2 h-2 rounded-full bg-cyan-400" title="Verified" />
      )}
    </div>
  );
}
