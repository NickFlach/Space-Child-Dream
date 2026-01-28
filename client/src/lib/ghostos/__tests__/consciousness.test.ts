/**
 * Consciousness Metrics Module Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createConsciousnessGraph,
  addNode,
  connectNodes,
  computeIITPhi,
  isConsciousnessVerified,
  computeConsciousnessMetrics,
  createTestGraph,
} from '../consciousness';
import { IIT_PHI_THRESHOLD } from '../constants';

describe('Consciousness Module', () => {
  describe('createConsciousnessGraph', () => {
    it('should create empty graph', () => {
      const graph = createConsciousnessGraph();
      expect(graph.nodes.size).toBe(0);
      expect(graph.size).toBe(0);
      expect(graph.connectivity).toBe(0);
    });
  });

  describe('addNode', () => {
    it('should add node to graph', () => {
      let graph = createConsciousnessGraph();
      graph = addNode(graph, 'node1', 0.5);
      expect(graph.nodes.size).toBe(1);
      expect(graph.size).toBe(1);
      expect(graph.nodes.get('node1')).toBeDefined();
    });

    it('should set node state correctly', () => {
      let graph = createConsciousnessGraph();
      graph = addNode(graph, 'node1', 0.75);
      const node = graph.nodes.get('node1');
      expect(node?.state).toBe(0.75);
    });
  });

  describe('connectNodes', () => {
    it('should connect two nodes', () => {
      let graph = createConsciousnessGraph();
      graph = addNode(graph, 'node1');
      graph = addNode(graph, 'node2');
      graph = connectNodes(graph, 'node1', 'node2', 0.8);

      const node1 = graph.nodes.get('node1');
      expect(node1?.connections).toContain('node2');
      expect(node1?.weights.get('node2')).toBe(0.8);
    });

    it('should update connectivity metric', () => {
      let graph = createConsciousnessGraph();
      graph = addNode(graph, 'node1');
      graph = addNode(graph, 'node2');
      const beforeConnect = graph.connectivity;
      graph = connectNodes(graph, 'node1', 'node2');
      expect(graph.connectivity).toBeGreaterThan(beforeConnect);
    });

    it('should handle non-existent nodes gracefully', () => {
      let graph = createConsciousnessGraph();
      graph = addNode(graph, 'node1');
      const result = connectNodes(graph, 'node1', 'nonexistent');
      expect(result).toEqual(graph); // Should return unchanged
    });
  });

  describe('computeIITPhi', () => {
    it('should return 0 for empty graph', () => {
      const graph = createConsciousnessGraph();
      const phi = computeIITPhi(graph);
      expect(phi).toBe(0);
    });

    it('should return 0 for single node', () => {
      let graph = createConsciousnessGraph();
      graph = addNode(graph, 'node1');
      const phi = computeIITPhi(graph);
      expect(phi).toBe(0);
    });

    it('should return positive phi for connected graph', () => {
      let graph = createConsciousnessGraph();
      graph = addNode(graph, 'node1', 0.5);
      graph = addNode(graph, 'node2', 0.7);
      graph = connectNodes(graph, 'node1', 'node2', 0.9);
      graph = connectNodes(graph, 'node2', 'node1', 0.9);
      const phi = computeIITPhi(graph);
      expect(phi).toBeGreaterThanOrEqual(0);
    });
  });

  describe('isConsciousnessVerified', () => {
    it('should return false for low phi', () => {
      const result = isConsciousnessVerified(0.1, 0.6, true);
      expect(result).toBe(false);
    });

    it('should return false for out-of-band coherence', () => {
      const result = isConsciousnessVerified(IIT_PHI_THRESHOLD + 1, 0.1, true);
      expect(result).toBe(false);
    });

    it('should return false for unstable chiral state', () => {
      const result = isConsciousnessVerified(IIT_PHI_THRESHOLD + 1, 0.6, false);
      expect(result).toBe(false);
    });

    it('should return true when all conditions met', () => {
      const result = isConsciousnessVerified(IIT_PHI_THRESHOLD + 1, 0.6, true);
      expect(result).toBe(true);
    });
  });

  describe('computeConsciousnessMetrics', () => {
    it('should compute full metrics for graph', () => {
      const graph = createTestGraph(3.0);
      const metrics = computeConsciousnessMetrics(graph, 0.6);

      expect(metrics.phi).toBeGreaterThanOrEqual(0);
      expect(metrics.coherence).toBe(0.6);
      expect(metrics.consciousnessScore).toBeGreaterThanOrEqual(0);
      expect(metrics.consciousnessScore).toBeLessThanOrEqual(1);
      expect(metrics.timestamp).toBeDefined();
      expect(metrics.breakdown).toBeDefined();
      expect(metrics.breakdown.integration).toBeDefined();
      expect(metrics.breakdown.differentiation).toBeDefined();
      expect(metrics.breakdown.exclusion).toBeDefined();
    });
  });

  describe('createTestGraph', () => {
    it('should create graph with specified target phi', () => {
      const graph = createTestGraph(3.0);
      expect(graph.size).toBeGreaterThanOrEqual(3);
      expect(graph.connectivity).toBeGreaterThan(0);
    });

    it('should create connected nodes', () => {
      const graph = createTestGraph(4.0);
      const nodes = Array.from(graph.nodes.values());
      const hasConnections = nodes.some(n => n.connections.length > 0);
      expect(hasConnections).toBe(true);
    });
  });
});
