import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, CalendarClock, Flag, RefreshCw, ArrowRight, ChartNoAxesCombined } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { store, useStore } from "@/lib/store";
import { rescheduleOverdue, today, type Task } from "@/lib/planner";
import { parseDay, percent, planStats, ratio } from "@/lib/dashboard";
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

function Dashboard() {
  const { active: p } = useStore();
  if (!p) return <EmptyState title="Your dashboard is empty" />;
  const s = planStats(p, today());
  return <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
    <header className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <SourceBadge source={p.source} />
        <p className="mt-3 text-xs font-semibold text-muted-foreground">CURRENT GOAL</p>
        <h1 className="mt-1 break-words text-2xl font-bold md:text-3xl">{p.goal}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Target {format(parseDay(p.targetDate), "d MMMM yyyy")}</p>
      </div>
      <Button asChild variant="outline" className="justify-self-start"><Link to="/roadmap">View roadmap <ArrowRight /></Link></Button>
    </header>

    <section className="mt-6 border-y py-5" aria-label="Goal progress">
      <div className="flex items-center justify-between gap-4 text-sm"><span className="font-medium">Overall progress</span><span className="text-lg font-semibold" aria-live="polite">{percent(s.done, s.total)}%</span></div>
      <div className="mt-3"><ProgressBar value={ratio(s.done, s.total)} /></div>
      <p className="mt-2 text-xs text-muted-foreground">{s.done} of {s.total} tasks completed</p>
    </section>

    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <section className="min-w-0">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0"><h2 className="text-xl font-semibold">Today's tasks</h2><p className="mt-1 text-sm text-muted-foreground">{format(parseDay(today()), "EEEE, d MMM")}</p></div>
          <span className="shrink-0 text-sm font-medium" aria-live="polite">{s.todayDone} / {s.todays.length}</span>
        </div>
        {s.todays.length ? <ul className="mt-4 space-y-2">{s.todays.map((x) => <TaskRow key={x.id} t={x} planId={p.id} />)}</ul>
          : <p className="mt-4 text-sm text-muted-foreground">No tasks scheduled today. Take a breather.</p>}
        {s.todays.length > 0 && s.todayDone === s.todays.length && <p role="status" className="mt-4 rounded-lg bg-success/10 p-3 text-sm font-medium text-success">All done for today. Great work!</p>}
        {s.overdue.length > 0 && <div className="mt-5 border-l-2 border-warning pl-4">
          <p className="text-sm"><b>{s.overdue.length}</b> unfinished task{s.overdue.length > 1 ? "s" : ""} from previous days. No stress — move them forward.</p>
          <Button className="mt-3" onClick={() => { store.updatePlan(rescheduleOverdue(p)); toast.success("Tasks rescheduled"); }}><RefreshCw /> Reschedule</Button>
        </div>}
      </section>
      <aside className="min-w-0 space-y-6">
        <section><h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Flag className="h-4 w-4 text-primary" /> Current milestone</h2>
          <p className="mt-2 break-words font-semibold">{s.milestone?.title ?? "No milestone yet"}</p>
          <p className="mt-2 text-sm text-muted-foreground">{s.milestone?.summary}</p>
        </section>
        <Button asChild className="h-auto min-h-11 w-full whitespace-normal"><Link to="/insights"><ChartNoAxesCombined /> View My Insights <ArrowRight /></Link></Button>
      </aside>
    </div>
    <section className="mt-8 border-t pt-6">
      <h2 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4 text-primary" /> Upcoming</h2>
      {s.upcoming.length ? <ul className="mt-3 grid gap-3 sm:grid-cols-2">{s.upcoming.map((x) => <li key={x.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-lg bg-secondary p-3 text-sm"><span className="min-w-0 break-words">{x.title}</span><span className="shrink-0 text-xs text-muted-foreground">{format(parseDay(x.date), "d MMM")}</span></li>)}</ul>
        : <p className="mt-3 text-sm text-muted-foreground">No upcoming tasks.</p>}
    </section>
  </div>;
}
