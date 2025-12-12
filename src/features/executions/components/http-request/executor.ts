import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  context,
  step,
}) => {
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
    }

    const response = await ky(endpoint, options);
    
    // Handle response based on content type
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    return {
      ...context,
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };
  });

  return result;
};