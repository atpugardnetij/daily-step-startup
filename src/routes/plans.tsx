import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { FREE_TIER, FREE_PLAN_LIMIT, PLAN_ROWS, TIERS, planLimitLabel } from "@/lib/plans-limit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Plans — DreamStep" },
      { name: "description", content: `Compare DreamStep plans: ${FREE_PLAN_LIMIT} goal plans free, then Starter, Pro or Elite for more.` },
      { property: "og:title", content: "Plans — DreamStep" },
      { property: "og:description", content: "Goal limits, features and pricing for every DreamStep plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Plans,
});

const ALL = [FREE_TIER, ...TIERS];
const IDS = ["free", "starter", "pro", "elite"];

function Plans() {
  const { plans } = useStore();
  const used = plans.length;
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-center text-3xl font-bold md:text-4xl">Every plan, side by side</h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
        Goal limits, what you get and what it costs. Start free — upgrade only when you need more goals.
      </p>

      <p className="card mx-auto mt-6 max-w-xl p-4 text-center text-sm">
        You have <span className="font-bold">{used}</span> goal
        {used === 1 ? "" : "s"} saved
        {used < FREE_PLAN_LIMIT ? ` — ${FREE_PLAN_LIMIT - used} free ${FREE_PLAN_LIMIT - used === 1 ? "spot" : "spots"} left.` : "."}
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ALL.map((t) => (
          <div key={t.id} className={`card flex flex-col p-5 ${t.id === "pro" ? "ring-2 ring-primary shadow-glow" : ""}`}>
            {t.id === "pro" && <span className="mb-2 self-start rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">Most popular</span>}
            <h2 className="text-lg font-bold">{t.name}</h2>
            <p className="mt-1">
              {t.priceInr === 0
                ? <span className="text-3xl font-bold">Free</span>
                : <><span className="text-3xl font-bold">₹{t.priceInr}</span><span className="text-muted-foreground"> / month</span></>}
            </p>
            <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-sm font-medium">
              {planLimitLabel(t.plans)} goal {planLimitLabel(t.plans) === "1" ? "plan" : "plans"}
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {t.perks.map((p) => <li key={p} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" />{p}</li>)}
            </ul>
            {t.priceInr === 0
              ? <Link to="/new" className="btn btn-outline mt-5">Add a goal</Link>
              : <Link to="/pricing" className={`btn mt-5 ${t.id === "pro" ? "btn-primary" : "btn-outline"}`}>Subscribe</Link>}
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-bold">Compare features</h2>
      <div className="card mt-4 hidden overflow-x-auto p-0 md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left font-semibold">Feature</th>
              {IDS.map((id) => (
                <th key={id} className={`px-4 py-3 text-center font-semibold ${id === "pro" ? "text-primary" : ""}`}>
                  {ALL.find((t) => t.id === id)?.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAN_ROWS.map((row) => (
              <tr key={row.label} className="border-b last:border-0">
                <td className="px-4 py-3 text-left">{row.label}</td>
                {IDS.map((id) => {
                  const v = row.values[id];
                  return (
                    <td key={id} className="px-4 py-3 text-center">
                      {typeof v === "string"
                        ? <span className="font-semibold">{v}</span>
                        : v
                          ? <Check className="mx-auto h-4 w-4 text-primary" aria-label="Included" />
                          : <X className="mx-auto h-4 w-4 text-muted-foreground" aria-label="Not included" />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Ready to grow? <Link to="/pricing" className="text-primary underline">See pricing and subscribe</Link>
        {" · "}
        <Link to="/goals" className="text-primary underline">Back to my goals</Link>
      </p>
    </div>
  );
}
