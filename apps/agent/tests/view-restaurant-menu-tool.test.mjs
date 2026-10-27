import assert from "node:assert/strict";
import { createServer } from "node:http";
import test, { after, before } from "node:test";
import { configureApi } from "@repo/shared/config/api";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { TOOL_IDS } from "@repo/shared/constants/tools";
import { viewRestaurantMenuTool } from "../src/mastra/tools/view-restaurant-menu-tool.ts";

const RESTAURANT = { id: "r1", name: "Pho House" };
const CATEGORIES = [
  {
    id: "soups",
    label: "Soups",
    items: [
      {
        id: "pho",
        name: "Pho",
        description: "Beef noodle soup",
        price: "$10",
        imageUrl: "https://example.test/pho.png",
      },
    ],
  },
];

// Per-test handler for the loopback server standing in for the REST API.
let respond = () => ({ status: 404, body: [] });
let requests = [];
let server;

before(async () => {
  server = createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    requests.push(`${url.pathname}${url.search}`);
    const { status, body } = respond(url);
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  configureApi({
    restaurantsApiDomain: `http://127.0.0.1:${server.address().port}`,
  });
});

after(() => new Promise((resolve) => server.close(resolve)));

const run = (input) => {
  requests = [];
  return viewRestaurantMenuTool.execute(input, {});
};

test("tool id is the shared view restaurant menu id", () => {
  assert.equal(viewRestaurantMenuTool.id, TOOL_IDS.VIEW_RESTAURANT_MENU);
});

test("fails with RESTAURANT_REQUIRED when no id or name is given", async () => {
  const result = await run({});
  assert.deepEqual(result, {
    success: false,
    error: ERROR_MESSAGES.RESTAURANT_REQUIRED,
  });
  assert.equal(requests.length, 0);
});

test("fails with RESTAURANT_DETAILS_NOT_FOUND when lookup is empty", async () => {
  respond = () => ({ status: 200, body: [] });
  const result = await run({ restaurantName: "Nowhere" });
  assert.deepEqual(result, {
    success: false,
    error: ERROR_MESSAGES.RESTAURANT_DETAILS_NOT_FOUND,
  });
  // Menu API must not be called without a resolved restaurant.
  assert.equal(requests.length, 1);
});

test("fails with RESTAURANT_MENU_NOT_FOUND when restaurant has no menu", async () => {
  respond = (url) => ({
    status: 200,
    body: url.pathname === "/restaurants" ? [RESTAURANT] : [],
  });
  const result = await run({ restaurantId: "r1" });
  assert.deepEqual(result, {
    success: false,
    error: ERROR_MESSAGES.RESTAURANT_MENU_NOT_FOUND,
  });
});

test("returns restaurantName and categories on success", async () => {
  respond = (url) => ({
    status: 200,
    body:
      url.pathname === "/restaurants"
        ? [RESTAURANT]
        : [{ restaurantId: "r1", categories: CATEGORIES }],
  });
  const result = await run({ restaurantName: "Pho House" });
  assert.deepEqual(result, {
    success: true,
    data: { restaurantName: "Pho House", categories: CATEGORIES },
  });
});

test("looks up the menu by the resolved restaurant id", async () => {
  respond = (url) => ({
    status: 200,
    body:
      url.pathname === "/restaurants"
        ? [RESTAURANT]
        : [{ restaurantId: "r1", categories: CATEGORIES }],
  });
  await run({ restaurantName: "Pho House" });
  assert.deepEqual(requests, [
    "/restaurants?name=Pho+House",
    "/menus?restaurantId=r1",
  ]);
});

test("toModelOutput exposes only restaurantName on success", () => {
  const output = viewRestaurantMenuTool.toModelOutput({
    success: true,
    data: { restaurantName: "Pho House", categories: CATEGORIES },
  });
  assert.equal(output.type, "json");
  assert.equal(output.value.success, true);
  assert.deepEqual(output.value.data, { restaurantName: "Pho House" });
  assert.equal(typeof output.value.instruction, "string");
});

test("toModelOutput passes failures through unchanged", () => {
  const failure = { success: false, error: ERROR_MESSAGES.RESTAURANT_REQUIRED };
  assert.deepEqual(viewRestaurantMenuTool.toModelOutput(failure), {
    type: "json",
    value: failure,
  });
});

test("wraps thrown errors with VIEW_RESTAURANT_MENU_FAILED", async () => {
  respond = () => ({ status: 500, body: {} });
  const result = await run({ restaurantId: "r1" });
  assert.equal(result.success, false);
  assert.ok(
    result.error.startsWith(`${ERROR_MESSAGES.VIEW_RESTAURANT_MENU_FAILED}: `),
  );
  assert.ok(
    result.error.length > ERROR_MESSAGES.VIEW_RESTAURANT_MENU_FAILED.length + 2,
  );
});
