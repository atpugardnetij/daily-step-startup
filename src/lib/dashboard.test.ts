import { describe, expect, it } from "vitest";
import { percent, planStats } from "./dashboard";
import type { Plan } from "./planner";

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
});