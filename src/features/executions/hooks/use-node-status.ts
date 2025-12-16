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
  console.log(`Updating node ${nodeId} to status: ${status}`);
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
    let pollInterval: NodeJS.Timeout | null = null;

    // Add listener for this node
    if (!statusListeners.has(nodeId)) {
      statusListeners.set(nodeId, new Set());
    }
    const listeners = statusListeners.get(nodeId)!;
    listeners.add(setStatus);

    // Setup real-time subscription with fallback polling
    const setupConnection = async () => {
      try {
        const token = await refreshToken();
        
        // Try real-time first
        unsubscribe = subscribe({
          url: token.url,
          topics: [`${channel}:${topic}`],
          onMessage: (message) => {
            console.log('Received status update:', message);
            if (message.data?.nodeId === nodeId) {
              updateNodeStatus(nodeId, message.data.status);
            }
          },
          onError: (error) => {
            console.error('Realtime subscription error:', error);
            // Start polling as fallback
            startPolling();
          },
        });
      } catch (error) {
        console.error('Failed to setup realtime subscription:', error);
        // Start polling as fallback
        startPolling();
      }
    };

    // Polling fallback
    const startPolling = () => {
      if (pollInterval) return; // Already polling
      
      pollInterval = setInterval(() => {
        // Check Inngest dashboard for status updates
        fetch('http://localhost:8288/api/runs')
          .then(res => res.json())
          .then(data => {
            // This is a simplified check - in real implementation
            // you'd parse the actual run data
            console.log('Polling Inngest status...');
          })
          .catch(() => {
            // Ignore polling errors
          });
      }, 2000);
    };

    setupConnection();

    return () => {
      // Remove listener
      listeners.delete(setStatus);
      if (listeners.size === 0) {
        statusListeners.delete(nodeId);
      }
      
      // Cleanup
      if (unsubscribe) {
        unsubscribe();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [nodeId, channel, topic, refreshToken]);

  return status;
}