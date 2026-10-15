import {
  MASTRA_AUTH_TOKEN_KEY,
  MASTRA_RESOURCE_ID_KEY,
  type RequestContext,
} from "@mastra/core/request-context";
import type { Middleware } from "@mastra/core/server";
import { HTTP_STATUS_CODES, HttpMethod } from "@repo/shared/constants/http";
import { getAuthenticatedRequest } from "@/mastra/auth/app-auth";

type MiddlewareHandler = Exclude<Middleware, { path: string }>;

/** Establishes one trusted identity context for all protected request handlers. */
export const authenticationMiddleware: MiddlewareHandler = async (
  context,
  next,
) => {
  // Allow the browser to complete CORS negotiation before authentication.
  if (context.req.method === HttpMethod.OPTIONS) {
    await next();
    return;
  }

  const authentication = getAuthenticatedRequest(
    context.req.header("authorization"),
  );

  if (!authentication?.user.sub) {
    return context.json(
      {
        code: "UNAUTHENTICATED",
        error: "A valid bearer token is required.",
      },
      HTTP_STATUS_CODES.UNAUTHORIZED,
    );
  }

  // Share the verified identity so downstream code can focus on authorization
  // and business logic without decoding the same JWT again.
  const requestContext = context.get("requestContext");
  requestContext.set(MASTRA_RESOURCE_ID_KEY, authentication.user.sub);
  requestContext.set(MASTRA_AUTH_TOKEN_KEY, authentication.accessToken);

  await next();
};

/** Read required identity values without trusting missing or malformed context. */
const getRequiredAuthValue = (
  requestContext: RequestContext | undefined,
  key: string,
): string => {
  const value: unknown = requestContext?.get(key);
  if (typeof value !== "string" || !value) {
    throw new Error("A valid authentication context is required.");
  }

  return value;
};

export const getAuthenticatedUserId = (requestContext: RequestContext) =>
  getRequiredAuthValue(requestContext, MASTRA_RESOURCE_ID_KEY);

export const getAuthenticatedAccessToken = (
  requestContext: RequestContext | undefined,
) => getRequiredAuthValue(requestContext, MASTRA_AUTH_TOKEN_KEY);
