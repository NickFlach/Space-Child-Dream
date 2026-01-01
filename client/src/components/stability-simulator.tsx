import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Play, RotateCcw, Zap } from "lucide-react";

type Architecture = "resnet" | "hc" | "mhc";

export function StabilitySimulator() {
  const [depth, setDepth] = useState([100]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [architecture, setArchitecture] = useState<Architecture>("mhc");

  // Generate initial data
  useEffect(() => {
    resetSimulation();
  }, []);

  // Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setData((prev) => {
        if (prev.length > 50) {
            setIsSimulating(false);
            return prev;
        }
        
        const lastStep = prev[prev.length - 1];
        const step = lastStep.step + 1;
        let newValue = lastStep.value;

        // Simulation Logic based on Physics of the paper
        const depthFactor = depth[0] / 500; // Normalize depth impact
        
        if (architecture === "resnet") {
            // ResNet: Stable, slow convergence
            const noise = (Math.random() - 0.5) * 0.1;
            newValue = (newValue * 0.95) + noise; 
        } else if (architecture === "hc") {
            // HC: Unstable at depth
            // If depth is low, it converges fast. If high, it explodes.
            const instability = depthFactor > 0.3 ? (depthFactor * 1.5) : 0.1;
            const noise = (Math.random() - 0.5) * instability * 2;
            const drift = depthFactor > 0.5 ? 0.1 : 0; // Exploding gradient drift
            newValue = newValue + noise + drift;
            
            // Cap visual explosion
            if (Math.abs(newValue) > 5) newValue = 5 * Math.sign(newValue);
        } else if (architecture === "mhc") {
            // mHC: Stable but fast convergence (best of both)
            const noise = (Math.random() - 0.5) * 0.05; // Very low noise
            newValue = (newValue * 0.8) + noise; // Fast convergence
        }

        return [...prev, { step, value: newValue }];
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isSimulating, architecture, depth]);

  const resetSimulation = () => {
    setData([{ step: 0, value: 1.0 }]); // Start at loss/gradient 1.0
    setIsSimulating(false);
  };

  const toggleSimulation = () => {
    if (data.length > 50) resetSimulation();
    setIsSimulating(!isSimulating);
  };

  const getLineColor = () => {
      if (architecture === "resnet") return "#ffffff";
      if (architecture === "hc") return "#a855f7"; // Purple
      return "#06b6d4"; // Cyan
  };

  return (
    <Card className="glass p-8 border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-cyan-900/10 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* Controls */}
        <div className="w-full md:w-1/3 space-y-8">
            <div>
                <h3 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-2">
                    <Zap className="text-yellow-400 w-5 h-5" />
                    Scale Simulator
                </h3>
                <p className="text-gray-400 text-sm">
                    Test training stability by increasing network depth. Watch how different architectures handle the scaling.
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between text-sm font-mono text-gray-400">
                    <span>Network Depth</span>
                    <span className="text-cyan-400">{depth[0]} Layers</span>
                </div>
                <Slider 
                    value={depth} 
                    onValueChange={(val) => {
                        setDepth(val);
                        resetSimulation();
                    }} 
                    max={1000} 
                    step={10}
                    className="py-4" 
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-mono text-gray-500 uppercase tracking-wider">Architecture</label>
                <div className="grid grid-cols-1 gap-2">
                    <ArchButton 
                        active={architecture === "resnet"} 
                        onClick={() => { setArchitecture("resnet"); resetSimulation(); }}
                        label="Standard ResNet"
                        desc="Baseline Stability"
                    />
                    <ArchButton 
                        active={architecture === "hc"} 
                        onClick={() => { setArchitecture("hc"); resetSimulation(); }}
                        label="Hyper-Connections"
                        desc="High Capacity, Low Stability"
                        color="purple"
                    />
                    <ArchButton 
                        active={architecture === "mhc"} 
                        onClick={() => { setArchitecture("mhc"); resetSimulation(); }}
                        label="mHC (Ours)"
                        desc="High Capacity + High Stability"
                        color="cyan"
                    />
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button 
                    onClick={toggleSimulation}
                    className="flex-1 bg-white text-black font-bold py-2 rounded hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2"
                >
                    {isSimulating ? "Pause" : (data.length > 50 ? "Restart" : "Simulate Training")}
                    {data.length <= 50 && <Play className="w-4 h-4" />}
                </button>
                <button 
                    onClick={resetSimulation}
                    className="p-2 border border-white/20 rounded hover:bg-white/10 text-white"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Chart */}
        <div className="w-full md:w-2/3 min-h-[300px] bg-black/40 rounded-xl border border-white/5 p-4 relative">
             <div className="absolute top-4 right-4 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: isSimulating ? '#10b981' : '#6b7280' }} />
                 <span className="text-xs font-mono text-gray-500">{isSimulating ? "LIVE TRAINING" : "IDLE"}</span>
             </div>

             <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="step" hide />
                        <YAxis domain={[-2, 2]} hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '4px' }}
                            itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                            formatter={(value: number) => [value.toFixed(4), "Gradient Norm"]}
                            labelFormatter={() => ""}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={getLineColor()} 
                            strokeWidth={3} 
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
             </div>

             {/* Overlay Labels */}
             <div className="absolute bottom-4 left-4 text-xs font-mono text-gray-600">Step 0</div>
             <div className="absolute bottom-4 right-4 text-xs font-mono text-gray-600">Step 50</div>
             
             {/* Dynamic Status Text */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                 {!isSimulating && data.length <= 1 && (
                     <span className="text-white/20 text-4xl font-display font-bold">READY TO TRAIN</span>
                 )}
                 {architecture === "hc" && depth[0] > 500 && isSimulating && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="text-red-500/50 text-6xl font-display font-black"
                     >
                         DIVERGENCE
                     </motion.div>
                 )}
             </div>
        </div>
      </div>
    </Card>
  );
}

function ArchButton({ active, onClick, label, desc, color = "white" }: any) {
    const activeClass = active 
        ? color === "cyan" 
            ? "border-cyan-500 bg-cyan-500/10 text-cyan-400" 
            : color === "purple"
                ? "border-purple-500 bg-purple-500/10 text-purple-400"
                : "border-white bg-white/10 text-white"
        : "border-white/10 hover:bg-white/5 text-gray-400";

    return (
        <button 
            onClick={onClick}
            className={`text-left p-3 rounded border transition-all ${activeClass}`}
        >
            <div className="font-bold text-sm">{label}</div>
            <div className="text-xs opacity-70">{desc}</div>
        </button>
    )
}
