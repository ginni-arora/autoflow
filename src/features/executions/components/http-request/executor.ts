import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  context,
  step,
}) => {
  // Check if variable name is configured
  if (!data.variableName) {
    // TODO: publish error state for HTTP request
    throw new NonRetriableError("Variable name not configured");
  }

  // Check if endpoint is configured
  if (!data.endpoint) {
    // TODO: publish error state for HTTP request
    throw new NonRetriableError("HTTP request node: no endpoint configured");
  }

  const result = await step.run("http-request", async () => {
    const method = data.method || "GET";
    const endpoint = data.endpoint!;
    
    const options: KyOptions = {
      method,
    };

    // Add body for POST, PUT, PATCH requests
    if (["POST", "PUT", "PATCH"].includes(method) && data.body) {
      options.body = data.body;
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

    if (data.variableName) {
      return {
        ...context,
        [data.variableName]: {
          httpResponse: responsePayload,
        },
      };
    }

    // Fallback for backwards compatibility
    return {
      ...context,
      httpResponse: responsePayload,
    };
  });

  return result;
};