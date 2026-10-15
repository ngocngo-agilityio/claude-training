import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { registerApiRoute, type ContextWithMastra } from "@mastra/core/server";
import { AGENT_IDS } from "@repo/shared/constants/agents";
import { API_PATHS } from "@repo/shared/constants/api";
import {
  REQUEST_CONTEXT_HEADERS,
  REQUEST_CONTEXT_KEYS,
} from "@repo/shared/constants/request-context";
import {
  getCurrentDateTime,
  normalizeTimezone,
} from "@/lib/utils/request-context";
import { getAuthenticatedUserId } from "@/mastra/auth/authentication-middleware";
import { RestaurantMastraAgent } from "@/mastra/copilotkit-agent";
import { copilotKitRunner } from "@/mastra/copilotkit-runner";

/** Connect chat to a streaming adapter created per request. */
export const copilotKitRoute = registerApiRoute(API_PATHS.COPILOTKIT, {
  // Accept all HTTP methods for CopilotKit.
  method: "ALL",
  handler: async (context: ContextWithMastra) => {
    // Reuse the verified user and token from middleware.
    const requestContext = context.get("requestContext");

    // Normalize the user's timezone from the request header.
    const timezone = normalizeTimezone(
      context.req.header(REQUEST_CONTEXT_HEADERS.TIMEZONE),
    );

    // Set local time for booking checks and dates like "today".
    const now = getCurrentDateTime(timezone);
    requestContext.set(REQUEST_CONTEXT_KEYS.TIMEZONE, timezone);
    requestContext.set(REQUEST_CONTEXT_KEYS.CURRENT_DATE, now.date);
    requestContext.set(REQUEST_CONTEXT_KEYS.CURRENT_TIME, now.time);

    // Create a per-request adapter that converts Mastra output to AG-UI events.
    const agentId = AGENT_IDS.RESTAURANT_RESERVATION;
    const adapter = new RestaurantMastraAgent({
      agentId,
      agent: context.get("mastra").getAgent(agentId),
      // Scope agent memory to the signed-in user.
      resourceId: getAuthenticatedUserId(requestContext),
      requestContext,
      // Show tool loading status before execution finishes.
      streamServerToolCalls: true,
    });

    // Create the CopilotKit request handler; execution happens below.
    const handler = createCopilotRuntimeHandler({
      runtime: new CopilotRuntime({
        // Map the frontend agent ID to this adapter.
        agents: { [agentId]: adapter },
        // Run agents and manage chat history/replay.
        runner: copilotKitRunner,
      }),
      // Use the same endpoint as the frontend's runtime URL.
      basePath: API_PATHS.COPILOTKIT,
      // Handle all CopilotKit operations at one URL.
      mode: "single-route",
    });

    // Copy headers to preserve the original request.
    const headers = new Headers(context.req.raw.headers);
    // Omit the runtime auth header; tools retain the verified token in requestContext.
    headers.delete("authorization");

    // Forward the request with updated headers and return its response/stream.
    return handler(new Request(context.req.raw, { headers }));
  },
});
