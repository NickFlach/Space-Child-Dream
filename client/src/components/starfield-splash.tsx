import { useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [useWebGL, setUseWebGL] = useState(false);

  // Try to initialize WebGL starfield
  useEffect(() => {
    if (!containerRef.current || !useWebGL) return;

    let cleanup: (() => void) | undefined;

    const initThree = async () => {
      try {
        // Dynamic import to avoid crashes if Three.js has issues
        const THREE = await import("three");
        
        const container = containerRef.current;
        if (!container) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Create starfield with simpler PointsMaterial (more compatible)
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 3000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
          const i3 = i * 3;
          positions[i3] = (Math.random() - 0.5) * 100;
          positions[i3 + 1] = (Math.random() - 0.5) * 100;
          positions[i3 + 2] = (Math.random() - 0.5) * 100;
        }

        starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        // Use simpler PointsMaterial instead of ShaderMaterial
        const starsMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.5,
          transparent: true,
          opacity: 0.8,
          sizeAttenuation: true,
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Animation
        let animationId: number;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          
          // Move stars toward camera
          const posArray = starsGeometry.attributes.position.array as Float32Array;
          for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            posArray[i3 + 2] += 0.1;
            if (posArray[i3 + 2] > 50) {
              posArray[i3 + 2] = -50;
            }
          }
          starsGeometry.attributes.position.needsUpdate = true;
          
          // Gentle rotation
          stars.rotation.y = elapsed * 0.02;

          renderer.render(scene, camera);
          animationId = requestAnimationFrame(animate);
        };

        animate();

        // Handle resize
        const handleResize = () => {
          const newWidth = window.innerWidth;
          const newHeight = window.innerHeight;
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener("resize", handleResize);

        // Set cleanup function
        cleanup = () => {
          window.removeEventListener("resize", handleResize);
          cancelAnimationFrame(animationId);
          renderer.dispose();
          starsGeometry.dispose();
          starsMaterial.dispose();
          if (container && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        };
      } catch (error) {
        console.warn("WebGL starfield failed, using CSS fallback:", error);
        setUseWebGL(false);
      }
    };

    initThree();

    return () => {
      if (cleanup) cleanup();
    };
  }, [useWebGL]);

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
          {/* CSS starfield - always works */}
          <CSSStarfield />
          {/* WebGL container - only used if useWebGL is true */}
          {useWebGL && <div ref={containerRef} className="absolute inset-0" />}
          
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
