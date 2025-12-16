import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

export function useNodeData<T = Record<string, unknown>>() {
  const { getNode, setNodes } = useReactFlow();
  
  // Get the current node ID from React Flow context
  // This is a simplified version - in a real implementation you'd need to pass the node ID
  const nodeId = "current-node"; // This should be passed from the node component
  
  const node = getNode(nodeId);
  const data = node?.data as T;

  const updateNodeData = useCallback((newData: Partial<T>) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [nodeId, setNodes]);

  return {
    data,
    updateNodeData,
  };
}