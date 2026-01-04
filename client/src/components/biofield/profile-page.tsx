/**
 * BioField Profile Page
 * 
 * The complete multi-layer identity field interface.
 * Identity as a living field, integrating intention, behavior,
 * creation, rest, and—when permitted—physiological signal.
 */

import { motion } from "framer-motion";
import { useBiofieldProfile } from "@/hooks/use-biofield-profile";
import { IdentityCoreLayer } from "./identity-core-layer";
import { HeartStateLayer } from "./heart-state-layer";
import { BiofieldStateLayer } from "./biofield-state-layer";
import { ConsciousnessGraphLayer } from "./consciousness-graph-layer";
import { ArtifactsLayer } from "./artifacts-layer";
import type { HeartState, BiofieldState, ConsciousnessDomain } from "@shared/models/biofield-profile";

interface BioFieldProfilePageProps {
  className?: string;
}

export function BioFieldProfilePage({ className = "" }: BioFieldProfilePageProps) {
  const {
    profile,
    settings,
    isLoading,
    error,
    identityCore,
    updateIdentityCore,
    isUpdatingIdentityCore,
    currentHeartState,
    setHeartState,
    isSettingHeartState,
    currentBiofieldState,
    overrideBiofieldState,
    biofieldIntegration,
    regenerateSigil,
    consciousnessGraph,
    engageDomain,
    artifacts,
    revisitArtifact,
    updateSettings,
  } = useBiofieldProfile();

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <p className="text-red-400 mb-4">Unable to load profile field</p>
        <p className="text-gray-500 text-sm">The system will recover. Please try again.</p>
      </div>
    );
  }

  const handleHeartStateChange = async (state: HeartState) => {
    await setHeartState(state);
  };

  const handleBiofieldOverride = async (state: BiofieldState | null) => {
    await overrideBiofieldState(state);
  };

  const handleDomainEngage = async (domain: ConsciousnessDomain) => {
    await engageDomain(domain);
  };

  const handleSettingsChange = async (key: string, value: any) => {
    await updateSettings({ [key]: value });
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Prime Directive Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-white/5"
      >
        <p className="text-center text-sm text-gray-500 font-mono">
          Identity is emergent • Biometrics inform, never define • Agency overrides inference
        </p>
      </motion.div>

      {/* Layer 1: Identity Core */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <IdentityCoreLayer
          identityCore={identityCore}
          heartState={currentHeartState?.state as HeartState | undefined}
          biofieldState={currentBiofieldState?.state as BiofieldState | undefined}
          onUpdate={updateIdentityCore}
          onRegenerateSigil={regenerateSigil}
          isUpdating={isUpdatingIdentityCore}
        />
      </motion.div>

      {/* Layer 2: Heart State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <HeartStateLayer
          currentState={currentHeartState?.state as HeartState | undefined}
          isInferred={currentHeartState?.isInferred ?? false}
          confidence={currentHeartState?.confidence ?? 1}
          onStateChange={handleHeartStateChange}
          isChanging={isSettingHeartState}
          reduceMotion={settings?.reduceMotion ?? false}
        />
      </motion.div>

      {/* Layer 3: Biofield State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <BiofieldStateLayer
          currentState={currentBiofieldState}
          integration={biofieldIntegration}
          biofieldOptIn={settings?.biofieldOptIn ?? false}
          showOnProfile={settings?.showBiofieldOnProfile ?? false}
          onOptInChange={(value) => handleSettingsChange("biofieldOptIn", value)}
          onShowOnProfileChange={(value) => handleSettingsChange("showBiofieldOnProfile", value)}
          onOverride={handleBiofieldOverride}
        />
      </motion.div>

      {/* Layer 4: Consciousness Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <ConsciousnessGraphLayer
          nodes={consciousnessGraph.nodes}
          edges={consciousnessGraph.edges}
          onDomainEngage={handleDomainEngage}
        />
      </motion.div>

      {/* Layer 5: Artifacts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ArtifactsLayer
          artifacts={artifacts}
          onRevisit={revisitArtifact}
          autoFadeEnabled={settings?.artifactAutoFade ?? true}
          fadeDays={settings?.artifactFadeDays ?? 90}
        />
      </motion.div>

      {/* Footer Philosophy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pt-8 border-t border-white/5"
      >
        <p className="text-center text-xs text-gray-600 max-w-2xl mx-auto leading-relaxed">
          This profile exists for you, not the platform. No followers. No likes. No ranks.
          No comparative metrics. Your identity unfolds through interaction, pause, and reflection.
          Every profile represents a living human nervous system. We act accordingly.
        </p>
      </motion.div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-48 rounded-xl bg-white/5 animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </>
  );
}
