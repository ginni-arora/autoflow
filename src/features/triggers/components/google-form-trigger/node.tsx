"use client";

import type { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { GoogleFormTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { fetchGoogleFormTriggerRealtimeToken } from "./actions";

export const GoogleFormTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const handleOpenSettings = () => setDialogOpen(true);
    
    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: "google-form-trigger-execution",
      topic: "status",
      refreshToken: fetchGoogleFormTriggerRealtimeToken,
    });
    
    console.log(`Node ${props.id} status:`, nodeStatus);

       
  return (
    <>
    <GoogleFormTriggerDialog 
      open={dialogOpen}
      onOpenChange={setDialogOpen}
    />
      <BaseTriggerNode
        {...props}
        icon="/logos/googleform.svg"
        name="Google Form"
        description="When form is submitted"
         status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

GoogleFormTriggerNode.displayName = "GoogleFormTriggerNode";
