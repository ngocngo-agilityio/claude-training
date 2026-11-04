import { getTokenExpiresAt, isTokenExpired } from "./auth-token";

/** Builds an unsigned JWT with the given `exp` claim (seconds since the epoch). */
const makeToken = (exp: number) => {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: "1", exp })}.signature`;
};

describe("auth token expiry", () => {
  const now = Date.UTC(2026, 10, 4, 12, 0, 0);
  const nowInSeconds = now / 1000;

  it("reads the exp claim in milliseconds", () => {
    expect(getTokenExpiresAt(makeToken(nowInSeconds + 3600))).toBe(
      (nowInSeconds + 3600) * 1000,
    );
  });

  it("treats a token that expires later as valid", () => {
    expect(isTokenExpired(makeToken(nowInSeconds + 3600), now)).toBe(false);
  });

  it("treats a token past its expiry as expired", () => {
    expect(isTokenExpired(makeToken(nowInSeconds - 1), now)).toBe(true);
  });

  it("treats a token without a readable expiry as expired", () => {
    expect(isTokenExpired("saved-token", now)).toBe(true);
    expect(getTokenExpiresAt("a.b.c")).toBeNull();
  });
});
