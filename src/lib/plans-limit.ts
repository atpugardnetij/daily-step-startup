/** Free accounts can keep up to this many goal plans at once. */
export const FREE_PLAN_LIMIT = 3;

export interface Tier { id: string; name: string; priceInr: number; plans: number | null; perks: string[]; }

export const TIERS: Tier[] = [
  { id: "starter", name: "Starter", priceInr: 99, plans: 10, perks: ["Up to 10 goal plans", "AI roadmaps", "Sync across devices"] },
  { id: "pro", name: "Pro", priceInr: 299, plans: 25, perks: ["Up to 25 goal plans", "Everything in Starter", "Priority AI planning"] },
  { id: "elite", name: "Elite", priceInr: 499, plans: null, perks: ["Unlimited goal plans", "Everything in Pro", "Early access to new features"] },
];

export function canCreatePlan(planCount: number, limit = FREE_PLAN_LIMIT): boolean {
  return planCount < limit;
}

/** The free account, shaped like a tier so pages can list it alongside paid ones. */
export const FREE_TIER: Tier = {
  id: "free",
  name: "Free",
  priceInr: 0,
  plans: FREE_PLAN_LIMIT,
  perks: [`Up to ${FREE_PLAN_LIMIT} goal plans`, "AI roadmaps", "Daily tasks & milestones", "Sync across devices"],
};

export function planLimitLabel(plans: number | null): string {
  return plans === null ? "Unlimited" : String(plans);
}

export type PlanValue = string | boolean;

export interface PlanRow {
  label: string;
  /** One value per tier id: free, starter, pro, elite. */
  values: Record<string, PlanValue>;
}

/** Side-by-side comparison used by the Plans page. */
export const PLAN_ROWS: PlanRow[] = [
  { label: "Goal plans at once", values: { free: planLimitLabel(FREE_PLAN_LIMIT), starter: planLimitLabel(10), pro: planLimitLabel(25), elite: planLimitLabel(null) } },
  { label: "AI-generated roadmaps", values: { free: true, starter: true, pro: true, elite: true } },
  { label: "Daily tasks & milestones", values: { free: true, starter: true, pro: true, elite: true } },
  { label: "Progress, streaks & insights", values: { free: true, starter: true, pro: true, elite: true } },
  { label: "Sync across devices", values: { free: true, starter: true, pro: true, elite: true } },
  { label: "Priority AI planning", values: { free: false, starter: false, pro: true, elite: true } },
  { label: "Early access to new features", values: { free: false, starter: false, pro: false, elite: true } },
];
