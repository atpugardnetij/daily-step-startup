import { useSyncExternalStore } from "react";
import type { Plan } from "./planner";

interface State { plans: Plan[]; activeId: string | null; }
const KEY = "dreamstep:v1";
const empty: State = { plans: [], activeId: null };
let state: State = empty;
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) state = JSON.parse(raw); } catch { /* ignore */ }
}
function set(next: State) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota */ }
  subs.forEach((f) => f());
}

export const store = {
  addPlan(p: Plan) { load(); set({ plans: [p, ...state.plans], activeId: p.id }); },
  updatePlan(p: Plan) { load(); set({ ...state, plans: state.plans.map((x) => (x.id === p.id ? p : x)) }); },
  removePlan(id: string) {
    load();
    const plans = state.plans.filter((x) => x.id !== id);
    set({ plans, activeId: state.activeId === id ? plans[0]?.id ?? null : state.activeId });
  },
  setActive(id: string) { load(); set({ ...state, activeId: id }); },
  toggleTask(planId: string, taskId: string) {
    load();
    set({ ...state, plans: state.plans.map((p) => p.id !== planId ? p : { ...p, tasks: p.tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t) }) });
  },
  reset() { set(empty); },
};

export function useStore() {
  const s = useSyncExternalStore(
    (cb) => { subs.add(cb); return () => subs.delete(cb); },
    () => { load(); return state; },
    () => empty,
  );
  const active = s.plans.find((p) => p.id === s.activeId) ?? null;
  return { ...s, active };
}
