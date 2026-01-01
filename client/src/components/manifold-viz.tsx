import { motion } from "framer-motion";

export function ManifoldViz() {
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-black/20">
        <svg className="w-full h-full max-w-[600px] max-h-[300px]" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
            {/* Grid Background */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* The Manifold (Curve) */}
            <motion.path
                d="M 50 150 Q 200 50 350 150"
                fill="none"
                stroke="rgba(6,182,212,0.5)"
                strokeWidth="3"
                filter="url(#glow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2 }}
            />
            
            {/* Glow Filter */}
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            {/* Unstable Points (Red/Magenta) - Off Manifold */}
            <Point cx={100} cy={80} color="#a855f7" delay={0.5} />
            <Point cx={250} cy={60} color="#a855f7" delay={0.8} />
            <Point cx={300} cy={160} color="#a855f7" delay={1.1} />

            {/* Projection Lines */}
            <ProjectionLine x1={100} y1={80} x2={108} y2={128} delay={1.5} />
            <ProjectionLine x1={250} y1={60} x2={235} y2={93} delay={1.8} />

            {/* Stable Points (Cyan) - On Manifold */}
            <Point cx={108} cy={128} color="#06b6d4" delay={2} />
            <Point cx={235} cy={93} color="#06b6d4" delay={2.3} />
            
            {/* Labels */}
            <motion.text x="100" y="70" fill="rgba(168,85,247,0.8)" fontSize="10" fontFamily="monospace" textAnchor="middle" initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.7}}>Instability</motion.text>
            <motion.text x="108" y="150" fill="rgba(6,182,212,0.8)" fontSize="10" fontFamily="monospace" textAnchor="middle" initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 2.2}}>Projection</motion.text>
        </svg>
    </div>
  );
}

function Point({ cx, cy, color, delay }: { cx: number, cy: number, color: string, delay: number }) {
    return (
        <motion.circle
            cx={cx}
            cy={cy}
            r="4"
            fill={color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay, type: "spring" }}
        />
    )
}

function ProjectionLine({ x1, y1, x2, y2, delay }: { x1: number, y1: number, x2: number, y2: number, delay: number }) {
    return (
        <motion.line
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            stroke="white"
            strokeWidth="1"
            strokeDasharray="4 2"
            strokeOpacity="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay, duration: 0.5 }}
        />
    )
}
