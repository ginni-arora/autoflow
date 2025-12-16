"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { OpenAIFormValues, OpenAIDialog } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchOpenAIRealtimeToken } from "./actions";

type OpenAINodeData = {
  variableName?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

type OpenAINodeType = Node<OpenAINodeData>;

export const OpenAINode = memo((props: NodeProps<OpenAINodeType>) => {
  const[dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "openai-execution",
    topic: "status",
    refreshToken: fetchOpenAIRealtimeToken,
  });

   const handleOpenSettings = () => setDialogOpen(true);
   const handleSubmit = (values: OpenAIFormValues) =>{
  
  setNodes((nodes) =>
  nodes.map((node) => {
    if (node.id === props.id) {
      return {
        ...node,
        data: {
          ...node.data,
          ...values,
        }
      }
    }

    return node;
  })
);


  
};

    const nodeData = props.data ;

  const description = nodeData.userPrompt
    ? `GPT-4: ${nodeData.userPrompt.slice(0, 50)}...`
    : "Not configured";

   

  return (
    <>
    <OpenAIDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  onSubmit = {handleSubmit}
  defaultValues={nodeData}
  
/>

    <BaseExecutionNode
      {...props}
      icon="/logos/openai.svg"
      name="OpenAI"
      status={nodeStatus}
      description={description}
      onSettings={handleOpenSettings}
      onDoubleClick={handleOpenSettings}
    />
  </>
)
});

OpenAINode.displayName = "OpenAINode";


