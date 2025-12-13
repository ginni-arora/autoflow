"use client";

import { useEffect, useState } from "react";
import { NodeStatus } from "@/components/react-flow/node-status-indicator";
import { subscribe } from "@inngest/realtime";

// Listen for global status updates
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'node-status') {
      updateNodeStatus(event.data.nodeId, event.data.status);
    }
  });
}

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
    let unsubscribe: (() => void) | null = null;

    // Add listener for this node
    if (!statusListeners.has(nodeId)) {
      statusListeners.set(nodeId, new Set());
    }
    const listeners = statusListeners.get(nodeId)!;
    listeners.add(setStatus);

    // Setup polling for status updates
    const setupRealtime = async () => {
      // Skip realtime and go directly to polling
      startPolling();
    };
    
    // Polling fallback for status updates
    const startPolling = () => {
      const pollInterval = setInterval(async () => {
        try {
          // Check for status updates via API
          const response = await fetch(`/api/node-status?nodeId=${nodeId}`);
          if (response.ok) {
            const { status: newStatus } = await response.json();
            if (newStatus && newStatus !== status) {
              updateNodeStatus(nodeId, newStatus);
            }
          }
        } catch (error) {
          // Ignore polling errors
        }
      }, 500); // Poll every 500ms for faster updates
      
      // Store interval for cleanup
      unsubscribe = () => clearInterval(pollInterval);
    };
    
    // Start polling immediately as fallback
    startPolling();

    setupRealtime();

    return () => {
      // Remove listener
      listeners.delete(setStatus);
      if (listeners.size === 0) {
        statusListeners.delete(nodeId);
      }
      
      // Unsubscribe from realtime
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [nodeId, channel, topic, refreshToken]);

  return status;
}