/**
 * Reads the expiry time of a JWT from its `exp` claim, in milliseconds since
 * the epoch. Returns null when the token has no readable expiry.
 */
export const getTokenExpiresAt = (token: string): number | null => {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const claims: unknown = JSON.parse(atob(base64));

    if (
      typeof claims === "object" &&
      claims !== null &&
      "exp" in claims &&
      typeof claims.exp === "number"
    ) {
      return claims.exp * 1000;
    }
  } catch {
    return null;
  }

  return null;
};

/**
 * True when the token has expired or its expiry cannot be read. The server
 * rejects expired tokens, so a saved one must not be reused.
 */
export const isTokenExpired = (token: string, now = Date.now()): boolean => {
  const expiresAt = getTokenExpiresAt(token);

  return expiresAt === null || expiresAt <= now;
};
