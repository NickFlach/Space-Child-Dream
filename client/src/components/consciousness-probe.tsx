import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Sparkles, Save, Trash2, Share2, Activity, Fingerprint } from "lucide-react";
import { GlitchText } from "./glitch-text";

interface Thought {
  id: string;
  text: string;
  timestamp: number;
  resonance: number;
  complexity: number;
  pattern: number[];
}

export function ConsciousnessProbe() {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [activeThought, setActiveThought] = useState<Thought | null>(null);
  
  // Simulated processing
  const processThought = () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate network delay and processing
    setTimeout(() => {
      const newThought: Thought = {
        id: Math.random().toString(36).substring(7),
        text: input,
        timestamp: Date.now(),
        resonance: Math.random() * 100,
        complexity: Math.random() * 100,
        pattern: Array.from({ length: 20 }, () => Math.random()) // Feature vector
      };
      
      setThoughts(prev => [newThought, ...prev]);
      setActiveThought(newThought);
      setInput("");
      setIsProcessing(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processThought();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
      {/* Left Panel: Input & History */}
      <Card className="glass p-6 flex flex-col gap-6 lg:col-span-1 border-white/10">
        <div>
           <h3 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-2">
             <Brain className="text-cyan-400" />
             Neural Interface
           </h3>
           <p className="text-xs text-gray-400 font-mono">
             Inject simulated concepts into the mHC manifold.
           </p>
        </div>

        <div className="relative">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a thought or concept..."
            className="bg-black/50 border-white/20 text-white placeholder:text-white/20 font-mono focus:border-cyan-500/50"
            disabled={isProcessing}
          />
          <Button 
            onClick={processThought}
            disabled={!input.trim() || isProcessing}
            className="absolute right-1 top-1 h-8 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/50"
            size="sm"
          >
            {isProcessing ? <Activity className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
            <h4 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">Recent Resonance</h4>
            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-2">
                    {thoughts.map(t => (
                        <motion.button
                            key={t.id}
                            onClick={() => setActiveThought(t)}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`w-full text-left p-3 rounded border text-xs font-mono transition-all flex justify-between items-center group ${
                                activeThought?.id === t.id 
                                ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300" 
                                : "bg-white/5 border-transparent hover:bg-white/10 text-gray-400"
                            }`}
                        >
                            <span className="truncate max-w-[150px]">{t.text}</span>
                            <span className="opacity-50 group-hover:opacity-100">{Math.round(t.resonance)}%</span>
                        </motion.button>
                    ))}
                    {thoughts.length === 0 && (
                        <div className="text-center py-8 text-gray-600 text-xs italic">
                            No patterns detected.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
      </Card>

      {/* Right Panel: Visualization */}
      <Card className="glass lg:col-span-2 border-white/10 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-black/40 z-0" />
        
        {/* Header */}
        <div className="relative z-10 p-6 border-b border-white/5 flex justify-between items-center">
            <div>
                <h3 className="text-xl font-display font-bold text-white">
                    <GlitchText text="RESONANCE CHAMBER" />
                </h3>
                <div className="flex gap-4 mt-1">
                    <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> 
                        {activeThought ? "ACTIVE" : "IDLE"}
                    </span>
                    <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                        <Fingerprint className="w-3 h-3" /> 
                        {activeThought ? activeThought.id : "---"}
                    </span>
                </div>
            </div>
            {activeThought && (
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10">
                        <Save className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10">
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>

        {/* Main Canvas */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
                {isProcessing ? (
                    <ProcessingState key="processing" />
                ) : activeThought ? (
                    <ResonanceVisualizer key={activeThought.id} thought={activeThought} />
                ) : (
                    <EmptyState key="empty" />
                )}
            </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}

function EmptyState() {
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="text-center text-gray-600"
        >
            <div className="w-24 h-24 rounded-full border border-dashed border-gray-700 mx-auto mb-4 animate-[spin_10s_linear_infinite]" />
            <p className="font-mono text-xs">Waiting for neural input...</p>
        </motion.div>
    )
}

function ProcessingState() {
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center"
        >
             <div className="relative w-32 h-32">
                 <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin" />
                 <div className="absolute inset-2 border-r-2 border-purple-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />
                 <div className="absolute inset-4 border-b-2 border-white rounded-full animate-[spin_2s_linear_infinite]" />
             </div>
        </motion.div>
    )
}

function ResonanceVisualizer({ thought }: { thought: Thought }) {
    // Deterministic visual generation based on thought data
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="relative w-full h-full flex items-center justify-center"
        >
            <div className="relative w-[300px] h-[300px]">
                {/* Core Nucleus */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/5 rounded-full blur-xl" />
                
                {/* Generated Pattern Rings */}
                {thought.pattern.map((val, i) => (
                    <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 rounded-full border"
                        style={{
                            width: `${(i + 1) * 15}px`,
                            height: `${(i + 1) * 15}px`,
                            borderColor: i % 2 === 0 ? `rgba(6,182,212,${val})` : `rgba(168,85,247,${val})`,
                            borderWidth: val > 0.5 ? '2px' : '1px',
                            x: '-50%',
                            y: '-50%'
                        }}
                        animate={{ 
                            rotate: i % 2 === 0 ? 360 : -360,
                            scale: [1, 1 + (val * 0.2), 1]
                        }}
                        transition={{ 
                            rotate: { duration: 10 + (i * 2), repeat: Infinity, ease: "linear" },
                            scale: { duration: 2 + val, repeat: Infinity, ease: "easeInOut" }
                        }}
                    />
                ))}

                {/* Text Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 blur-[1px]">
                        {Math.round(thought.resonance)}%
                    </h2>
                </div>
            </div>
            
            {/* Analysis Data */}
            <div className="absolute bottom-0 w-full flex justify-between text-xs font-mono text-gray-500">
                <div>COMPLEXITY: {(thought.complexity / 10).toFixed(2)}</div>
                <div>HARMONICS: {thought.pattern.filter(p => p > 0.5).length}</div>
            </div>
        </motion.div>
    )
}
