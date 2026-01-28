import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ImmersiveBackground } from "@/components/immersive-background";
import { GlitchText } from "@/components/glitch-text";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sparkles, Atom } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { useLocation, Link } from "wouter";
import generatedImage from '@assets/generated_images/abstract_ethereal_space_neural_network_background.png';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [, navigate] = useLocation();

  // Redirect authenticated users to neural interface
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/neural-interface");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      <ImmersiveBackground imageSrc={generatedImage} />

      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-2">
        </div>
        <UserNav />
      </header>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex items-center justify-center"
          >
            <div className="w-16 h-16 border-t-2 border-cyan-500 rounded-full animate-spin" />
          </motion.div>
        ) : isAuthenticated ? (
          <motion.div
            key="redirecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-t-2 border-cyan-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 font-mono text-sm">Entering Neural Interface...</p>
            </div>
          </motion.div>
        ) : (
          <motion.section
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
          >
            <motion.div 
              className="relative z-10 text-center px-4 max-w-4xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <Badge variant="outline" className="mb-4 border-cyan-500/50 text-cyan-400 font-mono tracking-widest uppercase bg-cyan-950/30">
                Research Prototype
              </Badge>
              <h1 className="text-6xl md:text-8xl font-display font-black text-white mb-6 tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                <GlitchText text="SPACE CHILD" /> <br/> 
                <span className="relative inline-block">
                  <span className="relative z-10 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">DREAM</span>
                  {/* Primary inner glow */}
                  <motion.span
                    className="absolute inset-0 z-0 bg-white/40 blur-xl rounded-full"
                    animate={{
                      scale: [1, 1.6, 1],
                      opacity: [0.4, 0.8, 0.4],
                      skewX: [0, 15, -15, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  {/* Middle whispy layer */}
                  <motion.span
                    className="absolute -inset-4 z-0 bg-white/30 blur-3xl rounded-full"
                    animate={{
                      scale: [1.2, 2.0, 1.2],
                      opacity: [0.2, 0.6, 0.2],
                      rotate: [0, 20, -20, 0],
                      x: [0, 10, -10, 0],
                      y: [0, -10, 10, 0],
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  {/* Outer atmospheric layer */}
                  <motion.span
                    className="absolute -inset-8 z-0 bg-white/20 blur-[64px] rounded-full"
                    animate={{
                      scale: [1.5, 2.5, 1.5],
                      opacity: [0.1, 0.4, 0.1],
                      rotate: [0, -15, 15, 0],
                      x: [-15, 15, -15],
                      y: [15, -15, 15],
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100/70 font-sans max-w-2xl mx-auto leading-relaxed mb-8">
                Explore your consciousness through <span className="text-white font-medium">Hyper-Connections</span>
              </p>
              <Button 
                onClick={() => setAuthModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 text-lg px-8 py-6 h-auto shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] group"
                data-testid="button-enter"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="mr-3"
                >
                  <img src="/favicon.png" alt="Icon" className="w-8 h-8 object-contain" />
                </motion.div>
                <span className="relative z-10">Enter the Neural Interface</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                />
              </Button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-center items-center gap-6 text-xs text-gray-500 font-mono">
          <span>© 2026 Space Child, LLC</span>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-cyan-400 transition-colors">
            Terms
          </Link>
          <a href="https://trakkr.ai/?ref=nick" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
            Trakkr
          </a>
        </div>
      </footer>
    </div>
  );
}
