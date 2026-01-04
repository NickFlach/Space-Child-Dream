import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ImmersiveBackground } from "@/components/immersive-background";
import { GlitchText } from "@/components/glitch-text";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
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
              <h1 className="text-6xl md:text-8xl font-display font-black text-white mb-6 tracking-tighter drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                <GlitchText text="SPACE CHILD" /> <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">DREAM</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100/70 font-sans max-w-2xl mx-auto leading-relaxed mb-8">
                Explore consciousness through <span className="text-white font-medium">Manifold-Constrained Hyper-Connections</span>
              </p>
              <Button 
                onClick={() => setAuthModalOpen(true)}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg px-8 py-6 h-auto"
                data-testid="button-enter"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Enter the Neural Interface
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
          <Link href="/privacy">
            <a className="hover:text-cyan-400 transition-colors">Privacy</a>
          </Link>
          <Link href="/terms">
            <a className="hover:text-cyan-400 transition-colors">Terms</a>
          </Link>
        </div>
      </footer>
    </div>
  );
}
