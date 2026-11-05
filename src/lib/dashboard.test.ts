import { afterEach, describe, expect, it, vi } from "vitest";
import { percent, planStats } from "./dashboard";
import { rescheduleOverdue, type Plan } from "./planner";
import { store } from "./store";

const base: Plan = {
  id: "p", goal: "Run", months: 2, level: "Beginner", minutesPerDay: 30, startDate: "2026-01-01", targetDate: "2026-03-01",
  createdAt: "", source: "sample", nextSteps: "", milestones: [{ title: "M1", summary: "", weeks: [], resources: [] }, { title: "M2", summary: "", weeks: [], resources: [] }],
  tasks: [
    { id: "a", date: "2026-01-30", title: "a", minutes: 30, done: true, month: 0, week: 3 },
    { id: "b", date: "2026-01-31", title: "b", minutes: 30, done: false, month: 1, week: 0 },
    { id: "c", date: "2026-02-01", title: "c", minutes: 30, done: false, month: 1, week: 0 },
  ],
};

describe("planStats", () => {
  afterEach(() => { vi.useRealTimers(); store.reset(); });
  it("never returns NaN for an empty plan", () => {
    expect(percent(0, 0)).toBe(0);
    expect(planStats({ ...base, tasks: [] }, "2026-01-01").total).toBe(0);
  });
  it("picks the milestone by elapsed time and finds overdue tasks", () => {
    const s = planStats(base, "2026-02-01");
    expect(s.curMonth).toBe(1);
    expect(s.overdue.map((x) => x.id)).toEqual(["b"]);
    expect(s.todays.map((x) => x.id)).toEqual(["c"]);
    expect(s.days[6]).toBe("2026-02-01");
    expect(s.minutesDone).toBe(30);
  });
  it("calculates concrete overall, daily and milestone progress", () => {
    const s = planStats(base, "2026-01-30");
    expect(percent(s.done, s.total)).toBe(33);
    expect(percent(s.todayDone, s.todays.length)).toBe(100);
    expect(s.completedMilestones.map((m) => m.title)).toEqual(["M1"]);
    expect(s.streak).toBe(1);
  });
  it("maintains yesterday's streak while today's tasks are unfinished", () => {
    expect(planStats(base, "2026-01-31").streak).toBe(1);
    expect(planStats(base, "2026-02-01").streak).toBe(0);
  });
  it("reschedules only overdue unfinished tasks without losing task details", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 1, 12));
    const next = rescheduleOverdue(base);
    expect(next.tasks.find((x) => x.id === "b")).toEqual({ ...base.tasks[1], date: "2026-02-01" });
    expect(next.tasks.find((x) => x.id === "a")).toEqual(base.tasks[0]);
    expect(next.tasks.find((x) => x.id === "c")).toEqual(base.tasks[2]);
    expect(next.tasks).toHaveLength(3);
    expect(next.source).toBe(base.source);
  });
  it("persists completion and undo without changing other goals", () => {
    store.addPlan(base);
    store.addPlan({ ...base, id: "other" });
    store.toggleTask("p", "b");
    const read = () => JSON.parse(localStorage.getItem("dreamstep:v1") ?? "{}");
    expect(read().plans.find((p: Plan) => p.id === "p").tasks[1].done).toBe(true);
    expect(read().plans.find((p: Plan) => p.id === "other").tasks[1].done).toBe(false);
    store.toggleTask("p", "b");
    expect(read().plans.find((p: Plan) => p.id === "p").tasks[1].done).toBe(false);
  });
});
import { parseSaved } from "./store";
describe("saved data loading", () => {
  it("restores plans and active goal", () => {
    const raw = JSON.stringify({ plans: [{ id: "a", tasks: [{ id: "t", done: true }] }], activeId: "a" });
    const s = parseSaved(raw);
    expect(s.activeId).toBe("a");
    expect(s.plans[0]?.tasks[0]?.done).toBe(true);
  });
  it("falls back to first plan when active id is missing", () => {
    expect(parseSaved(JSON.stringify({ plans: [{ id: "b", tasks: [] }], activeId: "zzz" })).activeId).toBe("b");
  });
  it("does not crash on damaged data", () => {
    expect(parseSaved("{not json").plans).toEqual([]);
    expect(parseSaved(JSON.stringify({ foo: 1 })).plans).toEqual([]);
  });
});

import { mergeStates } from "./sync-merge";
describe("account sync merge", () => {
  const P = (id: string, done = false) => ({ id, tasks: [{ id: "t", done }] }) as unknown as Plan;
  it("keeps device-only plans and account plans", () => {
    const m = mergeStates({ plans: [P("local")], activeId: "local" }, { plans: [P("cloud")], activeId: "cloud" });
    expect(m.plans.map((p) => p.id).sort()).toEqual(["cloud", "local"]);
    expect(m.activeId).toBe("local");
  });
  it("uses the account copy for the same plan", () => {
    const m = mergeStates({ plans: [P("a", false)], activeId: "a" }, { plans: [P("a", true)], activeId: "a" });
    expect(m.plans).toHaveLength(1);
    expect(m.plans[0]?.tasks[0]?.done).toBe(true);
  });
});

import { goalMetrics } from "./dashboard";
describe("goalMetrics", () => {
  it("measures pace, days left and per-milestone targets from real tasks", () => {
    const g = goalMetrics(base, "2026-01-31");
    expect(g.scheduledByToday).toBe(2);
    expect(g.doneByToday).toBe(1);
    expect(g.daysLeft).toBe(29);
    expect(g.milestones.map((m) => [m.done, m.total, m.deadline, m.complete])).toEqual([[1, 1, "2026-01-30", true], [0, 2, "2026-02-01", false]]);
  });
});
