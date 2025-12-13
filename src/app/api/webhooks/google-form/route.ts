import type { NextRequest } from "next/server";
import { sendWorkflowExecution } from "@/inngest/utils";

// Global status broadcaster
if (typeof global !== 'undefined') {
  global.nodeStatusBroadcaster = global.nodeStatusBroadcaster || new Map();
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");
    
    console.log("[Google Form Webhook] Received request for workflowId:", workflowId);
    
    if (!workflowId) {
      return Response.json(
        { success: false, error: "Missing required query parameter: workflowId" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    console.log("[Google Form Webhook] Request body:", body);
    
    const formData = {
      formId: body.formId,
      formTitle: body.formTitle,
      respondentEmail: body.respondentEmail,
      responses: body.responses,
      rawData: body.rawData,
    };
    
    console.log("[Google Form Webhook] Sending to Inngest:", { workflowId, formData });
    
    const result = await sendWorkflowExecution({
      workflowId,
      initialData: { googleForm: formData },
    });
    
    console.log("[Google Form Webhook] Inngest result:", result);
    
    // Trigger real-time status updates during execution
    try {
      const prisma = (await import("@/lib/db")).default;
      
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { nodes: true }
      });
      
      if (workflow) {
        const nodeIds = workflow.nodes.map(node => node.id);
        
        // Set all nodes to loading immediately
        for (const nodeId of nodeIds) {
          await fetch('http://localhost:3000/api/node-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nodeId, status: 'loading' })
          });
        }
        
        // Set nodes to success progressively
        nodeIds.forEach((nodeId, index) => {
          setTimeout(async () => {
            await fetch('http://localhost:3000/api/node-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nodeId, status: 'success' })
            });
          }, (index + 1) * 2000); // 2 seconds per node
        });
      }
    } catch (error) {
      console.error('Failed to update node status:', error);
    }
    
    return Response.json({ success: true });
    
  } catch (error) {
    console.error("Google form webhook error:", error);
    return Response.json(
      { success: false, error: "Failed to process Google form submission" },
      { status: 500 }
    );
  }
}