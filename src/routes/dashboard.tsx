import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, ChevronDown, Flag, RefreshCw, ArrowRight, ChartNoAxesCombined } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { store, useStore } from "@/lib/store";
import { rescheduleOverdue, today, type Task } from "@/lib/planner";
import { goalMetrics, parseDay, percent, planStats, ratio } from "@/lib/dashboard";
import { ProgressBar } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { EmptyState, SourceBadge } from "./roadmap";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Dashboard — DreamStep" },
    { name: "description", content: "Today's tasks, current goal and progress for your dream." },
    { property: "og:title", content: "Dashboard — DreamStep" },
    { property: "og:description", content: "Check off today's tasks and track your progress." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Dashboard,
});

function TaskRow({ t, planId }: { t: Task; planId: string }) {
  return <li>
    <Button variant="outline" aria-pressed={t.done} aria-label={`${t.done ? "Undo" : "Complete"}: ${t.title}`}
      onClick={() => store.toggleTask(planId, t.id)}
      className="grid h-auto min-h-14 w-full grid-cols-[auto_minmax(0,1fr)_auto] gap-3 whitespace-normal rounded-lg bg-card p-4 text-left font-normal hover:border-primary/40">
      {t.done ? <CheckCircle2 className="text-success" /> : <Circle className="text-muted-foreground" />}
      <span className={`min-w-0 break-words ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</span>
      <span className="shrink-0 text-xs text-muted-foreground">{t.minutes}m</span>
    </Button>
  </li>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="min-w-0 rounded-lg border bg-card p-4">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="mt-1 text-2xl font-bold" aria-live="polite">{value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{note}</p>
  </div>;
}

function Dashboard() {
  const { active: p } = useStore();
  if (!p) return <EmptyState title="Your dashboard is empty" />;
  const t = today();
  const s = planStats(p, t);
  const g = goalMetrics(p, t);
  const next = s.todays.filter((x) => !x.done);
  return <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
    <header className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <SourceBadge source={p.source} />
        <h1 className="mt-3 break-words text-2xl font-bold md:text-3xl">{p.goal}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Deadline {format(parseDay(p.targetDate), "d MMMM yyyy")}</p>
      </div>
      <Button asChild variant="outline" className="justify-self-start"><Link to="/roadmap">View roadmap <ArrowRight /></Link></Button>
    </header>

    <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Key metrics">
      <Metric label="Overall progress" value={`${percent(s.done, s.total)}%`} note={`${s.done} of ${s.total} tasks done`} />
      <Metric label="On pace" value={`${g.doneByToday} / ${g.scheduledByToday}`} note="tasks done of those due so far" />
      <Metric label="Current milestone" value={`${percent(s.monthDone, s.monthTotal)}%`} note={`${s.monthDone} of ${s.monthTotal} tasks`} />
      <Metric label="Days left" value={String(g.daysLeft)} note="until your deadline" />
    </section>
    <div className="mt-3"><ProgressBar value={ratio(s.done, s.total)} /></div>

    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <section className="min-w-0">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0"><h2 className="text-xl font-semibold">Next actions</h2><p className="mt-1 text-sm text-muted-foreground">{format(parseDay(t), "EEEE, d MMM")} · {next.length} left today</p></div>
          <span className="shrink-0 text-sm font-medium" aria-live="polite">{s.todayDone} / {s.todays.length}</span>
        </div>
        {s.todays.length ? <ul className="mt-4 space-y-2">{s.todays.map((x) => <TaskRow key={x.id} t={x} planId={p.id} />)}</ul>
          : <p className="mt-4 text-sm text-muted-foreground">No tasks scheduled today. Take a breather.</p>}
        {s.todays.length > 0 && next.length === 0 && <p role="status" className="mt-4 rounded-lg bg-success/10 p-3 text-sm font-medium text-success">All done for today. Great work!</p>}
        {s.overdue.length > 0 && <div className="mt-5 border-l-2 border-warning pl-4">
          <p className="text-sm"><b>{s.overdue.length}</b> unfinished task{s.overdue.length > 1 ? "s" : ""} from previous days. No stress — move them forward.</p>
          <Button className="mt-3" onClick={() => { store.updatePlan(rescheduleOverdue(p)); toast.success("Tasks rescheduled"); }}><RefreshCw /> Reschedule</Button>
        </div>}
      </section>
      <aside className="min-w-0 space-y-4">
        <h2 className="flex items-center gap-2 font-semibold"><Flag className="h-4 w-4 text-primary" /> Milestones</h2>
        <ol className="space-y-3">{g.milestones.map((m, i) => <li key={i} className={`rounded-lg border p-3 text-sm ${i === s.curMonth ? "border-primary/50 bg-primary-soft" : ""}`}>
          <div className="flex items-start justify-between gap-2"><span className="min-w-0 break-words font-medium">{m.title}</span>{m.complete && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}</div>
          <p className="mt-1 text-xs text-muted-foreground">Target: {m.total} tasks by {format(parseDay(m.deadline), "d MMM yyyy")}</p>
          <div className="mt-2"><ProgressBar value={ratio(m.done, m.total)} /></div>
          <p className="mt-1 text-xs text-muted-foreground">{m.done} / {m.total} done</p>
        </li>)}</ol>
        <Button asChild variant="outline" className="h-auto min-h-11 w-full whitespace-normal"><Link to="/insights"><ChartNoAxesCombined /> View My Insights <ArrowRight /></Link></Button>
      </aside>
    </div>

    <details className="group mt-10 rounded-lg border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-medium">Your plan details <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
      <dl className="grid gap-3 border-t p-4 text-sm sm:grid-cols-2">
        <div><dt className="text-muted-foreground">Goal</dt><dd className="break-words font-medium">{p.goal}</dd></div>
        <div><dt className="text-muted-foreground">Skill level</dt><dd className="font-medium">{p.level}</dd></div>
        <div><dt className="text-muted-foreground">Timeline</dt><dd className="font-medium">{p.months} month{p.months > 1 ? "s" : ""} · {format(parseDay(p.startDate), "d MMM yyyy")} – {format(parseDay(p.targetDate), "d MMM yyyy")}</dd></div>
        <div><dt className="text-muted-foreground">Available time</dt><dd className="font-medium">{p.minutesPerDay} min/day</dd></div>
      </dl>
    </details>
  </div>;
}
