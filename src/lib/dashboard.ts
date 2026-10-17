import { addDays, differenceInCalendarDays, parseISO } from "date-fns";
import { fmt, type Plan } from "./planner";

export const parseDay = (d: string) => parseISO(d);
export const ratio = (done: number, total: number) => (total > 0 ? done / total : 0);
export const percent = (done: number, total: number) => Math.round(ratio(done, total) * 100);

/** Derived dashboard/insights numbers for one plan; safe for empty plans and local dates. */
export function planStats(p: Plan, t: string) {
  const done = p.tasks.filter((x) => x.done).length;
  const total = p.tasks.length;
  const todays = p.tasks.filter((x) => x.date === t);
  const overdue = p.tasks.filter((x) => !x.done && x.date < t);
  const upcoming = p.tasks.filter((x) => x.date > t).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const elapsed = differenceInCalendarDays(parseDay(t), parseDay(p.startDate));
  const last = Math.max(0, p.milestones.length - 1);
  const curMonth = Math.min(last, Math.max(0, Math.floor(elapsed / 30)));
  const milestone = p.milestones[curMonth];
  const monthTasks = p.tasks.filter((x) => x.month === curMonth);
  const completedMilestones = p.milestones.filter((_, i) => {
    const ts = p.tasks.filter((x) => x.month === i);
    return ts.length > 0 && ts.every((x) => x.done);
  });
  const days = Array.from({ length: 14 }, (_, i) => fmt(addDays(parseDay(t), i - 6)));
  const week = days.slice(0, 7).map((d) => p.tasks.filter((x) => x.date === d));
  const weekDone = week.flat().filter((x) => x.done).length;
  const weekTotal = week.flat().length;
  const minutesDone = p.tasks.filter((x) => x.done).reduce((s, x) => s + x.minutes, 0);
  let streak = 0;
  for (let i = 0; ; i++) {
    const d = fmt(addDays(parseDay(t), -i));
    if (d < p.startDate) break;
    const ts = p.tasks.filter((x) => x.date === d);
    if (ts.length && ts.every((x) => x.done)) streak++;
    else if (i > 0) break;
  }
  return {
    done, total, todays, overdue, upcoming, curMonth, milestone, completedMilestones, days,
    todayDone: todays.filter((x) => x.done).length,
    monthDone: monthTasks.filter((x) => x.done).length, monthTotal: monthTasks.length,
    weekDone, weekTotal, minutesDone, streak,
  };
}