/**
 * Layer 5 — Artifacts
 * 
 * Artifacts are not posts. They are intentional crystallizations.
 * Each artifact carries origin context and fades gently when not revisited.
 * They never disappear without consent.
 */

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HEART_STATES,
  BIOFIELD_STATES,
  CONSCIOUSNESS_DOMAINS,
  VISIBILITY_STATES,
  type Artifact,
  type HeartState,
  type BiofieldState,
  type ConsciousnessDomain,
  type VisibilityState,
} from "@shared/models/biofield-profile";

interface ArtifactsLayerProps {
  artifacts: Artifact[];
  onRevisit: (artifactId: number) => Promise<any>;
  onCrystallize?: () => void;
  autoFadeEnabled?: boolean;
  fadeDays?: number;
}

export function ArtifactsLayer({
  artifacts,
  onRevisit,
  onCrystallize,
  autoFadeEnabled = true,
  fadeDays = 90,
}: ArtifactsLayerProps) {
  // Sort artifacts by crystallization date, most recent first
  const sortedArtifacts = useMemo(() => {
    return [...artifacts].sort((a, b) => {
      const dateA = new Date(a.crystallizedAt).getTime();
      const dateB = new Date(b.crystallizedAt).getTime();
      return dateB - dateA;
    });
  }, [artifacts]);

  // Calculate fade level based on last revisit
  const getDisplayFadeLevel = (artifact: Artifact): number => {
    if (!autoFadeEnabled) return 1;
    
    const lastVisit = artifact.lastRevisitedAt 
      ? new Date(artifact.lastRevisitedAt).getTime()
      : new Date(artifact.crystallizedAt).getTime();
    
    const now = Date.now();
    const daysSinceVisit = (now - lastVisit) / (1000 * 60 * 60 * 24);
    const fadeProgress = Math.min(1, daysSinceVisit / fadeDays);
    
    return Math.max(0.3, 1 - fadeProgress * 0.7);
  };

  const getArtifactTypeIcon = (type: string): string => {
    switch (type) {
      case "creation": return "✧";
      case "learning": return "◈";
      case "purchase": return "◇";
      case "investment": return "◆";
      case "experiment": return "⬡";
      case "build": return "⬢";
      default: return "○";
    }
  };

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-xl p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-white">Artifacts</h3>
            <p className="text-sm text-gray-500">Intentional crystallizations of moments</p>
          </div>
          
          {onCrystallize && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCrystallize}
              className="border-white/20 text-gray-300 hover:text-white"
            >
              Crystallize New
            </Button>
          )}
        </div>

        {/* Artifacts Grid */}
        {sortedArtifacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {sortedArtifacts.map((artifact, index) => {
                const fadeLevel = getDisplayFadeLevel(artifact);
                const originHeartState = artifact.originHeartState as HeartState | undefined;
                const originBiofieldState = artifact.originBiofieldState as BiofieldState | undefined;
                const domains = (artifact.domains || []) as ConsciousnessDomain[];
                const visibility = artifact.visibilityState as VisibilityState;

                return (
                  <motion.div
                    key={artifact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: fadeLevel, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div 
                      className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 transition-all cursor-pointer h-full"
                      onClick={() => onRevisit(artifact.id)}
                    >
                      {/* Type Icon & Visibility */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl opacity-70">
                          {getArtifactTypeIcon(artifact.type)}
                        </span>
                        <span className="text-xs text-gray-600 capitalize">
                          {visibility}
                        </span>
                      </div>

                      {/* Title */}
                      {artifact.title && (
                        <h4 className="text-white font-medium mb-2 line-clamp-2">
                          {artifact.title}
                        </h4>
                      )}

                      {/* Type & Date */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <span className="capitalize">{artifact.type}</span>
                        <span>•</span>
                        <span>{new Date(artifact.crystallizedAt).toLocaleDateString()}</span>
                      </div>

                      {/* Origin Context */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {originHeartState && HEART_STATES[originHeartState] && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-xs text-gray-400">
                            <span>{HEART_STATES[originHeartState].icon}</span>
                            {HEART_STATES[originHeartState].name}
                          </span>
                        )}
                        
                        {originBiofieldState && BIOFIELD_STATES[originBiofieldState] && (
                          <span 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor: `${BIOFIELD_STATES[originBiofieldState].color}20`,
                              color: BIOFIELD_STATES[originBiofieldState].color,
                            }}
                          >
                            {BIOFIELD_STATES[originBiofieldState].name}
                          </span>
                        )}
                      </div>

                      {/* Domain Tags */}
                      {domains.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {domains.map(domain => {
                            const config = CONSCIOUSNESS_DOMAINS[domain];
                            if (!config) return null;
                            return (
                              <span
                                key={domain}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: `${config.color}15`,
                                  color: config.color,
                                }}
                              >
                                {config.name}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Fade indicator */}
                      {fadeLevel < 0.8 && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <p className="text-xs text-gray-600">
                            gently fading • click to revisit
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="p-8 rounded-xl border border-dashed border-white/10 text-center">
            <div className="text-4xl opacity-30 mb-4">◌</div>
            <p className="text-gray-500 mb-4">
              No artifacts crystallized yet
            </p>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              Artifacts emerge from meaningful moments—creations, learnings, purchases, 
              investments, experiments, and builds. They are not posts. They are 
              intentional crystallizations.
            </p>
          </div>
        )}

        {/* Auto-fade notice */}
        {autoFadeEnabled && artifacts.length > 0 && (
          <p className="text-xs text-gray-600 text-center">
            Artifacts fade gently after {fadeDays} days without revisit. They never disappear without consent.
          </p>
        )}
      </div>
    </Card>
  );
}

/**
 * Compact Artifact Count
 * Simple count for headers and summaries
 */
export function ArtifactCount({
  count,
  recentCount,
}: {
  count: number;
  recentCount?: number;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <span>{count} artifact{count !== 1 ? "s" : ""}</span>
      {recentCount !== undefined && recentCount > 0 && (
        <span className="text-cyan-400">+{recentCount} recent</span>
      )}
    </div>
  );
}
