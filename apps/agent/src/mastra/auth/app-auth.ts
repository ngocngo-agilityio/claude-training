import jwt, { type JwtPayload } from "jsonwebtoken";

type AuthenticatedRequest = {
  accessToken: string;
  user: JwtPayload;
};

// Use the same secret as JSON Server Auth to verify access tokens issued at login.
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "";

/** Extracts the Bearer token and returns it with the verified user. */
export const getAuthenticatedRequest = (
  authorization: string | undefined,
): AuthenticatedRequest | null => {
  const bearerPrefix = "Bearer ";

  if (!authorization?.startsWith(bearerPrefix)) {
    return null;
  }

  const accessToken = authorization.slice(bearerPrefix.length).trim();

  if (!accessToken) {
    return null;
  }

  try {
    const user = jwt.verify(accessToken, JWT_SECRET_KEY);

    if (typeof user === "string" || typeof user.sub !== "string" || !user.sub)
      return null;

    return { accessToken, user };
  } catch {
    return null;
  }
};
