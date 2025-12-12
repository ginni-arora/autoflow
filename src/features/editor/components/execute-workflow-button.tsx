import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { FlaskConicalIcon } from "lucide-react";

export const ExecuteWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
    const executeworkflow = useExecuteWorkflow();

    const handleExecute = () => {
        executeworkflow.mutate({ id: workflowId });
    };
  return (
    <Button size="lg" onClick={handleExecute} disabled={executeworkflow.isPending}>
      <FlaskConicalIcon className="size-4" />
      Execute workflow
    </Button>
  );
};
