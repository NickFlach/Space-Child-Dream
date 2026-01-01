import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Layers, GitMerge, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

type Mode = "resnet" | "hc" | "mhc";

export function ArchitectureViz() {
  const [mode, setMode] = useState<Mode>("resnet");

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setMode("resnet")}
          className={`px-6 py-2 rounded-full border transition-all ${
            mode === "resnet"
              ? "bg-white/10 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              : "border-white/20 text-white/50 hover:bg-white/5"
          }`}
        >
          ResNet
        </button>
        <button
          onClick={() => setMode("hc")}
          className={`px-6 py-2 rounded-full border transition-all ${
            mode === "hc"
              ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "border-white/20 text-white/50 hover:bg-white/5"
          }`}
        >
          Hyper-Connections
        </button>
        <button
          onClick={() => setMode("mhc")}
          className={`px-6 py-2 rounded-full border transition-all ${
            mode === "mhc"
              ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "border-white/20 text-white/50 hover:bg-white/5"
          }`}
        >
          mHC (Ours)
        </button>
      </div>

      <Card className="glass min-h-[400px] flex items-center justify-center relative overflow-hidden p-8">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

        <div className="relative z-10 w-full max-w-2xl">
          {mode === "resnet" && <ResNetDiagram />}
          {mode === "hc" && <HCDiagram />}
          {mode === "mhc" && <MHCDiagram />}
        </div>
      </Card>
      
      <div className="mt-6 text-center text-white/70 font-mono text-sm">
        {mode === "resnet" && "Standard Residual Connection: Identity mapping ensures signal propagation."}
        {mode === "hc" && "Hyper-Connections: Expanded width increases capacity but breaks identity mapping."}
        {mode === "mhc" && "Manifold-Constrained HC: Projects connections onto a manifold to restore stability."}
      </div>
    </div>
  );
}

function ResNetDiagram() {
  return (
    <div className="flex items-center justify-between">
      <Node label="Input x" />
      <div className="flex-1 mx-4 relative h-32 flex items-center">
        {/* Skip Connection */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div 
          className="absolute top-0 left-1/2 -translate-y-1/2 text-white/30 text-xs font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Identity
        </motion.div>

        {/* Function Branch */}
        <div className="w-full flex flex-col items-center mt-16">
          <motion.div 
            className="w-full h-16 border-b-2 border-l-2 border-r-2 border-white/20 rounded-b-xl relative"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 64, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-white/30 px-4 py-2 rounded text-sm text-white">
              F(x)
            </div>
          </motion.div>
        </div>
        
        {/* Addition */}
        <motion.div 
          className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 bg-white/10 w-8 h-8 rounded-full flex items-center justify-center border border-white/50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          +
        </motion.div>
      </div>
      <Node label="Output" delay={0.6} />
    </div>
  );
}

function HCDiagram() {
  return (
    <div className="flex items-center justify-between">
      <Node label="Input x" color="border-purple-500" />
      <div className="flex-1 mx-4 relative h-48 flex items-center">
        {/* Expanded Streams */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col gap-4">
           {[0, 1, 2].map((i) => (
             <motion.div
               key={i}
               className="h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent w-full"
               initial={{ opacity: 0, scaleX: 0 }}
               animate={{ opacity: 1, scaleX: 1 }}
               transition={{ delay: i * 0.1 }}
             />
           ))}
        </div>

        {/* Mixing Matrix */}
        <motion.div 
          className="absolute left-1/4 top-1/2 -translate-y-1/2 w-16 h-32 border border-purple-500/50 bg-purple-500/10 rounded flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-purple-300 text-xs text-center font-mono">Mix<br/>H_res</div>
        </motion.div>

        {/* Function Branch (Complex) */}
         <motion.div 
            className="absolute right-1/4 top-1/2 -translate-y-1/2 w-16 h-24 border border-purple-500/50 bg-purple-500/10 rounded flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-purple-300 text-xs text-center font-mono">F(x)</div>
          </motion.div>
        
      </div>
      <Node label="Output" color="border-purple-500" delay={0.6} />
    </div>
  );
}

function MHCDiagram() {
  return (
    <div className="flex items-center justify-between">
      <Node label="Input x" color="border-cyan-500" />
      <div className="flex-1 mx-4 relative h-48 flex items-center">
        {/* Expanded Streams */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col gap-4">
           {[0, 1, 2].map((i) => (
             <motion.div
               key={i}
               className="h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent w-full"
               initial={{ opacity: 0, scaleX: 0 }}
               animate={{ opacity: 1, scaleX: 1 }}
               transition={{ delay: i * 0.1 }}
             />
           ))}
        </div>

        {/* Manifold Projection */}
        <motion.div 
          className="absolute left-1/3 top-1/2 -translate-y-1/2 w-24 h-40 border-2 border-cyan-400 bg-cyan-900/20 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: -50 }} // "Centered" technically
          transition={{ delay: 0.3 }}
        >
          <ShieldCheck className="w-8 h-8 text-cyan-400 mb-2" />
          <div className="text-cyan-300 text-xs text-center font-mono font-bold">Manifold<br/>Projection</div>
        </motion.div>

        {/* Flow Particles */}
        <motion.div
          className="absolute left-1/2 top-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]"
          animate={{ 
            x: [0, 100], 
            opacity: [1, 0] 
          }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />

      </div>
      <Node label="Output" color="border-cyan-500" delay={0.6} />
    </div>
  );
}

function Node({ label, color = "border-white/50", delay = 0 }: { label: string, color?: string, delay?: number }) {
  return (
    <motion.div 
      className={`w-20 h-20 rounded-xl border-2 ${color} bg-black/50 backdrop-blur flex items-center justify-center z-10`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay }}
    >
      <span className="text-sm font-mono text-white/80">{label}</span>
    </motion.div>
  );
}
