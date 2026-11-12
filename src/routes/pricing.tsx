import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { FREE_PLAN_LIMIT, TIERS } from "@/lib/plans-limit";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Plans & Pricing — DreamStep" },
      { name: "description", content: `Create ${FREE_PLAN_LIMIT} goal plans free, then pick a DreamStep subscription for more.` },
      { property: "og:title", content: "Plans & Pricing — DreamStep" },
      { property: "og:description", content: "Starter, Pro and Elite subscriptions for more goal plans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-center text-3xl font-bold md:text-4xl">Want more goal plans?</h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
        Every account gets {FREE_PLAN_LIMIT} goal plans free. Choose a subscription to keep growing.
      </p>
      <p className="mt-3 text-center text-sm">
        <Link to="/plans" className="text-primary underline">Compare all plans side by side</Link>
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {TIERS.map((t, i) => (
          <div key={t.id} className={`card flex flex-col p-6 ${i === 1 ? "ring-2 ring-primary shadow-glow" : ""}`}>
            {i === 1 && <span className="mb-2 self-start rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">Most popular</span>}
            <h2 className="text-xl font-bold">{t.name}</h2>
            <p className="mt-2"><span className="text-4xl font-bold">₹{t.priceInr}</span><span className="text-muted-foreground"> / month</span></p>
            <ul className="mt-6 flex-1 space-y-2 text-sm">
              {t.perks.map((p) => <li key={p} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" />{p}</li>)}
            </ul>
            <button className={`btn mt-6 ${i === 1 ? "btn-primary" : "btn-outline"}`} onClick={() => setPicked(t.name)}>Subscribe</button>
          </div>
        ))}
      </div>
      {picked && (
        <p role="status" className="card mx-auto mt-8 max-w-xl p-4 text-center text-sm">
          Thanks for choosing {picked}! Payments are opening soon — we'll let you know when you can subscribe.
        </p>
      )}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link to="/plans" className="text-primary underline">See every plan's limits and features</Link>
        {" · "}
        <Link to="/goals" className="text-primary underline">Back to my goals</Link>
      </p>
    </div>
  );
}
