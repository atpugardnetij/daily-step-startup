import { addDays, format } from "date-fns";

export type Level = "Beginner" | "Intermediate" | "Advanced";
export interface Task { id: string; date: string; title: string; minutes: number; done: boolean; month: number; week: number; }
export interface Milestone { title: string; summary: string; weeks: string[]; resources: string[]; }
export interface Plan {
  id: string; goal: string; months: number; level: Level; minutesPerDay: number;
  startDate: string; targetDate: string; createdAt: string; source: "sample" | "ai";
  nextSteps: string; milestones: Milestone[]; tasks: Task[];
}

export const fmt = (d: Date) => format(d, "yyyy-MM-dd");
export const today = () => fmt(new Date());

const PHASES: Record<Level, { t: string; s: string }[]> = {
  Beginner: [
    { t: "Foundations", s: "Learn the core concepts and vocabulary" },
    { t: "Guided practice", s: "Follow tutorials and repeat the basics" },
    { t: "First small project", s: "Apply what you know to something real" },
    { t: "Build confidence", s: "Tackle harder problems and fill gaps" },
    { t: "Showcase", s: "Polish your work and share it" },
  ],
  Intermediate: [
    { t: "Skill audit", s: "Identify gaps and set a sharp focus" },
    { t: "Deliberate practice", s: "Push on your weakest areas" },
    { t: "Real-world project", s: "Build something meaningful end to end" },
    { t: "Feedback loop", s: "Get reviews and iterate" },
    { t: "Launch", s: "Ship it and measure results" },
  ],
  Advanced: [
    { t: "Strategy", s: "Define a high-leverage target" },
    { t: "Mastery sprints", s: "Go deep on advanced techniques" },
    { t: "Signature project", s: "Create a standout piece of work" },
    { t: "Network & mentor", s: "Teach, collaborate and get visibility" },
    { t: "Scale", s: "Turn results into lasting outcomes" },
  ],
};

const TASKS: Record<"learn" | "practice" | "build" | "reflect", string[]> = {
  learn: ["Study one core concept of {g}", "Watch a focused lesson about {g}", "Read an article or chapter on {g}", "Write notes summarising today's learning"],
  practice: ["Do a 20-min practice exercise for {g}", "Repeat yesterday's exercise from memory", "Solve one small challenge related to {g}", "Review mistakes and retry one"],
  build: ["Work on your {g} project for one session", "Finish one small feature/part of your project", "Document progress in a journal", "Plan tomorrow's project step"],
  reflect: ["Share progress with a friend or community", "Ask for feedback on your work", "Reflect: what went well this week?"],
};
const RES: Record<Level, string[]> = {
  Beginner: ["A free beginner course (YouTube, freeCodeCamp, Khan Academy)", "A beginner-friendly book or guide", "An online community for beginners"],
  Intermediate: ["Project-based tutorials", "Practice platforms with challenges", "A mentor or study group"],
  Advanced: ["Advanced courses and conference talks", "Open-source or professional collaborations", "Writing/teaching to deepen expertise"],
};

const uid = () => Math.random().toString(36).slice(2, 10);

function tasksPerDay(minutes: number) {
  if (minutes <= 30) return 1;
  if (minutes <= 60) return 2;
  return 3;
}

function buildTasks(goal: string, level: Level, months: number, minutes: number, start: Date, startDayIndex = 0): Task[] {
  const totalDays = months * 30;
  const per = tasksPerDay(minutes);
  const g = goal.length > 40 ? "your goal" : goal.toLowerCase();
  const out: Task[] = [];
  for (let d = startDayIndex; d < totalDays; d++) {
    const month = Math.floor(d / 30);
    const week = Math.floor((d % 30) / 7.5);
    const progress = d / totalDays;
    const pools: (keyof typeof TASKS)[] = progress < 0.3 ? ["learn", "practice", "learn"] : progress < 0.7 ? ["practice", "build", "learn"] : ["build", "build", "reflect"];
    if (level !== "Beginner" && progress < 0.3) pools[2] = "build";
    const dow = d % 7;
    for (let i = 0; i < per; i++) {
      const pool = dow === 6 && i === per - 1 ? TASKS.reflect : TASKS[pools[i]!];
      out.push({
        id: uid(), date: fmt(addDays(start, d - startDayIndex)), month, week, done: false,
        minutes: Math.round(minutes / per),
        title: pool[(d + i) % pool.length]!.replace("{g}", g),
      });
    }
  }
  return out;
}

export interface PlanInput { goal: string; months: number; level: Level; minutesPerDay: number; }

export function generateSamplePlan(input: PlanInput): Plan {
  const start = new Date();
  const phases = PHASES[input.level];
  const milestones: Milestone[] = Array.from({ length: input.months }, (_, m) => {
    const p = phases[Math.min(phases.length - 1, Math.floor((m / input.months) * phases.length))]!;
    return {
      title: `Month ${m + 1}: ${p.t}`,
      summary: p.s,
      weeks: [1, 2, 3, 4].map((w) => `Week ${w}: ${["Set up and explore", "Practice consistently", "Apply in a mini task", "Review and consolidate"][w - 1]} — ${p.t.toLowerCase()}`),
      resources: RES[input.level],
    };
  });
  return {
    id: uid(), ...input, source: "sample",
    startDate: fmt(start), targetDate: fmt(addDays(start, input.months * 30 - 1)), createdAt: new Date().toISOString(),
    nextSteps: `With ${input.minutesPerDay} minutes a day over ${input.months} month${input.months > 1 ? "s" : ""}, you'll start with ${phases[0]!.t.toLowerCase()} and steadily move toward ${phases[phases.length - 1]!.t.toLowerCase()}. Keep each day small: ${tasksPerDay(input.minutesPerDay)} focused task${tasksPerDay(input.minutesPerDay) > 1 ? "s" : ""}. Consistency beats intensity — missed days can be rescheduled anytime.`,
    milestones,
    tasks: buildTasks(input.goal, input.level, input.months, input.minutesPerDay, start),
  };
}

/** Build a plan from AI-generated milestones; daily tasks come from the AI's per-month task list. */
export function buildAiPlan(
  input: PlanInput,
  ai: { nextSteps: string; milestones: (Milestone & { dailyTasks: string[] })[] },
): Plan {
  const start = new Date();
  const months = ai.milestones.length;
  const per = tasksPerDay(input.minutesPerDay);
  const tasks: Task[] = [];
  for (let d = 0; d < months * 30; d++) {
    const month = Math.floor(d / 30);
    const pool = ai.milestones[month]!.dailyTasks;
    for (let i = 0; i < per; i++) {
      tasks.push({
        id: uid(), date: fmt(addDays(start, d)), month, week: Math.floor((d % 30) / 7.5), done: false,
        minutes: Math.round(input.minutesPerDay / per),
        title: pool[((d % 30) * per + i) % pool.length]!,
      });
    }
  }
  return {
    id: uid(), ...input, months, source: "ai",
    startDate: fmt(start), targetDate: fmt(addDays(start, months * 30 - 1)), createdAt: new Date().toISOString(),
    nextSteps: ai.nextSteps,
    milestones: ai.milestones.map(({ title, summary, weeks, resources }) => ({ title, summary, weeks, resources })),
    tasks,
  };
}

/** Move overdue unfinished tasks forward, max `per` extra per day. */
export function rescheduleOverdue(plan: Plan): Plan {
  const t = today();
  const overdue = plan.tasks.filter((x) => !x.done && x.date < t);
  if (!overdue.length) return plan;
  const per = tasksPerDay(plan.minutesPerDay);
  const ids = new Set(overdue.map((o) => o.id));
  const moved = overdue.map((o, i) => ({ ...o, date: fmt(addDays(new Date(), Math.floor(i / per))) }));
  const rest = plan.tasks.filter((x) => !ids.has(x.id));
  return { ...plan, tasks: [...rest, ...moved].sort((a, b) => a.date.localeCompare(b.date)) };
}

/** Rebuild all future unfinished tasks with a new daily time budget. */
export function adjustDailyTime(plan: Plan, minutesPerDay: number): Plan {
  const t = today();
  const kept = plan.tasks.filter((x) => x.done || x.date < t);
  const elapsed = Math.max(0, Math.round((new Date(t).getTime() - new Date(plan.startDate).getTime()) / 86400000));
  const fresh = buildTasks(plan.goal, plan.level, plan.months, minutesPerDay, new Date(), elapsed);
  return { ...plan, minutesPerDay, tasks: [...kept, ...fresh] };
}
