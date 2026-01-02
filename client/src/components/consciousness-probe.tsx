import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Sparkles, Activity, Fingerprint, Users } from "lucide-react";
import { GlitchText } from "./glitch-text";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/hooks/use-auth";

interface Thought {
  id: number | string;
  inputText?: string;
  text?: string;
  reflection: string;
  timestamp?: number;
  createdAt?: string;
  resonance: number;
  complexity: number;
  pattern: number[];
  userName?: string;
}

export function ConsciousnessProbe() {
  const [input, setInput] = useState("");
  const [activeThought, setActiveThought] = useState<Thought | null>(null);
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: feedThoughts = [], isLoading: feedLoading } = useQuery<Thought[]>({
    queryKey: ["thoughts-feed"],
    queryFn: async () => {
      const response = await fetch("/api/thoughts/feed", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch feed");
      const data = await response.json();
      return data.items || data;
    },
    refetchInterval: 5000,
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [feedThoughts]);

  const probeMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch("/api/consciousness/probe", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("Failed to process thought");
      return response.json();
    },
    onSuccess: (data: Thought) => {
      setActiveThought(data);
      setInput("");
      queryClient.invalidateQueries({ queryKey: ["thoughts-feed"] });
    },
  });

  const processThought = () => {
    if (!input.trim()) return;
    probeMutation.mutate(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processThought();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
      <Card className="glass p-6 flex flex-col gap-6 lg:col-span-1 border-white/10">
        <div>
           <h3 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-2">
             <Brain className="text-cyan-400" />
             Neural Interface
           </h3>
           <p className="text-xs text-gray-400 font-mono">
             Inject concepts into the mHC manifold.
           </p>
        </div>

        <div className="relative">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a thought or concept..."
            className="bg-black/50 border-white/20 text-white placeholder:text-white/20 font-mono focus:border-cyan-500/50"
            disabled={probeMutation.isPending}
            data-testid="input-consciousness"
          />
          <Button 
            onClick={processThought}
            disabled={!input.trim() || probeMutation.isPending}
            className="absolute right-1 top-1 h-8 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/50"
            size="sm"
            data-testid="button-probe"
          >
            {probeMutation.isPending ? <Activity className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <h4 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-3 h-3" />
            Global Consciousness Stream
          </h4>
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-2">
              {feedLoading ? (
                <div className="text-center py-8 text-gray-600 text-xs">
                  <Activity className="w-4 h-4 animate-spin mx-auto mb-2" />
                  Syncing with manifold...
                </div>
              ) : feedThoughts.length === 0 ? (
                <div className="text-center py-8 text-gray-600 text-xs italic">
                  No patterns detected. Be the first to explore.
                </div>
              ) : (
                feedThoughts.map((t, idx) => (
                  <motion.button
                    key={t.id}
                    onClick={() => setActiveThought(t)}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`w-full text-left p-3 rounded border text-xs font-mono transition-all group ${
                      activeThought?.id === t.id 
                        ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300" 
                        : "bg-white/5 border-transparent hover:bg-white/10 text-gray-400"
                    }`}
                    data-testid={`thought-${t.id}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="truncate flex-1">{t.inputText || t.text}</span>
                      <span className="opacity-50 group-hover:opacity-100 shrink-0">{Math.round(t.resonance)}%</span>
                    </div>
                    <div className="text-[10px] text-purple-400/60 mt-1">
                      {t.userName || "Anonymous"}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="text-[10px] text-gray-600 mt-2 text-center font-mono">
            {feedThoughts.length}/20 entries • Auto-refreshing
          </div>
        </div>
      </Card>

      <Card className="glass lg:col-span-2 border-white/10 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-black/40 z-0" />
        
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
                {activeThought ? String(activeThought.id).slice(0, 8) : "---"}
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col p-8 overflow-hidden">
          <ScrollArea className="flex-1">
            <AnimatePresence mode="wait">
              {probeMutation.isPending ? (
                <ProcessingState key="processing" />
              ) : activeThought ? (
                <ResonanceVisualizer key={activeThought.id} thought={activeThought} />
              ) : (
                <EmptyState key="empty" />
              )}
            </AnimatePresence>
          </ScrollArea>
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
      <p className="font-mono text-[10px] text-gray-700 mt-2">Select a thought from the feed or submit your own</p>
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
  const patternArray = thought.pattern || Array.from({ length: 20 }, () => Math.random());
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="relative w-full h-full flex flex-col items-center justify-center gap-6"
    >
      <div className="relative w-[300px] h-[300px]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/5 rounded-full blur-xl" />
        
        {patternArray.map((val, i) => (
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

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 blur-[1px]" data-testid="text-resonance">
            {Math.round(thought.resonance)}%
          </h2>
        </div>
      </div>
      
      <motion.div 
        className="max-w-md text-center px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm text-gray-300 italic leading-relaxed" data-testid="text-reflection">
          "{thought.reflection}"
        </p>
        {thought.userName && (
          <p className="text-xs text-purple-400/60 mt-2">— {thought.userName}</p>
        )}
      </motion.div>
      
      <div className="absolute bottom-0 w-full flex justify-between text-xs font-mono text-gray-500 px-8">
        <div data-testid="text-complexity">COMPLEXITY: {(thought.complexity / 10).toFixed(2)}</div>
        <div>HARMONICS: {patternArray.filter(p => p > 0.5).length}</div>
      </div>
    </motion.div>
  )
}
