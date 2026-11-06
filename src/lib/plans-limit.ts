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
