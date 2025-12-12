import { useEffect, useState } from "react";
import { NodeStatus } from "@/components/react-flow/node-status-indicator";

interface UseNodeStatusOptions {
  nodeId: string;
  channel: string;
  topic: string;
  refreshToken: () => Promise<any>;
}

// Global status store for nodes
const nodeStatusStore = new Map<string, NodeStatus>();
const statusListeners = new Map<string, Set<(status: NodeStatus) => void>>();

// Function to update node status globally
export function updateNodeStatus(nodeId: string, status: NodeStatus) {
  nodeStatusStore.set(nodeId, status);
  const listeners = statusListeners.get(nodeId);
  if (listeners) {
    listeners.forEach(listener => listener(status));
  }
}

// Function to simulate status changes during workflow execution
export function simulateWorkflowExecution(nodeIds: string[]) {
  nodeIds.forEach((nodeId, index) => {
    // Set loading status
    setTimeout(() => {
      updateNodeStatus(nodeId, "loading");
    }, index * 1000);
    
    // Set success status after 2 seconds
    setTimeout(() => {
      updateNodeStatus(nodeId, "success");
    }, (index * 1000) + 2000);
  });
}

export function useNodeStatus({
  nodeId,
  channel,
  topic,
  refreshToken,
}: UseNodeStatusOptions) {
  const [status, setStatus] = useState<NodeStatus>(
    nodeStatusStore.get(nodeId) || "initial"
  );

  useEffect(() => {
    // Add listener for this node
    if (!statusListeners.has(nodeId)) {
      statusListeners.set(nodeId, new Set());
    }
    const listeners = statusListeners.get(nodeId)!;
    listeners.add(setStatus);

    // Try to setup realtime subscription as fallback
    const setupRealtime = async () => {
      try {
        // This is a simplified approach - in production you'd want proper realtime
        // For now, we'll rely on the global status store
        console.log(`Setting up realtime for node ${nodeId} on channel ${channel}`);
      } catch (error) {
        console.error('Realtime setup failed:', error);
      }
    };

    setupRealtime();

    return () => {
      // Remove listener
      listeners.delete(setStatus);
      if (listeners.size === 0) {
        statusListeners.delete(nodeId);
      }
    };
  }, [nodeId, channel, topic, refreshToken]);

  return status;
}