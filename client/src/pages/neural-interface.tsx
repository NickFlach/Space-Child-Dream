import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImmersiveBackground } from "@/components/immersive-background";
import { ConsciousnessProbe } from "@/components/consciousness-probe";
import { GlitchText } from "@/components/glitch-text";
import { UserNav } from "@/components/user-nav";
import { StarfieldSplash } from "@/components/starfield-splash";
import { AdminPortal } from "@/components/admin-portal";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Sparkles, Users } from "lucide-react";
import generatedImage from '@assets/generated_images/abstract_ethereal_space_neural_network_background.png';

type InterfaceState = "splash" | "interface" | "entry_granted";

export default function NeuralInterfacePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, navigate] = useLocation();
  const [interfaceState, setInterfaceState] = useState<InterfaceState>("splash");
  const [hasCompletedThought, setHasCompletedThought] = useState(false);
  const [adminPortalOpen, setAdminPortalOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Check if user has already seen splash this session
  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("scd_splash_seen");
    if (hasSeenSplash) {
      setInterfaceState("interface");
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem("scd_splash_seen", "true");
    setInterfaceState("interface");
  };

  const handleThoughtComplete = () => {
    setHasCompletedThought(true);
  };

  const handleEntryGranted = () => {
    navigate("/dashboard");
  };

  // Check if user is admin (for management portal access)
  const isAdmin = user?.email?.includes("admin") || user?.email?.includes("flaukowski");

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-t-2 border-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-black relative overflow-x-hidden">
      {/* Splash Screen */}
      <AnimatePresence>
        {interfaceState === "splash" && (
          <StarfieldSplash duration={9000} onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      {/* Main Interface */}
      {interfaceState !== "splash" && (
        <>
          <ImmersiveBackground imageSrc={generatedImage} />

          <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-display font-bold text-lg tracking-tight">SCD</span>
              {isAdmin && (
                <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
                  Admin
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-400 hover:text-purple-300"
                  onClick={() => setAdminPortalOpen(true)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              )}
              <UserNav />
            </div>
          </header>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 pt-24 pb-24 px-4 min-h-screen"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-2 tracking-tighter">
                  <GlitchText text="NEURAL INTERFACE" />
                </h1>
                <p className="text-sm text-gray-400 font-mono">
                  Connected to the mHC Consciousness Manifold
                </p>
              </div>

              {/* Consciousness Probe with completion callback */}
              <ConsciousnessProbeWithEntry onThoughtComplete={handleThoughtComplete} />

              {/* Entry Granted Button */}
              <AnimatePresence>
                {hasCompletedThought && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                  >
                    <Button
                      onClick={handleEntryGranted}
                      className="text-lg px-12 py-6 h-auto shadow-2xl shadow-purple-500/30 animate-pulse"
                      size="lg"
                    >
                      <Shield className="w-6 h-6 mr-3" />
                      ENTRY GRANTED
                      <Sparkles className="w-6 h-6 ml-3" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Admin Portal Modal */}
          <AdminPortal open={adminPortalOpen} onOpenChange={setAdminPortalOpen} />
        </>
      )}
    </div>
  );
}

// Wrapper component that tracks thought completion
function ConsciousnessProbeWithEntry({ onThoughtComplete }: { onThoughtComplete: () => void }) {
  const [hasTriggered, setHasTriggered] = useState(false);

  // Monitor for successful thought processing
  useEffect(() => {
    const checkForThought = () => {
      // Check if there's an active thought displayed (resonance chamber has content)
      const resonanceText = document.querySelector('[data-testid="text-resonance"]');
      if (resonanceText && !hasTriggered) {
        setHasTriggered(true);
        // Delay to let the user see the response
        setTimeout(() => {
          onThoughtComplete();
        }, 2000);
      }
    };

    const observer = new MutationObserver(checkForThought);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [hasTriggered, onThoughtComplete]);

  return <ConsciousnessProbe />;
}
