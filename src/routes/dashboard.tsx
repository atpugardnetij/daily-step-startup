import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, CalendarClock, Flag, RefreshCw, Trophy } from "lucide-react";
import { addDays, format, subDays } from "date-fns";
import { toast } from "sonner";
import { store, useStore } from "@/lib/store";
import { fmt, rescheduleOverdue, today, type Task } from "@/lib/planner";
import { ProgressBar } from "@/components/Header";
import { EmptyState, SourceBadge } from "./roadmap";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — DreamStep" },
      { name: "description", content: "Today's tasks, progress and milestones for your dream." },
      { property: "og:title", content: "Dashboard — DreamStep" },
      { property: "og:description", content: "Check off today's tasks and track your progress." },
    ],
  }),
  component: Dashboard,
});

function TaskRow({ t, planId }: { t: Task; planId: string }) {
  return (
    <li>
      <button onClick={() => store.toggleTask(planId, t.id)} className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left text-sm transition hover:border-primary/40">
        {t.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />}
        <span className={`flex-1 ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</span>
        <span className="text-xs text-muted-foreground">{t.minutes}m</span>
      </button>
    </li>
  );
}

function Dashboard() {
  const { active: p } = useStore();
  if (!p) return <EmptyState title="Your dashboard is empty" />;
  const t = today();
  const done = p.tasks.filter((x) => x.done).length;
  const total = p.tasks.length;
  const todays = p.tasks.filter((x) => x.date === t);
  const overdue = p.tasks.filter((x) => !x.done && x.date < t);
  const upcoming = p.tasks.filter((x) => x.date > t).slice(0, 5);
  const curMonth = todays[0]?.month ?? upcoming[0]?.month ?? p.milestones.length - 1;
  const milestone = p.milestones[curMonth];
  const completedMilestones = p.milestones.filter((_, i) => { const ts = p.tasks.filter((x) => x.month === i); return ts.length && ts.every((x) => x.done); });

  const days = Array.from({ length: 14 }, (_, i) => fmt(addDays(subDays(new Date(), 6), i)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SourceBadge source={p.source} />
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">{p.goal}</h1>
          <p className="text-sm text-muted-foreground">Target date: {format(new Date(p.targetDate), "d MMMM yyyy")}</p>
        </div>
        <Link to="/roadmap" className="btn btn-outline">View roadmap</Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5 sm:col-span-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Overall progress</span><span className="font-semibold">{Math.round((done / total) * 100)}%</span></div>
          <div className="mt-3"><ProgressBar value={done / total} /></div>
          <div className="mt-4 flex gap-6 text-sm"><span><b>{done}</b> completed</span><span><b>{total - done}</b> remaining</span></div>
        </div>
        <div className="card p-5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Flag className="h-4 w-4 text-primary" /> Current milestone</p>
          <p className="mt-2 font-semibold">{milestone?.title}</p>
          <p className="text-sm text-muted-foreground">{milestone?.summary}</p>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="card mt-4 flex flex-wrap items-center justify-between gap-3 border-warning/50 p-4">
          <p className="text-sm"><b>{overdue.length}</b> unfinished task{overdue.length > 1 ? "s" : ""} from previous days. No stress — move them forward.</p>
          <button className="btn btn-primary" onClick={() => { store.updatePlan(rescheduleOverdue(p)); toast.success("Tasks rescheduled"); }}><RefreshCw className="h-4 w-4" /> Reschedule</button>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Today · {format(new Date(), "EEEE, d MMM")}</h2>
          {todays.length ? (
            <ul className="mt-4 space-y-2">{todays.map((x) => <TaskRow key={x.id} t={x} planId={p.id} />)}</ul>
          ) : <p className="mt-4 text-sm text-muted-foreground">No tasks today — enjoy your rest day! 🎉</p>}
          {todays.length > 0 && todays.every((x) => x.done) && <p className="mt-4 rounded-lg bg-success/10 p-3 text-sm font-medium text-success">All done for today. Great work!</p>}

          <h3 className="mt-8 flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4 text-primary" /> Upcoming</h3>
          <ul className="mt-3 space-y-2">{upcoming.map((x) => (
            <li key={x.id} className="flex justify-between rounded-lg bg-secondary px-3 py-2 text-sm"><span>{x.title}</span><span className="text-xs text-muted-foreground">{format(new Date(x.date), "d MMM")}</span></li>
          ))}</ul>
        </section>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="font-semibold">Last 7 days & next 7</h2>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {days.map((d) => {
                const ts = p.tasks.filter((x) => x.date === d);
                const r = ts.length ? ts.filter((x) => x.done).length / ts.length : 0;
                const cls = !ts.length ? "bg-muted" : r === 1 ? "bg-primary text-primary-foreground" : r > 0 ? "bg-accent text-accent-foreground" : d < t ? "bg-destructive/15" : "bg-secondary";
                return <div key={d} title={`${d}: ${Math.round(r * 100)}%`} className={`grid aspect-square place-items-center rounded-md text-xs font-medium ${cls} ${d === t ? "ring-2 ring-ring" : ""}`}>{format(new Date(d), "d")}</div>;
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Dark blue = all done · light = partial</p>
          </section>
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold"><Trophy className="h-4 w-4 text-warning" /> Completed milestones</h2>
            {completedMilestones.length ? <ul className="mt-3 space-y-1 text-sm">{completedMilestones.map((m) => <li key={m.title}>✓ {m.title}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">Finish all tasks in a month to unlock your first milestone.</p>}
          </section>
        </aside>
      </div>
    </div>
  );
}
