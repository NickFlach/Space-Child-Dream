/**
 * Biofield Profile Hook
 * 
 * Manages the multi-layer identity field for Space Child Profile v2.
 * Handles state for all five layers plus biofield integrations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import type {
  IdentityCore,
  HeartState,
  HeartStateRecord,
  BiofieldState,
  BiofieldStateRecord,
  BiofieldIntegration,
  ConsciousnessNode,
  ConsciousnessEdge,
  Artifact,
  ProfileSettings,
  PrimaryField,
  VisibilityState,
  BioFieldProfile,
} from "@shared/models/biofield-profile";

// API Functions
async function fetchProfile(accessToken: string): Promise<BioFieldProfile> {
  const response = await fetch("/api/profile/biofield", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

async function fetchSettings(accessToken: string): Promise<ProfileSettings | null> {
  const response = await fetch("/api/profile/settings", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  return response.json();
}

async function updateIdentityCore(
  accessToken: string,
  data: Partial<IdentityCore>
): Promise<IdentityCore> {
  const response = await fetch("/api/profile/identity-core", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update identity core");
  return response.json();
}

async function setHeartState(
  accessToken: string,
  state: HeartState
): Promise<HeartStateRecord> {
  const response = await fetch("/api/profile/heart-state", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ state }),
  });
  if (!response.ok) throw new Error("Failed to set heart state");
  return response.json();
}

async function overrideBiofieldState(
  accessToken: string,
  state: BiofieldState | null
): Promise<void> {
  const response = await fetch("/api/profile/biofield-state/override", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ state }),
  });
  if (!response.ok) throw new Error("Failed to override biofield state");
}

async function updateSettings(
  accessToken: string,
  data: Partial<ProfileSettings>
): Promise<ProfileSettings> {
  const response = await fetch("/api/profile/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update settings");
  return response.json();
}

async function regenerateSigil(accessToken: string): Promise<{ seed: string }> {
  const response = await fetch("/api/profile/sigil/regenerate", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Failed to regenerate sigil");
  return response.json();
}

async function crystallizeArtifact(
  accessToken: string,
  data: {
    type: string;
    title?: string;
    content?: Record<string, any>;
    domains?: string[];
  }
): Promise<Artifact> {
  const response = await fetch("/api/profile/artifacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to crystallize artifact");
  return response.json();
}

async function revisitArtifact(
  accessToken: string,
  artifactId: number
): Promise<void> {
  const response = await fetch(`/api/profile/artifacts/${artifactId}/revisit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Failed to revisit artifact");
}

async function engageDomain(
  accessToken: string,
  domain: string
): Promise<void> {
  const response = await fetch("/api/profile/consciousness/engage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ domain }),
  });
  if (!response.ok) throw new Error("Failed to engage domain");
}

export function useBiofieldProfile() {
  const { accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch complete profile
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery<BioFieldProfile>({
    queryKey: ["biofield-profile", accessToken],
    queryFn: () => fetchProfile(accessToken!),
    enabled: isAuthenticated && !!accessToken,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Fetch settings
  const {
    data: settings,
    isLoading: isLoadingSettings,
  } = useQuery<ProfileSettings | null>({
    queryKey: ["profile-settings", accessToken],
    queryFn: () => fetchSettings(accessToken!),
    enabled: isAuthenticated && !!accessToken,
    staleTime: 1000 * 60 * 5,
  });

  // Mutations
  const updateIdentityCoreMutation = useMutation({
    mutationFn: (data: Partial<IdentityCore>) => 
      updateIdentityCore(accessToken!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biofield-profile"] });
    },
  });

  const setHeartStateMutation = useMutation({
    mutationFn: (state: HeartState) => setHeartState(accessToken!, state),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biofield-profile"] });
    },
  });

  const overrideBiofieldMutation = useMutation({
    mutationFn: (state: BiofieldState | null) => 
      overrideBiofieldState(accessToken!, state),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biofield-profile"] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<ProfileSettings>) => 
      updateSettings(accessToken!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-settings"] });
    },
  });

  const regenerateSigilMutation = useMutation({
    mutationFn: () => regenerateSigil(accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biofield-profile"] });
    },
  });

  const crystallizeArtifactMutation = useMutation({
    mutationFn: (data: Parameters<typeof crystallizeArtifact>[1]) =>
      crystallizeArtifact(accessToken!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biofield-profile"] });
    },
  });

  const revisitArtifactMutation = useMutation({
    mutationFn: (artifactId: number) => revisitArtifact(accessToken!, artifactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biofield-profile"] });
    },
  });

  const engageDomainMutation = useMutation({
    mutationFn: (domain: string) => engageDomain(accessToken!, domain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biofield-profile"] });
    },
  });

  return {
    // Data
    profile,
    settings,
    isLoading: isLoadingProfile || isLoadingSettings,
    error: profileError,

    // Identity Core
    identityCore: profile?.identityCore || null,
    updateIdentityCore: updateIdentityCoreMutation.mutateAsync,
    isUpdatingIdentityCore: updateIdentityCoreMutation.isPending,

    // Heart State
    currentHeartState: profile?.currentHeartState,
    setHeartState: setHeartStateMutation.mutateAsync,
    isSettingHeartState: setHeartStateMutation.isPending,

    // Biofield State
    currentBiofieldState: profile?.currentBiofieldState,
    overrideBiofieldState: overrideBiofieldMutation.mutateAsync,
    biofieldIntegration: profile?.biofieldIntegration,

    // Sigil
    regenerateSigil: regenerateSigilMutation.mutateAsync,
    isRegeneratingSigil: regenerateSigilMutation.isPending,

    // Consciousness Graph
    consciousnessGraph: profile?.consciousnessGraph || { nodes: [], edges: [] },
    engageDomain: engageDomainMutation.mutateAsync,

    // Artifacts
    artifacts: profile?.artifacts || [],
    crystallizeArtifact: crystallizeArtifactMutation.mutateAsync,
    revisitArtifact: revisitArtifactMutation.mutateAsync,

    // Settings
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdatingSettings: updateSettingsMutation.isPending,
  };
}

// Utility hook for heart state display
export function useHeartStateDisplay(state?: HeartState) {
  if (!state) return null;
  
  const { HEART_STATES } = require("@shared/models/biofield-profile");
  return HEART_STATES[state] || null;
}

// Utility hook for biofield state display
export function useBiofieldStateDisplay(state?: BiofieldState) {
  if (!state) return null;
  
  const { BIOFIELD_STATES } = require("@shared/models/biofield-profile");
  return BIOFIELD_STATES[state] || null;
}
