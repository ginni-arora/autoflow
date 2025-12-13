"use client";

import type { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { StripeTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { fetchStripeTriggerRealtimeToken } from "./actions";

export const StripeTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const handleOpenSettings = () => setDialogOpen(true);
    
    const nodeStatus = useNodeStatus({
      nodeId: props.id,
      channel: "stripe-trigger-execution",
      topic: "status",
      refreshToken: fetchStripeTriggerRealtimeToken,
    });
    
    console.log(`Node ${props.id} status:`, nodeStatus);

       
  return (
    <>
    <StripeTriggerDialog 
      open={dialogOpen}
      onOpenChange={setDialogOpen}
    />
      <BaseTriggerNode
        {...props}
        icon="/logos/stripe.svg"
        name="Stripe"
        description="When stripe event is captured"
         status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

StripeTriggerNode.displayName = "StripeTriggerNode";