import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Info, RotateCw } from "lucide-react";
import { generateSamplePlan, buildAiPlan, type Level } from "@/lib/planner";
import { generateAiPlan } from "@/lib/ai-plan.functions";
import { store } from "@/lib/store";

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "Build My Roadmap — DreamStep" },
      { name: "description", content: "Tell DreamStep your dream, timeline, level and daily time to get a personalised roadmap." },
      { property: "og:title", content: "Build My Roadmap — DreamStep" },
      { property: "og:description", content: "Create a personalised roadmap from your dream in seconds." },
    ],
  }),
  component: NewGoal,
});

const LEVELS: Level[] = ["Beginner", "Intermediate", "Advanced"];
const TIMES = [15, 30, 45, 60, 90, 120];

function NewGoal() {
  const nav = useNavigate();
  const [goal, setGoal] = useState("");
  const [months, setMonths] = useState(3);
  const [level, setLevel] = useState<Level>("Beginner");
  const [minutes, setMinutes] = useState(30);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState<{ msg: string; retryable: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const runAi = useServerFn(generateAiPlan);

  const generate = async () => {
    setAiError(null); setLoading(true);
    const input = { goal: goal.trim(), months, level, minutesPerDay: minutes };
    try {
      const r = await runAi({ data: input });
      if (!r.ok) { setAiError({ msg: r.error, retryable: r.retryable }); return; }
      store.addPlan(buildAiPlan(input, r));
      nav({ to: "/roadmap" });
    } catch (e) {
      console.error(e);
      setAiError({ msg: "Something went wrong while building your roadmap. Please try again.", retryable: true });
    } finally { setLoading(false); }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim().length < 4) return setError("Please describe your dream in a few words (at least 4 characters).");
    if (!months || months < 1 || months > 24) return setError("Choose a timeline between 1 and 24 months.");
    setError("");
    void generate();
  };

  const useSample = () => {
    store.addPlan(generateSamplePlan({ goal: goal.trim(), months, level, minutesPerDay: minutes }));
    nav({ to: "/roadmap" });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold md:text-4xl">What's your dream?</h1>
      <p className="mt-2 text-muted-foreground">Answer four quick questions and we'll turn it into daily action.</p>
      <form onSubmit={submit} className="card mt-8 space-y-6 p-6 md:p-8">
        <label className="block">
          <span className="text-sm font-semibold">What is your dream or goal?</span>
          <textarea className="field mt-2 min-h-24" value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={200} placeholder="e.g. Learn Python, Run a half marathon, Speak Spanish" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">In how many months? <span className="text-primary">{months}</span></span>
          <input type="range" min={1} max={24} value={months} onChange={(e) => setMonths(+e.target.value)} className="mt-3 w-full accent-[var(--color-primary)]" />
          <div className="flex justify-between text-xs text-muted-foreground"><span>1 month</span><span>24 months</span></div>
        </label>
        <div>
          <span className="text-sm font-semibold">Your current level</span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button type="button" key={l} onClick={() => setLevel(l)} className={`rounded-lg border p-3 text-sm font-medium transition ${level === l ? "border-primary bg-primary-soft text-primary" : "hover:bg-secondary"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-sm font-semibold">Time you can dedicate daily</span>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {TIMES.map((t) => (
              <button type="button" key={t} onClick={() => setMinutes(t)} className={`rounded-lg border p-2.5 text-sm font-medium transition ${minutes === t ? "border-primary bg-primary-soft text-primary" : "hover:bg-secondary"}`}>{t < 60 ? `${t}m` : `${t / 60}h`}</button>
            ))}
          </div>
        </div>
        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {aiError && (
          <div role="alert" className="space-y-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <p>{aiError.msg}</p>
            <div className="flex flex-wrap gap-2">
              {aiError.retryable && <button type="button" onClick={() => void generate()} className="btn btn-primary !py-1.5 text-sm"><RotateCw className="h-4 w-4" /> Try again</button>}
              <button type="button" onClick={useSample} className="btn btn-outline !py-1.5 text-sm">Use a sample plan instead</button>
            </div>
          </div>
        )}
        <button disabled={loading} className="btn btn-primary w-full !py-3 text-base">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> AI is building your roadmap… (up to a minute)</> : <><Sparkles className="h-4 w-4" /> Build My Roadmap</>}
        </button>
        <p className="flex items-start gap-2 text-xs text-muted-foreground"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Your roadmap is generated by AI (Google Gemini) from your answers. Plans are saved on this device.</p>
      </form>
    </div>
  );
}
