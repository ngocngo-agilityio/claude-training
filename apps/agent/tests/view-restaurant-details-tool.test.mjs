import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { configureApi } from "../../../packages/shared/src/config/api.ts";
import { ERROR_MESSAGES } from "../../../packages/shared/src/constants/errors.ts";
import { TOOL_IDS } from "../../../packages/shared/src/constants/tools.ts";
import { mapRestaurantRecordToDetail } from "../src/lib/utils/restaurant.ts";
import { viewRestaurantDetailsTool } from "../src/mastra/tools/view-restaurant-details-tool.ts";

const record = {
  id: "r1",
  name: "Pho Hanoi",
  imageUrl: "https://example.com/a.jpg",
  rating: 4.7,
  reviewCount: 120,
  cuisines: ["Vietnamese", "Noodles"],
  location: "Downtown",
  distance: "1.2 km",
  pricePerPerson: 25,
  description: "Classic pho.",
  opensAt: "10:00",
  closesAt: "22:00",
  ambience: "Casual",
  galleryImageUrls: ["https://example.com/b.jpg"],
  totalPhotoCount: 8,
};

// Local stub of the restaurants API; records each request's query string.
const requests = [];
let respond = () => ({ status: 200, body: [] });
const server = createServer((req, res) => {
  requests.push(new URL(req.url, "http://localhost").searchParams);
  const { status, body } = respond();
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
process.env.NO_PROXY = "127.0.0.1";
process.env.no_proxy = "127.0.0.1";
configureApi({
  restaurantsApiDomain: `http://127.0.0.1:${server.address().port}`,
});
test.after(() => server.close());
test.beforeEach(() => {
  requests.length = 0;
  respond = () => ({ status: 200, body: [] });
});

const run = (input) => viewRestaurantDetailsTool.execute(input, {});

test("tool id is view_restaurant_details", () => {
  assert.equal(viewRestaurantDetailsTool.id, TOOL_IDS.VIEW_RESTAURANT_DETAILS);
});

// The input schema rejects an empty call before the tool's own RESTAURANT_REQUIRED
// guard runs, so the observable result is a validation error and no request.
test("rejects input without any identifier and makes no request", async () => {
  const result = await run({});
  assert.equal(result.error, true);
  assert.match(result.message, /Provide a restaurant ID or name/);
  assert.equal(requests.length, 0);
});

test("returns RESTAURANT_DETAILS_NOT_FOUND when the API returns no match", async () => {
  const result = await run({ restaurantId: "missing" });
  assert.deepEqual(result, {
    success: false,
    error: ERROR_MESSAGES.RESTAURANT_DETAILS_NOT_FOUND,
  });
});

test("returns the record mapped by mapRestaurantRecordToDetail", async () => {
  respond = () => ({ status: 200, body: [record] });
  const result = await run({ restaurantId: "r1" });
  assert.equal(result.success, true);
  assert.deepEqual(result.data, {
    restaurant: mapRestaurantRecordToDetail(record),
  });
  assert.equal(result.data.restaurant.priceRange, "$25 per person");
});

test("looks up by id when an id is given", async () => {
  respond = () => ({ status: 200, body: [record] });
  await run({ restaurantId: "r1" });
  assert.equal(requests[0].get("id"), "r1");
  assert.equal(requests[0].has("name"), false);
});

test("looks up by name when only a name is given", async () => {
  respond = () => ({ status: 200, body: [record] });
  await run({ restaurantName: "Pho Hanoi" });
  assert.equal(requests[0].get("name"), "Pho Hanoi");
  assert.equal(requests[0].has("id"), false);
});

test("prefers id over name when both are given", async () => {
  respond = () => ({ status: 200, body: [record] });
  await run({ restaurantId: "r1", restaurantName: "Other" });
  assert.equal(requests[0].get("id"), "r1");
  assert.equal(requests[0].has("name"), false);
});

test("toModelOutput exposes only id and name on success", () => {
  const output = {
    success: true,
    data: { restaurant: mapRestaurantRecordToDetail(record) },
  };
  const model = viewRestaurantDetailsTool.toModelOutput(output);
  assert.equal(model.type, "json");
  assert.deepEqual(model.value.data, {
    restaurant: { id: "r1", name: "Pho Hanoi" },
  });
  assert.equal(model.value.success, true);
  assert.equal(typeof model.value.instruction, "string");
});

test("toModelOutput passes failures through unchanged", () => {
  const output = { success: false, error: "nope" };
  assert.deepEqual(viewRestaurantDetailsTool.toModelOutput(output), {
    type: "json",
    value: output,
  });
});

test("returns VIEW_RESTAURANT_DETAILS_FAILED with the message when the request throws", async () => {
  respond = () => ({ status: 500, body: {} });
  const result = await run({ restaurantId: "r1" });
  assert.equal(result.success, false);
  assert.ok(
    result.error.startsWith(
      `${ERROR_MESSAGES.VIEW_RESTAURANT_DETAILS_FAILED}: `,
    ),
  );
  assert.match(result.error, /500/);
});
