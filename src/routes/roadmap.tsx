import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Flag } from "lucide-react";
import { useStore } from "@/lib/store";
import { format } from "date-fns";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Your Roadmap — DreamStep" },
      { name: "description", content: "Monthly milestones, weekly objectives and daily tasks for your dream." },
      { property: "og:title", content: "Your Roadmap — DreamStep" },
      { property: "og:description", content: "See the step-by-step plan for your dream." },
    ],
  }),
  component: Roadmap,
});

export function SourceBadge({ source }: { source: "sample" | "ai" }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${source === "ai" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>{source === "ai" ? "AI-generated plan" : "Sample plan"}</span>;
}

export function EmptyState({ title = "No goal yet" }: { title?: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground">Start by telling us your dream — we'll build the plan.</p>
      <Link to="/new" className="btn btn-primary mt-6">Start Your Journey <ArrowRight className="h-4 w-4" /></Link>
    </div>
  );
}

function Roadmap() {
  const { active: p } = useStore();
  if (!p) return <EmptyState />;
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <SourceBadge source={p.source} />
      <h1 className="mt-3 text-3xl font-bold md:text-4xl">{p.goal}</h1>
      <p className="mt-2 text-muted-foreground">{p.level} · {p.minutesPerDay} min/day · Target {format(new Date(p.targetDate), "d MMM yyyy")}</p>
      <div className="card mt-6 border-primary/30 bg-primary-soft p-5">
        <h2 className="font-semibold">Your next steps</h2>
        <p className="mt-1 text-sm text-muted-foreground">{p.nextSteps}</p>
        <Link to="/dashboard" className="btn btn-primary mt-4">Go to today's tasks <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <ol className="relative mt-10 space-y-6 border-l-2 border-primary/30 pl-6">
        {p.milestones.map((m, i) => {
          const sample = p.tasks.filter((t) => t.month === i).slice(0, 3);
          return (
            <li key={i} className="relative">
              <span className="absolute -left-[33px] grid h-6 w-6 place-items-center rounded-full bg-brand text-primary-foreground"><Flag className="h-3 w-3" /></span>
              <div className="card p-5">
                <h3 className="text-lg font-semibold">{m.title}</h3>
                <p className="text-sm text-muted-foreground">{m.summary}</p>
                <ul className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">{m.weeks.map((w) => <li key={w} className="rounded-md bg-secondary px-3 py-2">{w}</li>)}</ul>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Example daily tasks</p>
                <ul className="mt-1 list-disc pl-5 text-sm">{sample.map((t) => <li key={t.id}>{t.title}</li>)}</ul>
                {i === 0 && <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground"><BookOpen className="mt-0.5 h-4 w-4 text-primary" /> {m.resources.join(" · ")}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
