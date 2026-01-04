/**
 * Layer 3 — Biofield State
 * 
 * Physiological context that exists only if the user explicitly opts in.
 * All biometric data is treated as approximate, noisy, and context-dependent.
 * Never diagnose. Never score. Never rank. Never alarm.
 */

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  BIOFIELD_STATES, 
  type BiofieldState,
  type BiofieldStateRecord,
  type BiofieldIntegration,
} from "@shared/models/biofield-profile";

interface BiofieldStateLayerProps {
  currentState?: BiofieldStateRecord | null;
  integration?: BiofieldIntegration | null;
  biofieldOptIn: boolean;
  showOnProfile: boolean;
  onOptInChange: (value: boolean) => void;
  onShowOnProfileChange: (value: boolean) => void;
  onOverride: (state: BiofieldState | null) => Promise<any>;
  onPauseIntegration?: () => void;
  onDisconnectIntegration?: () => void;
}

export function BiofieldStateLayer({
  currentState,
  integration,
  biofieldOptIn,
  showOnProfile,
  onOptInChange,
  onShowOnProfileChange,
  onOverride,
  onPauseIntegration,
  onDisconnectIntegration,
}: BiofieldStateLayerProps) {
  const biofieldStates = Object.entries(BIOFIELD_STATES) as [BiofieldState, typeof BIOFIELD_STATES[BiofieldState]][];

  if (!biofieldOptIn) {
    return (
      <Card className="bg-black/40 border-white/10 backdrop-blur-xl p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-display font-semibold text-white">Biofield Layer</h3>
            <p className="text-sm text-gray-500">Physiological context integration</p>
          </div>

          <div className="p-6 rounded-xl border border-dashed border-white/20 bg-white/5 text-center space-y-4">
            <div className="text-4xl opacity-40">◌</div>
            <p className="text-gray-400 max-w-md mx-auto">
              This layer remains dormant. When activated, it may gently inform your experience 
              through signals from connected wearables—never defining, always contextual.
            </p>
            
            <div className="flex items-center justify-center gap-3 pt-2">
              <Switch
                checked={biofieldOptIn}
                onCheckedChange={onOptInChange}
                id="biofield-opt-in"
              />
              <label htmlFor="biofield-opt-in" className="text-sm text-gray-400 cursor-pointer">
                Awaken biofield layer
              </label>
            </div>
          </div>

          <div className="text-xs text-gray-600 space-y-1">
            <p>• All biometric data is approximate and context-dependent</p>
            <p>• You may pause, override, or disconnect at any time</p>
            <p>• No data is required for any Space Child functionality</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-xl p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-white">Biofield Layer</h3>
            <p className="text-sm text-gray-500">Physiological context • soft inference only</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Switch
              checked={biofieldOptIn}
              onCheckedChange={onOptInChange}
              id="biofield-active"
            />
          </div>
        </div>

        {/* Current State Display */}
        {currentState ? (
          <motion.div
            key={currentState.state}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative p-5 rounded-xl border border-white/10"
            style={{
              background: `linear-gradient(135deg, ${BIOFIELD_STATES[currentState.state as BiofieldState].color}10, transparent)`,
            }}
          >
            {/* Uncertainty indicator */}
            {currentState.uncertainty != null && currentState.uncertainty > 0.3 && (
              <div className="absolute top-3 right-3 text-xs text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                uncertain
              </div>
            )}

            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle, ${BIOFIELD_STATES[currentState.state as BiofieldState].color}40, transparent)`,
                }}
              >
                <div 
                  className="w-6 h-6 rounded-full animate-pulse"
                  style={{ backgroundColor: BIOFIELD_STATES[currentState.state as BiofieldState].color }}
                />
              </div>
              <div>
                <h4 className="text-lg font-display font-semibold text-white">
                  {BIOFIELD_STATES[currentState.state as BiofieldState].name}
                </h4>
                <p className="text-sm text-gray-400">
                  {BIOFIELD_STATES[currentState.state as BiofieldState].description}
                </p>
              </div>
            </div>

            {/* Override option */}
            {currentState.isOverridden && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-cyan-400">manually set</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOverride(null)}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  release override
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="p-5 rounded-xl border border-dashed border-white/10 text-center">
            <p className="text-gray-500 text-sm">
              {integration ? "Awaiting signal..." : "No integration connected"}
            </p>
          </div>
        )}

        {/* Manual State Selection */}
        <div className="space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Override with subjective state
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {biofieldStates.map(([state, config]) => (
              <button
                key={state}
                onClick={() => onOverride(state)}
                className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                  currentState?.state === state && currentState?.isOverridden
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-white/10 hover:border-white/30 bg-white/5"
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-gray-300">{config.name}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 text-center">
            Your subjective experience always supersedes sensed data
          </p>
        </div>

        {/* Integration Status */}
        {integration && (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${integration.isActive && !integration.isPaused ? "bg-green-500" : "bg-gray-500"}`} />
                <span className="text-sm text-gray-300">{integration.provider}</span>
              </div>
              {integration.lastSyncAt && (
                <span className="text-xs text-gray-500">
                  last sync: {new Date(integration.lastSyncAt).toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPauseIntegration}
                className="text-xs text-gray-400 hover:text-white"
              >
                {integration.isPaused ? "Resume" : "Pause"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDisconnectIntegration}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}

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

/**
 * Compact Biofield Indicator
 * Subtle ambient display for headers
 */
export function BiofieldIndicator({
  state,
  uncertainty,
}: {
  state?: BiofieldState;
  uncertainty?: number;
}) {
  if (!state) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: uncertainty && uncertainty > 0.5 ? 0.5 : 0.8 }}
      className="flex items-center gap-1.5"
      title={BIOFIELD_STATES[state].description}
    >
      <div 
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: BIOFIELD_STATES[state].color }}
      />
      <span className="text-xs text-gray-500">{BIOFIELD_STATES[state].name}</span>
    </motion.div>
  );
}
