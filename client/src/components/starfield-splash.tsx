import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StarfieldSplashProps {
  duration?: number;
  onComplete: () => void;
}

// CSS-based starfield as primary (more reliable than WebGL)
function CSSStarfield() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Layer 1 - Small stars, slow */}
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: `radial-gradient(1px 1px at 20px 30px, white, transparent),
                       radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.8), transparent),
                       radial-gradient(1px 1px at 50px 160px, white, transparent),
                       radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.9), transparent),
                       radial-gradient(1px 1px at 130px 80px, white, transparent),
                       radial-gradient(1px 1px at 160px 120px, rgba(255,255,255,0.7), transparent)`,
          backgroundSize: '200px 200px',
          animation: 'twinkle 4s ease-in-out infinite',
        }}
      />
      {/* Layer 2 - Medium stars */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(1.5px 1.5px at 100px 50px, white, transparent),
                       radial-gradient(2px 2px at 200px 150px, rgba(255,255,255,0.9), transparent),
                       radial-gradient(1.5px 1.5px at 300px 250px, white, transparent),
                       radial-gradient(1px 1px at 400px 100px, rgba(255,255,255,0.8), transparent),
                       radial-gradient(2px 2px at 500px 300px, white, transparent)`,
          backgroundSize: '550px 350px',
          animation: 'drift 20s linear infinite',
        }}
      />
      {/* Layer 3 - Large moving stars */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(2px 2px at 150px 100px, white, transparent),
                       radial-gradient(2.5px 2.5px at 350px 200px, rgba(255,255,255,0.95), transparent),
                       radial-gradient(2px 2px at 250px 350px, white, transparent),
                       radial-gradient(3px 3px at 450px 150px, rgba(255,255,255,0.9), transparent)`,
          backgroundSize: '600px 400px',
          animation: 'drift 15s linear infinite reverse',
        }}
      />
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes drift {
          from { transform: translateZ(0) translateY(0); }
          to { transform: translateZ(0) translateY(-100px); }
        }
      `}</style>
    </div>
  );
}

export function StarfieldSplash({ duration = 9000, onComplete }: StarfieldSplashProps) {
  const [isComplete, setIsComplete] = useState(false);

  // Timer for completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(onComplete, 1000); // Allow fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        >
          {/* CSS starfield */}
          <CSSStarfield />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="relative z-10 text-center px-8 max-w-3xl"
          >
            <motion.p
              className="text-white text-2xl md:text-4xl font-light tracking-wide leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 2 }}
            >
              Enter a coherent thought into the neural interface
            </motion.p>
            
            <motion.div
              className="mt-12 flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 2, duration: 1 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
