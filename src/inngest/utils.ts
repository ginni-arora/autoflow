import { Connection, Node } from "@prisma/client";
import toposort from "toposort";

export const topologicalSort = ({
  nodes,
  connections,
}: {
  nodes: Node[];
  connections: Connection[];
}): Node[] => {
  // If no connections, return nodes as-is (they're all independent)
  if (connections.length === 0) {
    return nodes;
  }

  // Create edges array for toposort
  const edges: [string, string][] = [];
  const connectedNodeIds = new Set<string>();

  // Add connection edges
  for (const connection of connections) {
    edges.push([connection.fromNodeId, connection.toNodeId]);
    connectedNodeIds.add(connection.fromNodeId);
    connectedNodeIds.add(connection.toNodeId);
  }

  // Add self edges for nodes without connections
  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  try {
    // Perform topological sort
    const sortedNodeIds = toposort(edges);
    
    // Remove duplicates from self edges
    const uniqueSortedIds = [...new Set(sortedNodeIds)];
    
    // Map sorted IDs back to node objects
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    
    return uniqueSortedIds.map(id => nodeMap.get(id)!).filter(Boolean);
  } catch (error) {
    if (error instanceof Error && error.message.includes('cyclic')) {
      throw new Error('Workflow contains a cycle');
    }
    throw error;
  }
};
