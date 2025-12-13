import type { NextRequest } from "next/server";
import { sendWorkflowExecution } from "@/inngest/utils";
import { NextResponse } from "next/server";

// Global status broadcaster
if (typeof global !== 'undefined') {
  global.nodeStatusBroadcaster = global.nodeStatusBroadcaster || new Map();
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");
    
    console.log("[Stripe Webhook] Received request for workflowId:", workflowId);
    
    if (!workflowId) {
      return Response.json(
        { success: false, error: "Missing required query parameter: workflowId" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    console.log("[Stripe Webhook] Request body:", body);
    
    const stripeData = {
      eventId: body.id,
      eventType: body.type,
      amount: body.data?.object?.amount,
      currency: body.data?.object?.currency,
      customerId: body.data?.object?.customer,
      raw: body,
    };
    
    console.log("[Stripe Webhook] Sending to Inngest:", { workflowId, stripeData });
    
    const result = await sendWorkflowExecution({
      workflowId,
      initialData: { stripe: stripeData },
    });
    
    console.log("[Stripe Webhook] Inngest result:", result);
    
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
    
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return Response.json(
      { success: false, error: "Failed to process Stripe event" },
      { status: 500 }
    );
  }
}