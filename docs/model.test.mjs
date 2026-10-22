import { test } from "node:test";
import assert from "node:assert/strict";
import { today, countdown, daysUntil, validate, validDate } from "./model.mjs";
test("T-minus, event day and elapsed days", () => {
  assert.equal(countdown("2027-01-29", "2026-10-22").label, "T−99");
  assert.equal(countdown("2026-10-22", "2026-10-22").label, "Today");
  assert.equal(countdown("2026-10-10", "2026-10-22").label, "T+12");
});
test("calendar dates across DST and leap years", () => {
  assert.equal(daysUntil("2026-03-09", "2026-03-08"), 1);
  assert.equal(daysUntil("2026-11-02", "2026-11-01"), 1);
  assert.equal(daysUntil("2024-03-01", "2024-02-28"), 2);
  assert.equal(today(new Date(2026, 9, 22, 23)), "2026-10-22");
});
test("invalid dates rejected", () => {
  for (const d of ["2026-02-29", "2026-13-01", "oops", "1899-01-01"]) {
    assert.equal(validDate(d), false);
    assert.throws(() => daysUntil(d));
  }
});
test("backup validates fields and rejects duplicate ids", () => {
  const data = {
    version: 1,
    events: [
      {
        id: "a",
        name: "Wedding",
        date: "2027-01-29",
        category: "Family",
        note: "Ceremony",
      },
    ],
  };
  assert.deepEqual(validate(data), data);
  assert.throws(() =>
    validate({ ...data, events: [...data.events, ...data.events] }),
  );
  assert.throws(() =>
    validate({ ...data, events: [{ ...data.events[0], name: "" }] }),
  );
  assert.throws(() => validate({ version: 1, events: {} }));
});
