import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

interface StarfieldSplashProps {
  duration?: number;
  onComplete: () => void;
}

export function StarfieldSplash({ duration = 9000, onComplete }: StarfieldSplashProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
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

    // Create starfield
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const positions = new Float32Array(starCount * 3);
    const velocities = new Float32Array(starCount);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;
      velocities[i] = 0.01 + Math.random() * 0.03;
      sizes[i] = Math.random() * 2 + 0.5;
    }

    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const starsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        varying float vOpacity;
        uniform float time;
        
        void main() {
          vec3 pos = position;
          pos.z = mod(pos.z + time * 10.0, 100.0) - 50.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          float dist = length(mvPosition.xyz);
          gl_PointSize = size * (300.0 / dist);
          
          vOpacity = smoothstep(50.0, 0.0, abs(pos.z));
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = (1.0 - dist * 2.0) * vOpacity;
          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Animation
    let animationId: number;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      starsMaterial.uniforms.time.value = elapsed;
      
      // Gentle rotation
      stars.rotation.y = elapsed * 0.02;
      stars.rotation.x = Math.sin(elapsed * 0.1) * 0.1;

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

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

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
          <div ref={containerRef} className="absolute inset-0" />
          
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
