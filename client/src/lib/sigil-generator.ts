/**
 * Procedural Sigil Generator
 * 
 * Generates unique, abstract sigils based on a seed.
 * Avatars represent becoming, not appearance.
 * Never faces, never portraits - only geometry.
 */

import { PRIMARY_FIELDS, type PrimaryField } from "@shared/models/biofield-profile";

export interface SigilConfig {
  seed: string;
  primaryField: PrimaryField;
  size?: number;
  animate?: boolean;
  heartStateTempo?: "slow" | "calm" | "steady" | "focused" | "curious" | "deliberate" | "energetic";
  biofieldIntensity?: number;
}

export interface SigilPath {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

export interface SigilData {
  paths: SigilPath[];
  viewBox: string;
  geometry: number[];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number): { x: number; y: number } {
  const rad = (angle - 90) * Math.PI / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function generateSymmetricPolygon(
  cx: number,
  cy: number,
  r: number,
  sides: number,
  rotation: number,
  variance: number,
  random: () => number
): string {
  const points: string[] = [];
  const angleStep = 360 / sides;
  
  for (let i = 0; i < sides; i++) {
    const angle = rotation + i * angleStep;
    const radiusVariance = r * (1 + (random() - 0.5) * variance);
    const point = polarToCartesian(cx, cy, radiusVariance, angle);
    points.push(`${point.x.toFixed(2)},${point.y.toFixed(2)}`);
  }
  
  return `M ${points.join(" L ")} Z`;
}

function generateConcentric(
  cx: number,
  cy: number,
  rings: number,
  maxRadius: number,
  sides: number,
  random: () => number
): string[] {
  const paths: string[] = [];
  
  for (let i = 1; i <= rings; i++) {
    const r = (maxRadius / rings) * i;
    const rotation = random() * 360;
    const variance = random() * 0.3;
    paths.push(generateSymmetricPolygon(cx, cy, r, sides, rotation, variance, random));
  }
  
  return paths;
}

function generateSpiralArm(
  cx: number,
  cy: number,
  startRadius: number,
  endRadius: number,
  startAngle: number,
  turns: number,
  points: number,
  random: () => number
): string {
  const pathPoints: string[] = [];
  
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const angle = startAngle + turns * 360 * t;
    const r = startRadius + (endRadius - startRadius) * t;
    const variance = (random() - 0.5) * 5;
    const point = polarToCartesian(cx, cy, r + variance, angle);
    
    if (i === 0) {
      pathPoints.push(`M ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
    } else {
      pathPoints.push(`L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
    }
  }
  
  return pathPoints.join(" ");
}

function generateRadialLines(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  count: number,
  rotation: number,
  random: () => number
): string[] {
  const paths: string[] = [];
  const angleStep = 360 / count;
  
  for (let i = 0; i < count; i++) {
    const angle = rotation + i * angleStep;
    const variance = (random() - 0.5) * 10;
    const inner = polarToCartesian(cx, cy, innerRadius, angle + variance);
    const outer = polarToCartesian(cx, cy, outerRadius, angle + variance);
    paths.push(`M ${inner.x.toFixed(2)} ${inner.y.toFixed(2)} L ${outer.x.toFixed(2)} ${outer.y.toFixed(2)}`);
  }
  
  return paths;
}

function generateOrbital(
  cx: number,
  cy: number,
  radius: number,
  nodeCount: number,
  nodeRadius: number,
  rotation: number,
  random: () => number
): { orbit: string; nodes: string[] } {
  const orbit = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy}`;
  const nodes: string[] = [];
  const angleStep = 360 / nodeCount;
  
  for (let i = 0; i < nodeCount; i++) {
    const angle = rotation + i * angleStep;
    const point = polarToCartesian(cx, cy, radius, angle);
    const nr = nodeRadius * (0.5 + random() * 0.5);
    nodes.push(`M ${point.x - nr} ${point.y} A ${nr} ${nr} 0 1 1 ${point.x + nr} ${point.y} A ${nr} ${nr} 0 1 1 ${point.x - nr} ${point.y}`);
  }
  
  return { orbit, nodes };
}

export function generateSigil(config: SigilConfig): SigilData {
  const { seed, primaryField, size = 200 } = config;
  
  const hash = hashString(seed);
  const random = seededRandom(hash);
  
  const colors = PRIMARY_FIELDS[primaryField].colors;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.4;
  
  const paths: SigilPath[] = [];
  const geometry: number[] = [];
  
  // Base geometry parameters (stored for potential animation/variation)
  const baseSides = 3 + Math.floor(random() * 6); // 3-8 sides
  const ringCount = 2 + Math.floor(random() * 3); // 2-4 rings
  const spiralArms = 2 + Math.floor(random() * 4); // 2-5 arms
  const radialCount = 4 + Math.floor(random() * 8); // 4-11 lines
  const orbitalNodes = 3 + Math.floor(random() * 5); // 3-7 nodes
  
  geometry.push(baseSides, ringCount, spiralArms, radialCount, orbitalNodes);
  
  // Layer 1: Concentric shapes (base structure)
  const concentrics = generateConcentric(cx, cy, ringCount, maxRadius * 0.9, baseSides, random);
  concentrics.forEach((d, i) => {
    const opacity = 0.2 + (i / ringCount) * 0.3;
    paths.push({
      d,
      fill: "none",
      stroke: colors[i % colors.length],
      strokeWidth: 1.5,
      opacity,
    });
  });
  
  // Layer 2: Spiral arms (optional based on seed)
  if (random() > 0.3) {
    for (let i = 0; i < spiralArms; i++) {
      const startAngle = (360 / spiralArms) * i + random() * 30;
      const turns = 0.3 + random() * 0.5;
      const arm = generateSpiralArm(cx, cy, maxRadius * 0.1, maxRadius * 0.85, startAngle, turns, 20, random);
      paths.push({
        d: arm,
        fill: "none",
        stroke: colors[(i + 1) % colors.length],
        strokeWidth: 1,
        opacity: 0.4,
      });
    }
    geometry.push(1);
  } else {
    geometry.push(0);
  }
  
  // Layer 3: Radial lines (optional)
  if (random() > 0.4) {
    const rotation = random() * 360;
    const radials = generateRadialLines(cx, cy, maxRadius * 0.15, maxRadius * 0.7, radialCount, rotation, random);
    radials.forEach((d, i) => {
      paths.push({
        d,
        fill: "none",
        stroke: colors[2],
        strokeWidth: 0.5,
        opacity: 0.25,
      });
    });
    geometry.push(1);
  } else {
    geometry.push(0);
  }
  
  // Layer 4: Orbital ring with nodes
  if (random() > 0.5) {
    const orbitRadius = maxRadius * (0.5 + random() * 0.3);
    const { orbit, nodes } = generateOrbital(cx, cy, orbitRadius, orbitalNodes, 3 + random() * 4, random() * 360, random);
    
    paths.push({
      d: orbit,
      fill: "none",
      stroke: colors[0],
      strokeWidth: 0.75,
      opacity: 0.3,
    });
    
    nodes.forEach((d, i) => {
      paths.push({
        d,
        fill: colors[(i + 1) % colors.length],
        stroke: "none",
        opacity: 0.6,
      });
    });
    geometry.push(1);
  } else {
    geometry.push(0);
  }
  
  // Layer 5: Center focus element
  const centerType = Math.floor(random() * 3);
  geometry.push(centerType);
  
  if (centerType === 0) {
    // Dot
    const r = 4 + random() * 6;
    paths.push({
      d: `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`,
      fill: colors[0],
      stroke: "none",
      opacity: 0.8,
    });
  } else if (centerType === 1) {
    // Small polygon
    const d = generateSymmetricPolygon(cx, cy, 8 + random() * 6, baseSides, random() * 360, 0, random);
    paths.push({
      d,
      fill: colors[1],
      stroke: "none",
      opacity: 0.7,
    });
  } else {
    // Ring
    const r1 = 6 + random() * 4;
    const r2 = r1 + 2 + random() * 3;
    paths.push({
      d: `M ${cx - r2} ${cy} A ${r2} ${r2} 0 1 1 ${cx + r2} ${cy} A ${r2} ${r2} 0 1 1 ${cx - r2} ${cy}`,
      fill: "none",
      stroke: colors[2],
      strokeWidth: r2 - r1,
      opacity: 0.6,
    });
  }
  
  return {
    paths,
    viewBox: `0 0 ${size} ${size}`,
    geometry,
  };
}

export function generateSigilSeed(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let seed = "";
  for (let i = 0; i < 16; i++) {
    seed += chars[Math.floor(Math.random() * chars.length)];
  }
  return seed;
}

export function getTempoMultiplier(tempo?: string): number {
  switch (tempo) {
    case "slow": return 0.3;
    case "calm": return 0.5;
    case "steady": return 0.7;
    case "focused": return 0.8;
    case "curious": return 1.0;
    case "deliberate": return 0.6;
    case "energetic": return 1.2;
    default: return 0.7;
  }
}
