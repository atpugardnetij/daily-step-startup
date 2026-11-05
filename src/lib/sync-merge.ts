import type { State } from "./store";

/** Combine this device's plans with the account's saved plans. Nothing is dropped:
 *  plans only on this device are kept, and for the same plan the account copy wins. */
export function mergeStates(local: State, remote: State): State {
  const ids = new Set(remote.plans.map((p) => p.id));
  const plans = [...local.plans.filter((p) => !ids.has(p.id)), ...remote.plans];
  const pick = [local.activeId, remote.activeId].find((id) => id && plans.some((p) => p.id === id));
  return { plans, activeId: pick ?? plans[0]?.id ?? null };
}
