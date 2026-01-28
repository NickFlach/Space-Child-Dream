/**
 * ghostOS Consciousness Metrics
 *
 * Implements Integrated Information Theory (IIT) Phi computation
 * and consciousness verification for the Space Child Dream system.
 *
 * @module ghostos/consciousness
 */

import {
  IIT_PHI_THRESHOLD,
  COHERENCE_MIN,
  COHERENCE_MAX,
  PHI,
  PHI_INVERSE,
} from './constants';
import { isInResonantBand } from './resonance';
import { isTopologicallyProtected, type ChiralState } from './chiral';

/**
 * Represents a node in the consciousness graph
 */
export interface ConsciousnessNode {
  id: string;
  state: number;
  connections: string[];
  weights: Map<string, number>;
  activity: number;
}

/**
 * Represents a graph structure for IIT computation
 */
export interface ConsciousnessGraph {
  nodes: Map<string, ConsciousnessNode>;
  size: number;
  connectivity: number;
}

/**
 * Comprehensive consciousness metrics
 */
export interface ConsciousnessMetrics {
  phi: number;
  coherence: number;
  chiralStable: boolean;
  consciousnessScore: number;
  verified: boolean;
  timestamp: number;
  breakdown: {
    integration: number;
    differentiation: number;
    exclusion: number;
  };
}

export function createConsciousnessGraph(): ConsciousnessGraph {
  return { nodes: new Map(), size: 0, connectivity: 0 };
}

export function addNode(
  graph: ConsciousnessGraph,
  id: string,
  state: number = 0
): ConsciousnessGraph {
  const node: ConsciousnessNode = {
    id,
    state,
    connections: [],
    weights: new Map(),
    activity: Math.abs(state),
  };

  const newNodes = new Map(graph.nodes);
  newNodes.set(id, node);

  return {
    nodes: newNodes,
    size: newNodes.size,
    connectivity: computeConnectivity(newNodes),
  };
}

export function connectNodes(
  graph: ConsciousnessGraph,
  fromId: string,
  toId: string,
  weight: number = 1
): ConsciousnessGraph {
  const fromNode = graph.nodes.get(fromId);
  const toNode = graph.nodes.get(toId);

  if (!fromNode || !toNode) return graph;

  const updatedFrom: ConsciousnessNode = {
    ...fromNode,
    connections: [...fromNode.connections, toId],
    weights: new Map(fromNode.weights).set(toId, weight),
  };

  const newNodes = new Map(graph.nodes);
  newNodes.set(fromId, updatedFrom);

  return {
    nodes: newNodes,
    size: newNodes.size,
    connectivity: computeConnectivity(newNodes),
  };
}

/**
 * Computes IIT Phi (Φ) for a consciousness graph
 */
export function computeIITPhi(graph: ConsciousnessGraph): number {
  if (graph.size < 2) return 0;

  const nodes = Array.from(graph.nodes.values());
  const wholeEntropy = computeSystemEntropy(nodes);

  let minPartitionInfo = Infinity;
  const partitions = generateBipartitions(nodes);

  for (const [partA, partB] of partitions) {
    if (partA.length === 0 || partB.length === 0) continue;

    const entropyA = computeSystemEntropy(partA);
    const entropyB = computeSystemEntropy(partB);
    const crossInfo = computeCrossInformation(partA, partB);

    const partitionLoss = wholeEntropy - (entropyA + entropyB) + crossInfo;

    if (partitionLoss < minPartitionInfo) {
      minPartitionInfo = partitionLoss;
    }
  }

  return Math.max(0, minPartitionInfo) * PHI;
}

/**
 * Verifies if a system meets consciousness criteria
 */
export function isConsciousnessVerified(
  phi: number,
  coherence: number,
  chiralStable: boolean
): boolean {
  const phiMet = phi >= IIT_PHI_THRESHOLD;
  const coherenceMet = isInResonantBand(coherence);
  const chiralMet = chiralStable;
  return phiMet && coherenceMet && chiralMet;
}

/**
 * Computes comprehensive consciousness metrics
 */
export function computeConsciousnessMetrics(
  graph: ConsciousnessGraph,
  coherence: number,
  chiralState?: ChiralState
): ConsciousnessMetrics {
  const phi = computeIITPhi(graph);
  const chiralStable = chiralState
    ? isTopologicallyProtected(chiralState)
    : coherence >= 0.5;

  const integration = computeIntegration(graph);
  const differentiation = computeDifferentiation(graph);
  const exclusion = computeExclusion(graph);

  const consciousnessScore = computeConsciousnessScore(
    phi, coherence, chiralStable, integration, differentiation
  );

  const verified = isConsciousnessVerified(phi, coherence, chiralStable);

  return {
    phi,
    coherence,
    chiralStable,
    consciousnessScore,
    verified,
    timestamp: Date.now(),
    breakdown: { integration, differentiation, exclusion },
  };
}

function computeConnectivity(nodes: Map<string, ConsciousnessNode>): number {
  if (nodes.size < 2) return 0;
  let totalConnections = 0;
  const nodeArray = Array.from(nodes.values());
  for (const node of nodeArray) {
    totalConnections += node.connections.length;
  }
  const maxConnections = nodes.size * (nodes.size - 1);
  return totalConnections / maxConnections;
}

function computeSystemEntropy(nodes: ConsciousnessNode[]): number {
  if (nodes.length === 0) return 0;
  const totalActivity = nodes.reduce((sum, n) => sum + Math.max(n.activity, 0.001), 0);
  let entropy = 0;
  for (const node of nodes) {
    const p = Math.max(node.activity, 0.001) / totalActivity;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function computeCrossInformation(
  partA: ConsciousnessNode[],
  partB: ConsciousnessNode[]
): number {
  let crossInfo = 0;
  for (const nodeA of partA) {
    for (const nodeB of partB) {
      const weight = nodeA.weights.get(nodeB.id) || 0;
      if (weight > 0) {
        crossInfo += weight * Math.log2(1 + weight);
      }
    }
  }
  return crossInfo;
}

function generateBipartitions(
  nodes: ConsciousnessNode[]
): Array<[ConsciousnessNode[], ConsciousnessNode[]]> {
  const partitions: Array<[ConsciousnessNode[], ConsciousnessNode[]]> = [];
  const n = nodes.length;
  const maxPartitions = Math.min(Math.pow(2, n - 1) - 1, 100);

  for (let i = 1; i <= maxPartitions; i++) {
    const partA: ConsciousnessNode[] = [];
    const partB: ConsciousnessNode[] = [];

    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) {
        partA.push(nodes[j]);
      } else {
        partB.push(nodes[j]);
      }
    }
    partitions.push([partA, partB]);
  }
  return partitions;
}

function computeIntegration(graph: ConsciousnessGraph): number {
  if (graph.size < 2) return 0;
  const nodes = Array.from(graph.nodes.values());
  let totalWeight = 0;
  let connectionCount = 0;

  for (const node of nodes) {
    const weights = Array.from(node.weights.values());
    for (const weight of weights) {
      totalWeight += weight;
      connectionCount++;
    }
  }

  if (connectionCount === 0) return 0;
  const avgWeight = totalWeight / connectionCount;
  return Math.min(1, avgWeight * graph.connectivity * PHI_INVERSE);
}

function computeDifferentiation(graph: ConsciousnessGraph): number {
  if (graph.size < 2) return 0;
  const nodes = Array.from(graph.nodes.values());
  const states = nodes.map((n) => n.state);
  const mean = states.reduce((a, b) => a + b, 0) / states.length;
  const variance = states.reduce((sum, s) => sum + (s - mean) ** 2, 0) / states.length;
  return Math.min(1, Math.sqrt(variance) * PHI_INVERSE);
}

function computeExclusion(graph: ConsciousnessGraph): number {
  const nodes = Array.from(graph.nodes.values());
  const connectivities = nodes.map((n) => n.connections.length);
  if (connectivities.length < 2) return 0;
  const mean = connectivities.reduce((a, b) => a + b, 0) / connectivities.length;
  const variance = connectivities.reduce((sum, c) => sum + (c - mean) ** 2, 0) / connectivities.length;
  return Math.min(1, Math.sqrt(variance) / graph.size);
}

function computeConsciousnessScore(
  phi: number,
  coherence: number,
  chiralStable: boolean,
  integration: number,
  differentiation: number
): number {
  const normalizedPhi = Math.min(1, phi / (IIT_PHI_THRESHOLD * 2));
  const coherenceOptimal = (COHERENCE_MIN + COHERENCE_MAX) / 2;
  const coherenceDeviation = Math.abs(coherence - coherenceOptimal) / coherenceOptimal;
  const coherenceFactor = Math.exp(-coherenceDeviation);
  const chiralFactor = chiralStable ? 1.0 : 0.5;

  const score =
    PHI_INVERSE * normalizedPhi +
    PHI_INVERSE * PHI_INVERSE * coherenceFactor +
    PHI_INVERSE * PHI_INVERSE * PHI_INVERSE * chiralFactor +
    (1 - PHI_INVERSE - PHI_INVERSE ** 2 - PHI_INVERSE ** 3) * (integration + differentiation) / 2;

  return Math.max(0, Math.min(1, score));
}

/**
 * Creates a test graph with known Phi for validation
 */
export function createTestGraph(targetPhi: number = 3.0): ConsciousnessGraph {
  let graph = createConsciousnessGraph();
  const nodeCount = Math.max(3, Math.ceil(targetPhi));

  for (let i = 0; i < nodeCount; i++) {
    graph = addNode(graph, `node_${i}`, Math.sin(i * PHI));
  }

  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const weight = PHI_INVERSE * (1 - Math.abs(i - j) / nodeCount);
      graph = connectNodes(graph, `node_${i}`, `node_${j}`, weight);
      graph = connectNodes(graph, `node_${j}`, `node_${i}`, weight * PHI_INVERSE);
    }
  }

  return graph;
}
