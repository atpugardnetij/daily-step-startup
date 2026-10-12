import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { store, useStore } from "@/lib/store";
import { adjustDailyTime } from "@/lib/planner";
import { ThemeToggle } from "@/components/Header";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — DreamStep" },
      { name: "description", content: "Adjust your daily time, theme and data in DreamStep." },
      { property: "og:title", content: "Settings — DreamStep" },
      { property: "og:description", content: "Adjust your plan and preferences." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { active } = useStore();
  const [mins, setMins] = useState(30);
  useEffect(() => { if (active) setMins(active.minutesPerDay); }, [active?.id]);
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <h1 className="text-3xl font-bold">Settings</h1>
      <section className="card flex items-center justify-between p-5">
        <div><h2 className="font-semibold">Appearance</h2><p className="text-sm text-muted-foreground">Switch between light and dark mode.</p></div>
        <ThemeToggle />
      </section>
      <section className="card p-5">
        <h2 className="font-semibold">Daily time for current goal</h2>
        {active ? (
          <>
            <p className="text-sm text-muted-foreground">Changing this rebuilds your upcoming tasks. Completed tasks are kept.</p>
            <div className="mt-4 flex items-center gap-3">
              <select className="field max-w-40" value={mins} onChange={(e) => setMins(+e.target.value)}>
                {[15, 30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} minutes</option>)}
              </select>
              <button className="btn btn-primary" disabled={mins === active.minutesPerDay} onClick={() => { store.updatePlan(adjustDailyTime(active, mins)); toast.success("Roadmap adjusted"); }}>Update plan</button>
            </div>
          </>
        ) : <p className="text-sm text-muted-foreground">Create a goal first.</p>}
      </section>
      <section className="card p-5">
        <h2 className="font-semibold">AI planning</h2>
        <p className="text-sm text-muted-foreground">Not connected. DreamStep currently creates sample plans on your device, free of charge. AI-generated plans can be enabled later.</p>
      </section>
      <section className="card p-5">
        <h2 className="font-semibold text-destructive">Reset data</h2>
        <p className="text-sm text-muted-foreground">Delete all goals and progress saved on this device.</p>
        <button className="btn btn-outline mt-4 text-destructive" onClick={() => { if (confirm("Delete all data?")) { store.reset(); toast("All data cleared"); } }}>Delete everything</button>
      </section>
    </div>
  );
}
