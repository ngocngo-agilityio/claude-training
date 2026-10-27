import assert from "node:assert/strict";
import test from "node:test";
import { getAvailableReservationDates } from "../src/mastra/lib/reservation-validation.ts";

test("returns 14 consecutive dates starting from today", () => {
  const dates = getAvailableReservationDates("2026-10-27");

  assert.equal(dates.length, 14);
  assert.equal(dates[0], "2026-10-27");
  assert.equal(dates[13], "2026-11-09");
});

test("crosses month and year boundaries", () => {
  const dates = getAvailableReservationDates("2026-12-25");

  assert.equal(dates[0], "2026-12-25");
  assert.equal(dates[7], "2027-01-01");
  assert.equal(dates[13], "2027-01-07");
});

test("handles a leap-day February", () => {
  const dates = getAvailableReservationDates("2028-02-22");

  assert.ok(dates.includes("2028-02-29"));
  assert.equal(dates[13], "2028-03-06");
});

test("returns a new array on every call", () => {
  const first = getAvailableReservationDates("2026-10-27");
  const second = getAvailableReservationDates("2026-10-27");

  assert.notEqual(first, second);
  assert.deepEqual(first, second);
});
