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
  state = readSaved();
  // Keep other open tabs in sync so one tab never overwrites another's progress.
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    state = readSaved();
    subs.forEach((f) => f());
  });
}
/** Read saved data defensively; a damaged copy is backed up, never silently overwritten. */
export function parseSaved(raw: string | null): State {
  if (!raw) return empty;
  try {
    const v = JSON.parse(raw);
    if (!v || !Array.isArray(v.plans)) throw new Error("bad shape");
    const plans = (v.plans as Plan[]).filter((p) => p && typeof p.id === "string" && Array.isArray(p.tasks));
    const activeId = plans.some((p) => p.id === v.activeId) ? v.activeId : plans[0]?.id ?? null;
    return { plans, activeId };
  } catch {
    return empty;
  }
}
function readSaved(): State {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = parseSaved(raw);
    if (raw && parsed === empty) localStorage.setItem(KEY + ":backup", raw);
    return parsed;
  } catch { return empty; }
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
