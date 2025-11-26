// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://e4eaef4d0f9f89a2e3396c3821ea26cc@o4510429480812544.ingest.us.sentry.io/4510429510565888",

  integrations: [
  // Add the Vercel AI SDK integration to sentry.server.config.ts
  Sentry.vercelAIIntegration({
    recordInputs: true,
    recordOutputs: true,
  }),
  Sentry.consoleLoggingIntegration({
  levels: ["log", "warn", "error"],
}),

],


  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  sendDefaultPii: true,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  debug: false,
});
