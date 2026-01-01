import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ImmersiveBackgroundProps {
  imageSrc: string;
}

export function ImmersiveBackground({ imageSrc }: ImmersiveBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Mouse position values (0 to 1)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Smooth springs for fluid movement
  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D Transforms for the background image (Far layer)
  // Moves slowly, rotates slightly
  const moveX = useTransform(smoothX, [0, 1], ["2%", "-2%"]);
  const moveY = useTransform(smoothY, [0, 1], ["2%", "-2%"]);
  const rotateX = useTransform(smoothY, [0, 1], ["2deg", "-2deg"]);
  const rotateY = useTransform(smoothX, [0, 1], ["-2deg", "2deg"]);

  // Transforms for the starfield (Near layer)
  // Moves faster for parallax depth
  const starsMoveX = useTransform(smoothX, [0, 1], ["5%", "-5%"]);
  const starsMoveY = useTransform(smoothY, [0, 1], ["5%", "-5%"]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position 0..1
      const { innerWidth, innerHeight } = window;
      const x = e.clientX / innerWidth;
      const y = e.clientY / innerHeight;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div 
      ref={ref} 
      className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none perspective-[1000px]"
    >
      {/* Background Image Layer */}
      <motion.div
        className="absolute inset-[-5%] w-[110%] h-[110%] bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageSrc})`,
          x: moveX,
          y: moveY,
          rotateX: rotateX,
          rotateY: rotateY,
          scale: 1.1, // Scale up to prevent edges showing
        }}
      >
        {/* Overlay Gradient to blend with content */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      </motion.div>

      {/* Floating Particles/Stars Layer (Near) */}
      <motion.div 
        className="absolute inset-[-10%] w-[120%] h-[120%]"
        style={{
          x: starsMoveX,
          y: starsMoveY,
        }}
      >
        <Starfield />
      </motion.div>
    </div>
  );
}

function Starfield() {
  // Generate random stars
  const stars = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.3,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="w-full h-full">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-cyan-200"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            boxShadow: `0 0 ${star.size * 2}px rgba(6,182,212,0.8)`
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 0.5, star.opacity],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
