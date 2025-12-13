import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import { Handlebars } from "@/lib/handlebars";
import { httpRequestChannel } from "@/inngest/channels/http-request";

type HttpRequestData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  context,
  step,
  publish,
  nodeId,
}) => {
  // Helper function to set error status
  const setErrorStatus = async (message: string) => {
    try {
      await fetch('http://localhost:3001/api/node-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, status: 'error' })
      });
    } catch (statusError: unknown) {
      console.error('Failed to update status to error:', statusError);
    }
    await publish({ channel: "http-request-execution", topic: "status", data: { nodeId, status: "error" } });
    throw new NonRetriableError(message);
  };

  // Check if variable name is configured
  if (!data.variableName) {
    await setErrorStatus("Variable name not configured");
  }

  // Check if endpoint is configured
  if (!data.endpoint) {
    await setErrorStatus("HTTP request node: no endpoint configured");
  }

  // Check if method is configured
  if (!data.method) {
    await setErrorStatus("Method not configured");
  }

  // Update status to loading via API
  try {
    await fetch('http://localhost:3001/api/node-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId, status: 'loading' })
    });
  } catch (statusError: unknown) {
    console.error('Failed to update status to loading:', statusError);
  }
  
  // Publish loading status
  await publish({ channel: "http-request-execution", topic: "status", data: { nodeId, status: "loading" } });

  try {
    const result = await step.run("http-request", async () => {
      const method = data.method;
      const endpoint = Handlebars.compile(data.endpoint)(context);
      
      console.log("ENDPOINT:", endpoint);
      
      const options: KyOptions = {
        method,
      };

      // Add body for POST, PUT, PATCH requests
      if (["POST", "PUT", "PATCH"].includes(method)) {
        if (data.body) {
          const resolved = Handlebars.compile(data.body)(context);
          console.log("RESOLVED BODY:", resolved);
          options.body = resolved;
        } else {
          options.body = "{}";
        }
        options.headers = {
          "content-type": "application/json",
        };
      }

      const response = await ky(endpoint, options);
      
      // Handle response based on content type
      const contentType = response.headers.get("content-type");
      const responseData = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const responsePayload = {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      };

      return {
        ...context,
        [data.variableName]: {
          httpResponse: responsePayload,
        },
      };
    });

    // Update status to success via API
    try {
      await fetch('http://localhost:3001/api/node-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, status: 'success' })
      });
    } catch (statusError: unknown) {
      console.error('Failed to update status to success:', statusError);
    }
    
    // Publish success status
    await publish({ channel: "http-request-execution", topic: "status", data: { nodeId, status: "success" } });
    return result;
  } catch (error: unknown) {
    // Update status to error via API
    try {
      await fetch('http://localhost:3001/api/node-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, status: 'error' })
      });
    } catch (statusError: unknown) {
      console.error('Failed to update status to error:', statusError);
    }
    
    await publish({ channel: "http-request-execution", topic: "status", data: { nodeId, status: "error" } });
    throw error;
  }
};