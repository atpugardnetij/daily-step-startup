import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { store, useStore } from "@/lib/store";
import { ProgressBar } from "@/components/Header";
import { EmptyState, SourceBadge } from "./roadmap";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "My Goals — DreamStep" },
      { name: "description", content: "All your dreams and their progress in one place." },
      { property: "og:title", content: "My Goals — DreamStep" },
      { property: "og:description", content: "Manage and switch between your goals." },
    ],
  }),
  component: Goals,
});

function Goals() {
  const { plans, activeId } = useStore();
  const nav = useNavigate();
  if (!plans.length) return <EmptyState title="No goals yet" />;
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Goals</h1>
        <Link to="/new" className="btn btn-primary"><Plus className="h-4 w-4" /> New goal</Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {plans.map((p) => {
          const r = p.tasks.filter((t) => t.done).length / p.tasks.length;
          return (
            <div key={p.id} className={`card p-5 ${p.id === activeId ? "ring-2 ring-primary" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <SourceBadge source={p.source} />
                <button aria-label="Delete goal" onClick={() => confirm("Delete this goal?") && store.removePlan(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
              <h2 className="mt-2 text-lg font-semibold">{p.goal}</h2>
              <p className="text-sm text-muted-foreground">{p.months} months · {p.level} · {p.minutesPerDay} min/day</p>
              <div className="mt-4"><ProgressBar value={r} /></div>
              <p className="mt-1 text-xs text-muted-foreground">{Math.round(r * 100)}% complete</p>
              <button className="btn btn-outline mt-4 w-full" onClick={() => { store.setActive(p.id); nav({ to: "/dashboard" }); }}>{p.id === activeId ? "Continue" : "Open"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
