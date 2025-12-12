import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { FlaskConicalIcon } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { updateNodeStatus } from "@/features/executions/hooks/use-node-status";

export const ExecuteWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
    const executeworkflow = useExecuteWorkflow();
    const { getNodes } = useReactFlow();

    const handleExecute = () => {
        const nodes = getNodes();
        const nodeIds = nodes.map(node => node.id);
        
        // Update all nodes to loading status immediately
        nodeIds.forEach(nodeId => {
            updateNodeStatus(nodeId, "loading");
        });
        
        // Simulate execution progress
        nodeIds.forEach((nodeId, index) => {
            setTimeout(() => {
                updateNodeStatus(nodeId, "success");
            }, (index + 1) * 2000); // 2 seconds per node
        });
        
        executeworkflow.mutate({ id: workflowId });
    };
  return (
    <Button size="lg" onClick={handleExecute} disabled={executeworkflow.isPending}>
      <FlaskConicalIcon className="size-4" />
      Execute workflow
    </Button>
  );
};
