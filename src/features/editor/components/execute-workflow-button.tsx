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
        
        // Immediately set all nodes to loading
        nodes.forEach(node => {
            window.postMessage({
                type: 'node-status',
                nodeId: node.id,
                status: 'loading'
            }, '*');
        });
        
        // Set timeout to show error if execution takes too long
        const timeoutId = setTimeout(() => {
            nodes.forEach(node => {
                window.postMessage({
                    type: 'node-status',
                    nodeId: node.id,
                    status: 'error'
                }, '*');
            });
        }, 10000); // 10 seconds timeout
        
        executeworkflow.mutate({ 
            id: workflowId,
            onSettled: () => {
                clearTimeout(timeoutId);
            }
        });
    };
  return (
    <Button size="lg" onClick={handleExecute} disabled={executeworkflow.isPending}>
      <FlaskConicalIcon className="size-4" />
      Execute workflow
    </Button>
  );
};
