import { describe, it, expect } from "vitest";
import { canCreatePlan, FREE_PLAN_LIMIT, TIERS } from "./plans-limit";

describe("free plan limit", () => {
  it("allows 3 free plans", () => {
    expect(FREE_PLAN_LIMIT).toBe(3);
    expect(canCreatePlan(2)).toBe(true);
    expect(canCreatePlan(3)).toBe(false);
  });
  it("subscription prices are 99, 299, 499", () => {
    expect(TIERS.map((t) => t.priceInr)).toEqual([99, 299, 499]);
  });
});
