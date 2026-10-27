import assert from "node:assert/strict";
import { createServer } from "node:http";
import test, { after, before } from "node:test";
import { RequestContext } from "@mastra/core/request-context";
import { MASTRA_AUTH_TOKEN_KEY } from "@mastra/core/request-context";
import { configureApi } from "@repo/shared/config/api";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { TOOL_IDS } from "@repo/shared/constants/tools";
import { listReservationsTool } from "../src/mastra/tools/list-reservations-tool.ts";

const RESERVATIONS = [
  {
    id: "1",
    restaurantId: "r1",
    restaurant: "Sushi Place",
    date: "2026-11-01",
    guests: 2,
    time: "19:00",
    status: "Confirmed",
  },
  {
    id: "2",
    restaurantId: "r2",
    restaurant: "Pasta Place",
    date: "2026-11-02",
    guests: 4,
    time: "20:00",
    status: "UnConfirmed",
  },
];

// Local loopback stub of the restaurants API; no external network is used.
let server;
let respond = { status: 200, body: [] };
const requests = [];

before(async () => {
  server = createServer((req, res) => {
    requests.push({ url: req.url, authorization: req.headers.authorization });
    res.writeHead(respond.status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(respond.body));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  configureApi({
    restaurantsApiDomain: `http://127.0.0.1:${server.address().port}`,
  });
});

after(() => new Promise((resolve) => server.close(resolve)));

const contextWithToken = (token) => {
  const requestContext = new RequestContext();
  requestContext.set(MASTRA_AUTH_TOKEN_KEY, token);
  return { requestContext };
};

test("tool id is list_reservations", () => {
  assert.equal(listReservationsTool.id, TOOL_IDS.LIST_RESERVATIONS);
  assert.equal(listReservationsTool.id, "list_reservations");
});

test("returns reservations and total, forwarding the bearer token", async () => {
  respond = { status: 200, body: RESERVATIONS };
  requests.length = 0;
  const result = await listReservationsTool.execute(
    {},
    contextWithToken("token-abc"),
  );
  assert.deepEqual(result, {
    success: true,
    data: { reservations: RESERVATIONS, total: 2 },
  });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].authorization, "Bearer token-abc");
});

test("empty reservation list is still a success with total 0", async () => {
  respond = { status: 200, body: [] };
  const result = await listReservationsTool.execute({}, contextWithToken("t"));
  assert.deepEqual(result, {
    success: true,
    data: { reservations: [], total: 0 },
  });
});

test("API failure maps to LIST_RESERVATIONS_FAILED prefix", async () => {
  respond = { status: 500, body: { message: "boom" } };
  const result = await listReservationsTool.execute({}, contextWithToken("t"));
  assert.equal(result.success, false);
  assert.ok(
    result.error.startsWith(`${ERROR_MESSAGES.LIST_RESERVATIONS_FAILED}: `),
  );
  assert.equal(result.data, undefined);
});

test("missing auth context fails without calling the API", async () => {
  requests.length = 0;
  for (const context of [undefined, { requestContext: new RequestContext() }]) {
    const result = await listReservationsTool.execute({}, context);
    assert.deepEqual(result, {
      success: false,
      error: `${ERROR_MESSAGES.LIST_RESERVATIONS_FAILED}: A valid authentication context is required.`,
    });
  }
  assert.equal(requests.length, 0);
});

test("toModelOutput exposes only the total on success", () => {
  const output = {
    success: true,
    data: { reservations: RESERVATIONS, total: 2 },
  };
  const model = listReservationsTool.toModelOutput(output);
  assert.equal(model.type, "json");
  assert.equal(model.value.success, true);
  assert.deepEqual(model.value.data, { total: 2 });
  assert.equal(typeof model.value.instruction, "string");
  assert.ok(!JSON.stringify(model.value).includes("Sushi Place"));
});

test("toModelOutput passes failures through unchanged", () => {
  const output = { success: false, error: "nope" };
  assert.deepEqual(listReservationsTool.toModelOutput(output), {
    type: "json",
    value: output,
  });
});
