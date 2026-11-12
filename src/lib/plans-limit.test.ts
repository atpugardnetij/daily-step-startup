import { describe, it, expect } from "vitest";
import { canCreatePlan, FREE_PLAN_LIMIT, FREE_TIER, PLAN_ROWS, TIERS, planLimitLabel } from "./plans-limit";

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

describe("plan limits shown on the Plans page", () => {
  it("free gives 3, Starter 10, Pro 25, Elite unlimited", () => {
    expect(FREE_TIER.plans).toBe(3);
    expect(TIERS.map((t) => t.plans)).toEqual([10, 25, null]);
    expect(planLimitLabel(null)).toBe("Unlimited");
    expect(planLimitLabel(10)).toBe("10");
  });
  it("comparison table rows match the tier limits", () => {
    const row = PLAN_ROWS.find((r) => r.label === "Goal plans at once");
    expect(row?.values).toEqual({ free: "3", starter: "10", pro: "25", elite: "Unlimited" });
  });
});
