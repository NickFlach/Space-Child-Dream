import { motion } from "framer-motion";
import { ArchitectureViz } from "@/components/architecture-viz";
import { ManifoldViz } from "@/components/manifold-viz";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, ChevronDown, Activity, Zap, Shield, GitBranch } from "lucide-react";
import { ImmersiveBackground } from "@/components/immersive-background";
import { StabilitySimulator } from "@/components/stability-simulator";
import { ConsciousnessProbe } from "@/components/consciousness-probe";
import { GlitchText } from "@/components/glitch-text";
import generatedImage from '@assets/generated_images/abstract_ethereal_space_neural_network_background.png';

export default function HomePage() {
  return (
    <ScrollArea className="h-screen w-full bg-transparent">
      
      <ImmersiveBackground imageSrc={generatedImage} />
      
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Dynamic Background Removed (Moved to ImmersiveBackground) */}

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
          <p className="text-xl md:text-2xl text-blue-100/70 font-sans max-w-2xl mx-auto leading-relaxed">
            Visualizing <span className="text-white font-medium">Manifold-Constrained Hyper-Connections</span>
          </p>
          <p className="text-sm text-blue-200/50 mt-4 font-mono">
            Based on arXiv:2512.24880v1 • DeepSeek-AI
          </p>
        </motion.div>

        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <ChevronDown className="w-8 h-8 text-white/30" />
        </motion.div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-24 space-y-32">
        
        {/* The Problem Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-display font-bold text-white mb-6">The Identity Crisis</h2>
            <p className="text-lg text-gray-300 mb-6 font-sans leading-relaxed">
              Modern Deep Learning relies on the <span className="text-cyan-400">Identity Mapping</span> property of Residual Connections. 
              As we scale to Hyper-Connections (HC) for more capacity, this property breaks down, leading to training instability.
            </p>
            <ul className="space-y-4 font-mono text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <GitBranch className="text-purple-500" />
                Hyper-Connections expand residual width
              </li>
              <li className="flex items-center gap-3">
                <Activity className="text-red-500" />
                Unconstrained expansion causes signal explosion
              </li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="h-[400px] w-full"
          >
            <Card className="h-full glass relative overflow-hidden border-purple-500/30">
                <ManifoldViz />
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur p-3 rounded border border-white/10">
                    <p className="text-xs text-center text-gray-400">
                        Visualizing points drifting off the stability manifold (Red) vs constrained projection (Cyan)
                    </p>
                </div>
            </Card>
          </motion.div>
        </section>


        {/* The Solution: mHC */}
        <section className="space-y-12">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl font-display font-bold text-white mb-6">Manifold Constraints</h2>
                <p className="text-lg text-gray-300 font-sans">
                    <span className="text-cyan-400 font-bold">mHC</span> projects the connection space onto a specific manifold.
                    This restores the identity mapping property while keeping the expanded capacity of Hyper-Connections.
                </p>
            </div>

            <ArchitectureViz />
            
        </section>

        {/* NEW SECTION: Stability Simulator */}
        <section className="space-y-8">
             <div className="flex items-center gap-4 mb-8">
                 <div className="h-px bg-white/10 flex-1" />
                 <h2 className="text-2xl font-display font-bold text-white/50 tracking-widest uppercase">Live Simulation</h2>
                 <div className="h-px bg-white/10 flex-1" />
             </div>
             
             <StabilitySimulator />
        </section>

        {/* NEW SECTION: Consciousness Probe */}
        <section className="space-y-8">
             <div className="flex items-center gap-4 mb-8">
                 <div className="h-px bg-white/10 flex-1" />
                 <h2 className="text-2xl font-display font-bold text-white/50 tracking-widest uppercase">Consciousness Probe</h2>
                 <div className="h-px bg-white/10 flex-1" />
             </div>
             
             <ConsciousnessProbe />
        </section>

        {/* Key Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
                icon={<Shield className="w-8 h-8 text-cyan-400" />}
                title="Stability"
                desc="Restores identity mapping, allowing training to scale to massive depths without instability."
            />
            <FeatureCard 
                icon={<Zap className="w-8 h-8 text-purple-400" />}
                title="Efficiency"
                desc="Maintains computational overhead similar to standard ResNets while increasing topological complexity."
            />
            <FeatureCard 
                icon={<Activity className="w-8 h-8 text-green-400" />}
                title="Scalability"
                desc="Empirically proven to offer superior scalability compared to unconstrained Hyper-Connections."
            />
        </section>

        {/* Paper Abstract / Footer */}
        <section className="glass rounded-2xl p-8 md:p-12 border border-white/10 bg-gradient-to-br from-black/50 to-purple-900/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h3 className="text-2xl font-display font-bold text-white mb-2">Read the Paper</h3>
                    <p className="text-gray-400 font-mono text-sm max-w-xl">
                        "Manifold-Constrained Hyper-Connections" by Zhenda Xie et al. (DeepSeek-AI)
                    </p>
                </div>
                <a 
                    href="#" 
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-cyan-50 hover:scale-105 transition-all"
                >
                    View PDF <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </section>

      </div>
      
      {/* Footer */}
      <footer className="py-12 text-center text-white/20 font-mono text-xs">
        <p>Prototyped with Replit Agent • Space Child Dream Aesthetic</p>
      </footer>
    </ScrollArea>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <Card className="glass p-8 border-white/5 hover:border-cyan-500/30 transition-colors group">
            <div className="mb-4 bg-white/5 w-16 h-16 rounded-full flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-display">{title}</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
                {desc}
            </p>
        </Card>
    )
}
