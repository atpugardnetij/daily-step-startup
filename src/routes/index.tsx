import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Map, ListChecks, TrendingUp, Target, Clock, RefreshCw, Smartphone, CheckCircle2, Circle } from "lucide-react";
import { ProgressBar } from "@/components/Header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DreamStep — Turn your dream into today's action" },
      { name: "description", content: "DreamStep turns your long-term goals into a clear roadmap and small, realistic daily tasks." },
      { property: "og:title", content: "DreamStep — Turn your dream into today's action" },
      { property: "og:description", content: "Enter a dream, get a roadmap, complete daily tasks and track progress." },
    ],
  }),
  component: Home,
});

const steps = [
  { icon: Sparkles, t: "Dream", d: "Tell us what you want to achieve." },
  { icon: Map, t: "Roadmap", d: "Get monthly milestones and weekly goals." },
  { icon: ListChecks, t: "Daily Tasks", d: "Small actions that fit your day." },
  { icon: TrendingUp, t: "Progress", d: "Watch consistency turn into results." },
];
const benefits = [
  { icon: Target, t: "Clarity", d: "No more vague goals — know exactly what to do today." },
  { icon: Clock, t: "Fits your time", d: "Plans adapt to 15 minutes or 2 hours a day." },
  { icon: RefreshCw, t: "Adapts with you", d: "Fell behind? Reschedule in one click." },
  { icon: Smartphone, t: "Anywhere", d: "Works beautifully on phone, tablet and desktop." },
];

function Home() {
  return (
    <div>
      <section className="bg-hero">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center md:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-primary"><Sparkles className="h-3.5 w-3.5" /> Turn your dream into today's action</span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold md:text-6xl">Big dreams, broken into <span className="bg-brand bg-clip-text text-transparent">small daily steps</span>.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">DreamStep builds a personalised roadmap from your goal, timeline and available time — then tells you exactly what to do today.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/new" className="btn btn-primary !px-6 !py-3 text-base">Start Your Journey <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/dashboard" className="btn btn-outline !px-6 !py-3 text-base">View Dashboard</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.t} className="card relative p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary"><s.icon className="h-5 w-5" /></span>
                <span className="font-display text-3xl font-bold text-border">0{i + 1}</span>
              </div>
              <h3 className="font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">Your day, made obvious.</h2>
          <p className="mt-4 text-muted-foreground">Open your dashboard and see today's tasks, your current milestone and overall progress at a glance. Check off a task and watch your progress move instantly.</p>
          <Link to="/new" className="btn btn-primary mt-6">Build My Roadmap <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Goal</p>
          <p className="font-display text-lg font-semibold">Become a frontend developer</p>
          <div className="mt-4 flex items-center justify-between text-sm"><span className="text-muted-foreground">Overall progress</span><span className="font-semibold">38%</span></div>
          <div className="mt-2"><ProgressBar value={0.38} /></div>
          <div className="mt-5 rounded-lg bg-primary-soft p-3 text-sm"><span className="font-semibold text-primary">Month 2:</span> Guided practice</div>
          <ul className="mt-4 space-y-2">
            {[["Study one core concept of CSS layout", true], ["Do a 20-min practice exercise", true], ["Write notes summarising today's learning", false]].map(([t, d]) => (
              <li key={t as string} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                {d ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                <span className={d ? "text-muted-foreground line-through" : ""}>{t as string}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-center text-3xl font-bold">Why DreamStep</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.t} className="card p-6">
              <b.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{b.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
