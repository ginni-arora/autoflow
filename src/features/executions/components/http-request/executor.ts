import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";

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

  // Check if method is configured
  if (!data.method) {
    throw new NonRetriableError("Method not configured");
  }

  const result = await step.run("http-request", async () => {
    // Register handlebars helper for JSON stringification
    Handlebars.registerHelper("json", (context) => {
      const stringified = JSON.stringify(context, null, 2);
      return new Handlebars.SafeString(stringified);
    });

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

  return result;
};