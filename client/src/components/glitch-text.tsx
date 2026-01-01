import { motion } from "framer-motion";

export function GlitchText({ text, className = "" }: { text: string, className?: string }) {
  return (
    <div className={`relative inline-block group ${className}`}>
      <span className="relative z-10">{text}</span>
      <motion.span
        className="absolute top-0 left-0 -z-10 text-cyan-500 opacity-0 group-hover:opacity-70"
        animate={{ 
            x: [-2, 2, -1, 0],
            y: [1, -1, 0],
            opacity: [0, 0.8, 0] 
        }}
        transition={{ 
            repeat: Infinity, 
            repeatDelay: 2,
            duration: 0.5 
        }}
      >
        {text}
      </motion.span>
      <motion.span
        className="absolute top-0 left-0 -z-10 text-purple-500 opacity-0 group-hover:opacity-70"
        animate={{ 
            x: [2, -2, 1, 0],
            y: [-1, 1, 0],
            opacity: [0, 0.8, 0] 
        }}
        transition={{ 
            repeat: Infinity, 
            repeatDelay: 2.1, // Slight offset
            duration: 0.4 
        }}
      >
        {text}
      </motion.span>
    </div>
  );
}
