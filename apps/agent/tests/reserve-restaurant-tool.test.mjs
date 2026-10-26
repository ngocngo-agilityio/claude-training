import assert from "node:assert/strict";
import { createServer } from "node:http";
import test, { after, before, beforeEach, mock } from "node:test";
import { RequestContext } from "@mastra/core/request-context";
import { configureApi } from "@repo/shared/config/api";
import { ERROR_MESSAGES } from "@repo/shared/constants/errors";
import { REQUEST_CONTEXT_KEYS } from "@repo/shared/constants/request-context";
import { TOOL_IDS } from "@repo/shared/constants/tools";
import { reserveRestaurantTool } from "../src/mastra/tools/reserve-restaurant-tool.ts";

const RESTAURANT = {
  id: "r1",
  name: "Test Bistro",
  opensAt: "10:00 AM",
  closesAt: "11:00 PM",
  maximumReservationGuests: 8,
};

// Fixed instant: 2026-03-10 23:30 UTC = 2026-03-11 06:30 in Ho Chi Minh,
// 2026-03-10 16:30 in Los Angeles.
const NOW = Date.parse("2026-03-10T23:30:00Z");

let server;
let restaurants;
let requests;

// Local HTTP server stands in for the restaurants API (no external network).
before(async () => {
  server = createServer((req, res) => {
    requests.push(req.url);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(restaurants));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  configureApi({
    restaurantsApiDomain: `http://127.0.0.1:${server.address().port}`,
  });
});

after(() => new Promise((resolve) => server.close(resolve)));

beforeEach(() => {
  restaurants = [RESTAURANT];
  requests = [];
  mock.timers.reset();
  mock.timers.enable({ apis: ["Date"], now: NOW });
});

const run = (input, timezone) => {
  const requestContext = new RequestContext();
  if (timezone !== undefined) {
    requestContext.set(REQUEST_CONTEXT_KEYS.TIMEZONE, timezone);
  }
  return reserveRestaurantTool.execute(
    { restaurantName: "Test Bistro", ...input },
    { requestContext },
  );
};

test("tool id is the reserve restaurant id", () => {
  assert.equal(reserveRestaurantTool.id, TOOL_IDS.RESERVE_RESTAURANT);
});

test("valid booking returns normalized details and booking rules", async () => {
  const result = await run(
    { guests: 4, date: "2026-03-12", time: "7pm" },
    "UTC",
  );
  assert.equal(result.success, true);
  assert.equal(result.data.restaurantId, "r1");
  assert.equal(result.data.restaurantName, "Test Bistro");
  assert.equal(result.data.guests, 4);
  assert.equal(result.data.date, "2026-03-12");
  assert.equal(result.data.time, "7:00 PM");
  assert.equal(result.data.opensAt, "10:00 AM");
  assert.equal(result.data.closesAt, "11:00 PM");
  assert.equal(result.data.maximumGuests, 8);
  assert.equal(result.data.availableDates.length, 14);
  assert.equal(result.data.availableDates[0], "2026-03-10");
});

test("partial details are accepted so the agent can ask for the rest", async () => {
  const result = await run({}, "UTC");
  assert.equal(result.success, true);
  assert.equal(result.data.date, undefined);
  assert.equal(result.data.time, undefined);
  assert.equal(result.data.guests, undefined);
});

test("unknown restaurant returns a not-found error", async () => {
  restaurants = [];
  const result = await run({ date: "2026-03-12" }, "UTC");
  assert.deepEqual(result, {
    success: false,
    error: ERROR_MESSAGES.RESTAURANT_DETAILS_NOT_FOUND,
  });
});

test("date outside the booking window is rejected", async () => {
  for (const date of ["2026-03-09", "2026-03-24"]) {
    const result = await run({ date }, "UTC");
    assert.equal(result.success, false);
    assert.equal(
      result.error,
      ERROR_MESSAGES.RESERVATION_DATE_UNAVAILABLE("2026-03-10", "2026-03-23"),
    );
  }
});

test("last day of the booking window is accepted", async () => {
  const result = await run({ date: "2026-03-23" }, "UTC");
  assert.equal(result.success, true);
});

test("time outside opening hours is rejected", async () => {
  const result = await run({ date: "2026-03-12", time: "6 AM" }, "UTC");
  assert.equal(result.success, false);
  assert.equal(
    result.error,
    ERROR_MESSAGES.RESERVATION_TIME_UNAVAILABLE("10:00 AM – 11:00 PM"),
  );
});

test("unparseable time is rejected as unavailable", async () => {
  const result = await run({ date: "2026-03-12", time: "25:00" }, "UTC");
  assert.equal(result.success, false);
  assert.equal(
    result.error,
    ERROR_MESSAGES.RESERVATION_TIME_UNAVAILABLE("10:00 AM – 11:00 PM"),
  );
});

test("guest count above the restaurant limit is rejected", async () => {
  const result = await run({ guests: 9, date: "2026-03-12" }, "UTC");
  assert.equal(result.success, false);
  assert.equal(
    result.error,
    ERROR_MESSAGES.RESERVATION_GUEST_LIMIT_EXCEEDED("Test Bistro", 8),
  );
});

test("guest count equal to the limit is accepted", async () => {
  const result = await run({ guests: 8 }, "UTC");
  assert.equal(result.success, true);
});

test("timezone decides whether today's time has passed", async () => {
  // 7 PM on 2026-03-10 is past at 23:30 UTC but still ahead at 16:30 in LA.
  const input = { date: "2026-03-10", time: "7 PM" };
  const utc = await run(input, "UTC");
  assert.equal(utc.success, false);
  assert.equal(utc.error, ERROR_MESSAGES.RESERVATION_TIME_IN_PAST);

  const la = await run(input, "America/Los_Angeles");
  assert.equal(la.success, true);
  assert.equal(la.data.time, "7:00 PM");
});

test("timezone shifts the first available date", async () => {
  // It is already 2026-03-11 in Ho Chi Minh, so 2026-03-10 is unavailable.
  const hcm = await run({ date: "2026-03-10" }, "Asia/Ho_Chi_Minh");
  assert.equal(hcm.success, false);
  assert.equal(
    hcm.error,
    ERROR_MESSAGES.RESERVATION_DATE_UNAVAILABLE("2026-03-11", "2026-03-24"),
  );

  const utc = await run({ date: "2026-03-10" }, "UTC");
  assert.equal(utc.success, true);
  assert.equal(utc.data.availableDates[0], "2026-03-10");
});

test("missing or invalid timezone falls back to UTC", async () => {
  for (const timezone of [undefined, "Not/AZone", 42]) {
    const result = await run({}, timezone);
    assert.equal(result.success, true);
    assert.equal(result.data.availableDates[0], "2026-03-10");
  }
});

test("service failure is returned as an error result", async () => {
  configureApi({ restaurantsApiDomain: "http://127.0.0.1:1" });
  try {
    const result = await run({ date: "2026-03-12" }, "UTC");
    assert.equal(result.success, false);
    assert.ok(
      result.error.startsWith(`${ERROR_MESSAGES.RESERVE_RESTAURANT_FAILED}:`),
    );
  } finally {
    configureApi({
      restaurantsApiDomain: `http://127.0.0.1:${server.address().port}`,
    });
  }
});

test("toModelOutput reports that the result is not rendered", () => {
  const output = {
    success: true,
    data: {
      restaurantId: "r1",
      restaurantName: "Test Bistro",
      guests: 2,
      date: "2026-03-12",
      time: "7:00 PM",
      availableDates: ["2026-03-12"],
      opensAt: "10:00 AM",
      closesAt: "11:00 PM",
      maximumGuests: 8,
    },
  };
  const model = reserveRestaurantTool.toModelOutput(output);
  assert.equal(model.type, "json");
  assert.equal(model.value.success, true);
  assert.deepEqual(model.value.data, output.data);
  // resultIsRendered:false means no "already displayed" prefix is added.
  assert.ok(!/already/i.test(model.value.instruction));
});

test("toModelOutput passes failures through unchanged", () => {
  const output = { success: false, error: "nope" };
  assert.deepEqual(reserveRestaurantTool.toModelOutput(output), {
    type: "json",
    value: output,
  });
});
