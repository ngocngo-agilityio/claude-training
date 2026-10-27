import assert from "node:assert/strict";
import { createServer } from "node:http";
import test, { after, before } from "node:test";
import { configureApi } from "@repo/shared/config/api";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { TOOL_IDS } from "@repo/shared/constants/tools";
import { MAX_RECOMMENDATIONS } from "../src/lib/utils/restaurant.ts";
import { recommendRestaurantsTool } from "../src/mastra/tools/recommend-restaurants-tool.ts";

// A local HTTP server stands in for the restaurants API; no real network.
let server;
let requests = [];
let respond = () => ({ status: 200, body: [] });

const makeRestaurant = (n) => ({
  id: `r${n}`,
  name: `Restaurant ${n}`,
  imageUrl: `https://img.test/${n}.jpg`,
  rating: 4.5,
  reviewCount: 10 + n,
  cuisines: ["Italian", "Pizza"],
  location: "Downtown",
  distance: "1.2 km",
  pricePerPerson: 20 + n,
});

before(async () => {
  server = createServer((req, res) => {
    requests.push(new URL(req.url, "http://localhost"));
    const { status, body } = respond();
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  configureApi({
    restaurantsApiDomain: `http://127.0.0.1:${server.address().port}`,
  });
});

after(() => new Promise((resolve) => server.close(resolve)));

const run = (input = {}) => {
  requests = [];
  return recommendRestaurantsTool.execute(input, {});
};

test("tool id is the recommend restaurants id", () => {
  assert.equal(recommendRestaurantsTool.id, TOOL_IDS.RECOMMEND_RESTAURANTS);
});

test("filters are passed through to the restaurants API", async () => {
  respond = () => ({ status: 200, body: [] });
  await run({
    cuisine: "Italian",
    maximumBudget: 50,
    occasion: "date",
    location: "Downtown",
  });
  const params = requests[0].searchParams;
  assert.equal(requests[0].pathname, "/restaurants");
  assert.equal(params.get("cuisineSearch_like"), "italian");
  assert.equal(params.get("pricePerPerson_lte"), "50");
  assert.equal(params.get("occasionSearch_like"), "date");
  assert.equal(params.get("location_like"), "Downtown");
});

test("missing filters are not invented", async () => {
  respond = () => ({ status: 200, body: [] });
  await run({});
  const keys = [...requests[0].searchParams.keys()].sort();
  assert.deepEqual(keys, ["_order", "_sort"]);
});

test("results are limited to MAX_RECOMMENDATIONS and total matches", async () => {
  const count = MAX_RECOMMENDATIONS + 4;
  respond = () => ({
    status: 200,
    body: Array.from({ length: count }, (_, i) => makeRestaurant(i + 1)),
  });
  const result = await run({});
  assert.equal(result.success, true);
  assert.equal(result.data.restaurants.length, MAX_RECOMMENDATIONS);
  assert.equal(result.data.total, MAX_RECOMMENDATIONS);
  assert.equal(result.data.restaurants[0].id, "r1");
});

test("fewer results than the limit are all returned", async () => {
  respond = () => ({
    status: 200,
    body: [makeRestaurant(1), makeRestaurant(2)],
  });
  const result = await run({});
  assert.equal(result.data.restaurants.length, 2);
  assert.equal(result.data.total, 2);
});

test("restaurants are mapped to cards with rank", async () => {
  respond = () => ({
    status: 200,
    body: [makeRestaurant(1), makeRestaurant(2)],
  });
  const result = await run({});
  assert.deepEqual(result.data.restaurants[1], {
    id: "r2",
    name: "Restaurant 2",
    imageUrl: "https://img.test/2.jpg",
    rating: 4.5,
    reviewCount: 12,
    cuisine: "Italian · Pizza",
    location: "Downtown",
    distance: "1.2 km",
    priceRange: "$22 per person",
    rank: 2,
  });
  assert.equal(result.data.restaurants[0].rank, 1);
});

test("empty API result succeeds with total zero", async () => {
  respond = () => ({ status: 200, body: [] });
  const result = await run({});
  assert.deepEqual(result, {
    success: true,
    data: { restaurants: [], total: 0 },
  });
});

test("toModelOutput exposes only id, name and total", async () => {
  respond = () => ({
    status: 200,
    body: [makeRestaurant(1), makeRestaurant(2)],
  });
  const result = await run({});
  const output = recommendRestaurantsTool.toModelOutput(result);
  assert.equal(output.type, "json");
  assert.equal(output.value.success, true);
  assert.deepEqual(output.value.data, {
    restaurants: [
      { id: "r1", name: "Restaurant 1" },
      { id: "r2", name: "Restaurant 2" },
    ],
    total: 2,
  });
  assert.equal(typeof output.value.instruction, "string");
});

test("toModelOutput passes failures through unchanged", () => {
  const failure = { success: false, error: "boom" };
  const output = recommendRestaurantsTool.toModelOutput(failure);
  assert.deepEqual(output, { type: "json", value: failure });
});

test("API failure returns an ERROR_MESSAGES based error result", async () => {
  respond = () => ({ status: 500, body: { message: "server down" } });
  const result = await run({});
  assert.equal(result.success, false);
  assert.ok(
    result.error.startsWith(`${ERROR_MESSAGES.RECOMMEND_RESTAURANTS_FAILED}: `),
  );
  assert.equal(result.data, undefined);
});
