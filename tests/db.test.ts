import { describe, expect, it } from "vitest";

import { isRetryableDatabaseStartupError } from "@/db/migrate";

describe("database startup retry classification", () => {
  it("retries transient connection failures", () => {
    expect(isRetryableDatabaseStartupError(new Error("Connection terminated unexpectedly"))).toBe(true);
    expect(isRetryableDatabaseStartupError(Object.assign(new Error("connect failed"), { code: "ECONNREFUSED" }))).toBe(true);
    expect(isRetryableDatabaseStartupError(Object.assign(new Error("starting"), { code: "57P03" }))).toBe(true);
  });

  it("does not retry migration SQL failures", () => {
    expect(isRetryableDatabaseStartupError(Object.assign(new Error("syntax error"), { code: "42601" }))).toBe(false);
  });
});
