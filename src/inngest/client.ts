import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime/middleware";

export const inngest = new Inngest({
  id: "autoflow",
  middleware: [realtimeMiddleware()],
  isDev: process.env.NODE_ENV === "development",
  ...(process.env.INNGEST_EVENT_KEY && { eventKey: process.env.INNGEST_EVENT_KEY }),
  ...(process.env.INNGEST_SIGNING_KEY && { signingKey: process.env.INNGEST_SIGNING_KEY }),
});
