import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Trophy, Clock3, Flame, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useStore } from "@/lib/store";
import { today } from "@/lib/planner";
import { parseDay, percent, planStats, ratio } from "@/lib/dashboard";
import { ProgressBar } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./roadmap";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [
    { title: "My Insights — DreamStep" },
    { name: "description", content: "Review your DreamStep task activity, weekly progress and completed milestones." },
    { property: "og:title", content: "My Insights — DreamStep" },
    { property: "og:description", content: "Your goal's activity history, consistency and progress in one place." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Insights,
});

function Insights() {
  const { active: p } = useStore();
  if (!p) return <EmptyState title="No insights yet" />;
  const t = today();
  const s = planStats(p, t);
  const history = [...p.tasks].filter((x) => x.date <= t).sort((a, b) => b.date.localeCompare(a.date));
  const historyDates = [...new Set(history.map((x) => x.date))].slice(0, 7);
  return <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
    <Button asChild variant="outline"><Link to="/dashboard"><ArrowLeft /> Back to dashboard</Link></Button>
    <h1 className="mt-6 text-2xl font-bold md:text-3xl">My Insights</h1>
    <p className="mt-2 break-words text-muted-foreground">{p.goal}</p>
    <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="Goal statistics">
      {[
        { icon: CheckCircle2, label: "Completed tasks", value: `${s.done} / ${s.total}` },
        { icon: Clock3, label: "Planned minutes completed", value: `${s.minutesDone} min` },
        { icon: Flame, label: "All-done streak", value: `${s.streak} day${s.streak === 1 ? "" : "s"}` },
      ].map(({ icon: Icon, label, value }) => <div key={label} className="card p-5"><Icon className="h-5 w-5 text-primary" /><p className="mt-3 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}
    </section>
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      <section><h2 className="text-lg font-semibold">Progress & consistency</h2>
        <div className="mt-4 space-y-5">{[
          { label: "Last 7 days", done: s.weekDone, total: s.weekTotal },
          { label: "Current milestone", done: s.monthDone, total: s.monthTotal },
        ].map((x) => <div key={x.label}><div className="mb-2 flex justify-between gap-3 text-sm"><span>{x.label}</span><span>{percent(x.done, x.total)}%</span></div><ProgressBar value={ratio(x.done, x.total)} /><p className="mt-2 text-xs text-muted-foreground">{x.done} of {x.total} tasks completed</p></div>)}</div>
      </section>
      <section><h2 className="text-lg font-semibold">Activity calendar</h2><p className="mt-1 text-xs text-muted-foreground">{format(parseDay(s.days[0] ?? t), "d MMM")} – {format(parseDay(s.days[13] ?? t), "d MMM")}</p>
        <div className="mt-4 grid grid-cols-7 gap-2">{s.days.map((d) => {
          const ts = p.tasks.filter((x) => x.date === d);
          const done = ts.filter((x) => x.done).length;
          const r = ratio(done, ts.length);
          const cls = !ts.length ? "bg-muted" : r === 1 ? "bg-primary text-primary-foreground" : r > 0 ? "bg-accent text-accent-foreground" : d < t ? "bg-destructive/15" : "bg-secondary";
          return <div key={d} title={`${d}: ${done} of ${ts.length} tasks completed`} aria-label={`${format(parseDay(d), "d MMM")}: ${done} of ${ts.length} tasks completed`} className={`grid aspect-square place-items-center rounded-md text-xs font-medium ${cls} ${d === t ? "ring-2 ring-ring" : ""}`}>{format(parseDay(d), "d")}</div>;
        })}</div>
      </section>
    </div>
    <section className="mt-8 border-t pt-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><Trophy className="h-5 w-5 text-warning" /> Completed milestones</h2>
      {s.completedMilestones.length ? <ul className="mt-3 space-y-2">{s.completedMilestones.map((m, i) => <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 shrink-0 text-success" />{m.title}</li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">No completed milestones yet. Every task moves you forward.</p>}
    </section>
    <section className="mt-8 border-t pt-6"><h2 className="text-lg font-semibold">Activity history</h2>
      <p className="mt-1 text-xs text-muted-foreground">Task status by scheduled day</p>
      {historyDates.length ? <div className="mt-4 space-y-5">{historyDates.map((d) => <div key={d}><h3 className="text-sm font-semibold">{format(parseDay(d), "EEEE, d MMM")}</h3><ul className="mt-2 space-y-2">{history.filter((x) => x.date === d).map((x) => <li key={x.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm"><span className="min-w-0 break-words">{x.title}</span><span className={`shrink-0 text-xs ${x.done ? "text-success" : "text-muted-foreground"}`}>{x.done ? "Completed" : "Unfinished"}</span></li>)}</ul></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No activity yet.</p>}
    </section>
  </div>;
}
