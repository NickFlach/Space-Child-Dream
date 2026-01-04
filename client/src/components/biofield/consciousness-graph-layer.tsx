/**
 * Layer 4 — Consciousness Graph
 * 
 * Replaces timelines, feeds, and histories with a domain graph.
 * Nodes strengthen through depth, not frequency.
 * Edges form through synthesis, not repetition.
 * The graph exists primarily for self-witnessing.
 * No scores. No comparisons. No visibility pressure.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  CONSCIOUSNESS_DOMAINS,
  type ConsciousnessDomain,
  type ConsciousnessNode,
  type ConsciousnessEdge,
} from "@shared/models/biofield-profile";

interface ConsciousnessGraphLayerProps {
  nodes: ConsciousnessNode[];
  edges: ConsciousnessEdge[];
  onDomainEngage?: (domain: ConsciousnessDomain) => void;
}

export function ConsciousnessGraphLayer({
  nodes,
  edges,
  onDomainEngage,
}: ConsciousnessGraphLayerProps) {
  // Create a map for quick node lookup
  const nodeMap = useMemo(() => {
    const map = new Map<ConsciousnessDomain, ConsciousnessNode>();
    nodes.forEach(node => map.set(node.domain as ConsciousnessDomain, node));
    return map;
  }, [nodes]);

  // Calculate max depth for normalization
  const maxDepth = useMemo(() => {
    return Math.max(1, ...nodes.map(n => n.depth || 0));
  }, [nodes]);

  // Calculate positions for radial layout
  const domainPositions = useMemo(() => {
    const domains = Object.keys(CONSCIOUSNESS_DOMAINS) as ConsciousnessDomain[];
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    
    const positions: Record<ConsciousnessDomain, { x: number; y: number }> = {} as any;
    
    domains.forEach((domain, i) => {
      const angle = (i / domains.length) * Math.PI * 2 - Math.PI / 2;
      positions[domain] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });
    
    return positions;
  }, []);

  const domains = Object.entries(CONSCIOUSNESS_DOMAINS) as [ConsciousnessDomain, typeof CONSCIOUSNESS_DOMAINS[ConsciousnessDomain]][];

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-xl p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-display font-semibold text-white">Consciousness Graph</h3>
          <p className="text-sm text-gray-500">Your domain of engagement, for self-witnessing</p>
        </div>

        {/* Graph Visualization */}
        <div className="flex justify-center">
          <svg viewBox="0 0 300 300" className="w-full max-w-md">
            {/* Edges */}
            {edges.map((edge, i) => {
              const source = domainPositions[edge.sourceDomain as ConsciousnessDomain];
              const target = domainPositions[edge.targetDomain as ConsciousnessDomain];
              if (!source || !target) return null;
              
              const strength = edge.strength || 0;
              const opacity = Math.min(0.6, 0.1 + strength * 0.5);
              
              return (
                <motion.line
                  key={`${edge.sourceDomain}-${edge.targetDomain}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="url(#edgeGradient)"
                  strokeWidth={1 + strength * 2}
                  opacity={opacity}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              );
            })}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* Nodes */}
            {domains.map(([domain, config]) => {
              const pos = domainPositions[domain];
              const node = nodeMap.get(domain);
              const depth = node?.depth || 0;
              const normalizedDepth = depth / maxDepth;
              const nodeRadius = 8 + normalizedDepth * 12;
              const opacity = 0.3 + normalizedDepth * 0.7;

              return (
                <motion.g
                  key={domain}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  {/* Glow effect */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 8}
                    fill={config.color}
                    opacity={opacity * 0.2}
                    filter="blur(4px)"
                  />
                  
                  {/* Main node */}
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius}
                    fill={config.color}
                    opacity={opacity}
                    className="cursor-pointer"
                    whileHover={{ scale: 1.2 }}
                    onClick={() => onDomainEngage?.(domain)}
                  />
                  
                  {/* Label */}
                  <text
                    x={pos.x}
                    y={pos.y + nodeRadius + 14}
                    textAnchor="middle"
                    className="fill-gray-400 text-[10px] font-mono"
                  >
                    {config.name}
                  </text>
                </motion.g>
              );
            })}

            {/* Center point */}
            <circle cx="150" cy="150" r="3" fill="white" opacity="0.3" />
          </svg>
        </div>

        {/* Domain List (alternative view) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {domains.map(([domain, config]) => {
            const node = nodeMap.get(domain);
            const depth = node?.depth || 0;
            const normalizedDepth = depth / maxDepth;
            
            return (
              <motion.button
                key={domain}
                onClick={() => onDomainEngage?.(domain)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-3 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 transition-all text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: config.color,
                      opacity: 0.3 + normalizedDepth * 0.7,
                    }}
                  />
                  <span className="text-sm text-gray-300">{config.name}</span>
                </div>
                
                {/* Depth indicator */}
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: config.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${normalizedDepth * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-600 text-center">
          Depth grows through quality engagement. No metrics are visible to others.
        </p>
      </div>
    </Card>
  );
}

/**
 * Compact Consciousness Summary
 * Shows top domains for quick reference
 */
export function ConscioussnessCompact({
  nodes,
  limit = 3,
}: {
  nodes: ConsciousnessNode[];
  limit?: number;
}) {
  const topNodes = useMemo(() => {
    return [...nodes]
      .sort((a, b) => (b.depth || 0) - (a.depth || 0))
      .slice(0, limit);
  }, [nodes, limit]);

  if (topNodes.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {topNodes.map(node => {
        const domain = node.domain as ConsciousnessDomain;
        const config = CONSCIOUSNESS_DOMAINS[domain];
        if (!config) return null;
        
        return (
          <div
            key={domain}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5"
            title={config.name}
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-xs text-gray-400">{config.name}</span>
          </div>
        );
      })}
    </div>
  );
}
