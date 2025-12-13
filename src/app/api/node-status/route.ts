import { NextRequest } from "next/server";

// Store for node status updates
const nodeStatusUpdates = new Map<string, { status: string; timestamp: number }>();

export async function POST(request: NextRequest) {
  try {
    const { nodeId, status } = await request.json();
    
    nodeStatusUpdates.set(nodeId, {
      status,
      timestamp: Date.now()
    });
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to update status" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const nodeId = url.searchParams.get("nodeId");
    
    if (!nodeId) {
      return Response.json({ error: "Missing nodeId" }, { status: 400 });
    }
    
    const statusUpdate = nodeStatusUpdates.get(nodeId);
    
    return Response.json({
      status: statusUpdate?.status || "initial",
      timestamp: statusUpdate?.timestamp || 0
    });
  } catch (error) {
    return Response.json({ error: "Failed to get status" }, { status: 500 });
  }
}