/**
 * Layer 2 — Heart State
 * 
 * Represents how the user currently inhabits Space Child.
 * Live, subjective, never gamified.
 * One primary state at a time.
 */

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { HEART_STATES, type HeartState } from "@shared/models/biofield-profile";

interface HeartStateLayerProps {
  currentState?: HeartState;
  isInferred?: boolean;
  confidence?: number;
  onStateChange: (state: HeartState) => Promise<any>;
  isChanging?: boolean;
  reduceMotion?: boolean;
}

export function HeartStateLayer({
  currentState,
  isInferred,
  confidence,
  onStateChange,
  isChanging,
  reduceMotion,
}: HeartStateLayerProps) {
  const heartStates = Object.entries(HEART_STATES) as [HeartState, typeof HEART_STATES[HeartState]][];

  const getTempoStyle = (tempo: string) => {
    switch (tempo) {
      case "slow": return { animationDuration: "6s" };
      case "calm": return { animationDuration: "4s" };
      case "steady": return { animationDuration: "3s" };
      case "focused": return { animationDuration: "2.5s" };
      case "curious": return { animationDuration: "2s" };
      case "deliberate": return { animationDuration: "3.5s" };
      case "energetic": return { animationDuration: "1.5s" };
      default: return { animationDuration: "3s" };
    }
  };

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-xl p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-white">Heart State</h3>
            <p className="text-sm text-gray-500">How you currently inhabit this space</p>
          </div>
          
          {currentState && isInferred && (
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500/50 animate-pulse" />
              softly inferred
              {confidence !== undefined && confidence < 0.8 && (
                <span className="text-gray-600">({Math.round(confidence * 100)}%)</span>
              )}
            </div>
          )}
        </div>

        {/* Current State Display */}
        {currentState && (
          <motion.div
            key={currentState}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20"
          >
            <motion.span 
              className="text-4xl"
              animate={reduceMotion ? {} : { 
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                repeat: Infinity,
                ...getTempoStyle(HEART_STATES[currentState].tempo),
              }}
            >
              {HEART_STATES[currentState].icon}
            </motion.span>
            <div>
              <h4 className="text-xl font-display font-bold text-white">
                {HEART_STATES[currentState].name}
              </h4>
              <p className="text-sm text-gray-400">
                {HEART_STATES[currentState].description}
              </p>
            </div>
          </motion.div>
        )}

        {/* State Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {heartStates.map(([state, config]) => (
            <motion.button
              key={state}
              onClick={() => onStateChange(state)}
              disabled={isChanging || state === currentState}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                state === currentState
                  ? "border-cyan-500 bg-cyan-500/10 cursor-default"
                  : "border-white/10 hover:border-white/30 bg-white/5 cursor-pointer"
              } ${isChanging ? "opacity-50 cursor-wait" : ""}`}
            >
              <span className="text-2xl">{config.icon}</span>
              <span className="text-xs text-gray-300">{config.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-600 text-center">
          States inform UI tempo and system behavior. They are never scored, ranked, or gamified.
        </p>
      </div>
    </Card>
  );
}

/**
 * Compact Heart State Display
 * For use in headers and minimal contexts
 */
export function HeartStateCompact({
  state,
  showLabel = true,
}: {
  state?: HeartState;
  showLabel?: boolean;
}) {
  if (!state) return null;

  const config = HEART_STATES[state];

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-lg">{config.icon}</span>
      {showLabel && (
        <span className="text-gray-400">{config.name}</span>
      )}
    </div>
  );
}
