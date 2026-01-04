/**
 * Layer 1 — Identity Core
 * 
 * The slow, deliberate layer that anchors the profile.
 * Changes are rare. Transitions are intentional.
 * This layer should feel calm and grounded.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SigilAvatar } from "./sigil-avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PRIMARY_FIELDS,
  VISIBILITY_STATES,
  type PrimaryField,
  type VisibilityState,
  type IdentityCore,
  type HeartState,
  type BiofieldState,
} from "@shared/models/biofield-profile";

interface IdentityCoreLayerProps {
  identityCore: IdentityCore | null;
  heartState?: HeartState;
  biofieldState?: BiofieldState;
  onUpdate: (data: Partial<IdentityCore>) => Promise<any>;
  onRegenerateSigil: () => Promise<any>;
  isUpdating?: boolean;
}

export function IdentityCoreLayer({
  identityCore,
  heartState,
  biofieldState,
  onUpdate,
  onRegenerateSigil,
  isUpdating,
}: IdentityCoreLayerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    chosenName: identityCore?.chosenName || "",
    identityPhrase: identityCore?.identityPhrase || "",
    primaryField: identityCore?.primaryField || "aurora" as PrimaryField,
    visibilityState: identityCore?.visibilityState || "veiled" as VisibilityState,
  });

  const handleSave = async () => {
    await onUpdate(editData);
    setIsEditing(false);
  };

  const handleFieldSelect = (field: PrimaryField) => {
    setEditData(prev => ({ ...prev, primaryField: field }));
  };

  const handleVisibilitySelect = (state: VisibilityState) => {
    setEditData(prev => ({ ...prev, visibilityState: state }));
  };

  return (
    <Card className="relative overflow-hidden bg-black/40 border-white/10 backdrop-blur-xl">
      {/* Ambient field glow based on primary field */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${PRIMARY_FIELDS[editData.primaryField].colors[0]}30 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 80%, ${PRIMARY_FIELDS[editData.primaryField].colors[1]}20 0%, transparent 50%)`,
        }}
      />

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sigil Avatar */}
          <div className="flex flex-col items-center gap-4">
            <SigilAvatar
              seed={identityCore?.sigilSeed ?? undefined}
              primaryField={editData.primaryField}
              heartState={heartState}
              biofieldState={biofieldState}
              size={140}
              animate={!isEditing}
            />
            
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRegenerateSigil()}
                className="text-xs text-gray-400 hover:text-cyan-400"
              >
                regenerate sigil
              </Button>
            )}
          </div>

          {/* Identity Content */}
          <div className="flex-1 space-y-6">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Chosen Name */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                      Chosen Name
                    </label>
                    <Input
                      value={editData.chosenName}
                      onChange={(e) => setEditData(prev => ({ ...prev, chosenName: e.target.value }))}
                      placeholder="symbolic, poetic, or mutable..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                    />
                    <p className="text-xs text-gray-600">May be symbolic, poetic, non-human, or mutable</p>
                  </div>

                  {/* Identity Phrase */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                      Identity Phrase
                    </label>
                    <Textarea
                      value={editData.identityPhrase}
                      onChange={(e) => setEditData(prev => ({ ...prev, identityPhrase: e.target.value }))}
                      placeholder="One sentence. Present tense. Descriptive, not aspirational."
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Primary Field Selection */}
                  <div className="space-y-3">
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                      Primary Field
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {(Object.keys(PRIMARY_FIELDS) as PrimaryField[]).map((field) => (
                        <button
                          key={field}
                          onClick={() => handleFieldSelect(field)}
                          className={`relative p-3 rounded-lg border transition-all ${
                            editData.primaryField === field
                              ? "border-cyan-500 bg-cyan-500/10"
                              : "border-white/10 hover:border-white/30 bg-white/5"
                          }`}
                        >
                          <div 
                            className="w-6 h-6 mx-auto rounded-full mb-1"
                            style={{
                              background: `linear-gradient(135deg, ${PRIMARY_FIELDS[field].colors[0]}, ${PRIMARY_FIELDS[field].colors[1]})`,
                            }}
                          />
                          <span className="text-xs text-gray-300 capitalize">{field}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">{PRIMARY_FIELDS[editData.primaryField].description}</p>
                  </div>

                  {/* Visibility State */}
                  <div className="space-y-3">
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                      Visibility
                    </label>
                    <div className="flex gap-2">
                      {(Object.keys(VISIBILITY_STATES) as VisibilityState[]).map((state) => (
                        <button
                          key={state}
                          onClick={() => handleVisibilitySelect(state)}
                          className={`flex-1 p-3 rounded-lg border transition-all text-center ${
                            editData.visibilityState === state
                              ? "border-cyan-500 bg-cyan-500/10"
                              : "border-white/10 hover:border-white/30 bg-white/5"
                          }`}
                        >
                          <span className="text-sm text-white capitalize">{state}</span>
                          <p className="text-xs text-gray-500 mt-1">{VISIBILITY_STATES[state].description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isUpdating}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                    >
                      {isUpdating ? "Anchoring..." : "Anchor Changes"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditData({
                          chosenName: identityCore?.chosenName || "",
                          identityPhrase: identityCore?.identityPhrase || "",
                          primaryField: identityCore?.primaryField || "aurora",
                          visibilityState: identityCore?.visibilityState || "veiled",
                        });
                        setIsEditing(false);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="display"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Chosen Name */}
                  <div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
                      {identityCore?.chosenName || (
                        <span className="text-gray-500 italic">unnamed presence</span>
                      )}
                    </h2>
                  </div>

                  {/* Identity Phrase */}
                  {identityCore?.identityPhrase ? (
                    <p className="text-lg text-gray-300 leading-relaxed max-w-xl">
                      {identityCore.identityPhrase}
                    </p>
                  ) : (
                    <p className="text-gray-600 italic">
                      No identity phrase set. Your essence awaits expression.
                    </p>
                  )}

                  {/* Field & Visibility Badges */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <div 
                      className="px-3 py-1.5 rounded-full text-sm border border-white/20 flex items-center gap-2"
                      style={{
                        background: `linear-gradient(135deg, ${PRIMARY_FIELDS[editData.primaryField].colors[0]}20, ${PRIMARY_FIELDS[editData.primaryField].colors[1]}20)`,
                      }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${PRIMARY_FIELDS[editData.primaryField].colors[0]}, ${PRIMARY_FIELDS[editData.primaryField].colors[1]})`,
                        }}
                      />
                      <span className="text-gray-300 capitalize">{editData.primaryField} field</span>
                    </div>
                    
                    <div className="px-3 py-1.5 rounded-full text-sm border border-white/20 bg-white/5">
                      <span className="text-gray-400 capitalize">{editData.visibilityState}</span>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="border-white/20 text-gray-300 hover:text-white hover:bg-white/5"
                    >
                      Transform Identity Core
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Card>
  );
}
