// ============= Full file contents =============
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, BrainCircuit, Wrench, Linkedin, Instagram, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — DreamStep" },
      { name: "description", content: "Meet Jitendra Gupta, the Class 12 student behind DreamStep — an aspiring AI/ML engineer passionate about technology, learning and building useful products." },
      { property: "og:title", content: "About — DreamStep" },
      { property: "og:description", content: "Meet Jitendra Gupta, the Class 12 student behind DreamStep." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://dreamstep.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://dreamstep.lovable.app/about" }],
  }),
  component: About,
});

const facts = [
  { icon: GraduationCap, label: "Currently", value: "Class 12 student" },
  { icon: BrainCircuit, label: "Aiming for", value: "AI/ML engineering" },
  { icon: Wrench, label: "Building", value: "DreamStep" },
];

function About() {
  return (
    <div>
      <section className="bg-hero">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center md:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-primary"><Sparkles className="h-3.5 w-3.5" /> Meet the maker</span>
          <div className="mx-auto mt-8 grid h-24 w-24 place-items-center rounded-3xl bg-brand font-display text-3xl font-bold text-primary-foreground shadow-glow">JG</div>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold md:text-5xl">Hi, I'm Jitendra Gupta — <span className="bg-brand bg-clip-text text-transparent">the student behind DreamStep</span>.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">A Class 12 student and aspiring AI/ML engineer who loves technology, learning new things, and turning ideas into products people actually use.</p>
          <div className="mt-7 flex justify-center gap-3">
            <a href="https://www.linkedin.com/in/iamjitendragupta" target="_blank" rel="noopener noreferrer" aria-label="Jitendra Gupta on LinkedIn (opens in a new tab)" className="btn btn-outline !p-3">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="https://instagram.com/atpugardnetij" target="_blank" rel="noopener noreferrer" aria-label="Jitendra Gupta on Instagram (opens in a new tab)" className="btn btn-outline !p-3">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {facts.map((f) => (
            <div key={f.label} className="card flex items-center gap-4 p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><f.icon className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{f.label}</p>
                <p className="font-display font-semibold">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-12">
        <div className="card p-8 md:p-10">
          <h2 className="text-2xl font-bold md:text-3xl">My story</h2>
          <div className="mt-5 space-y-4 leading-relaxed text-muted-foreground">
            <p>
              I'm a Class 12 student, which means my days are a mix of schoolwork, exam prep and everything else competing for my attention. Somewhere in that busy schedule, I got drawn to artificial intelligence and machine learning — not just as subjects to study, but as tools that can genuinely help people.
            </p>
            <p>
              That curiosity turned into a habit: learning a little every day, experimenting, and building. DreamStep is the result of that habit. It's a goal-planning platform I created to turn big, overwhelming dreams into a clear roadmap and small daily tasks — the same approach I try to follow in my own life as a student.
            </p>
            <p>
              Building DreamStep has taught me as much as any textbook: how to design something people understand at a glance, how to work with AI, and how to keep improving a product one step at a time. I'm still learning, still a student, and that's exactly the point — consistency over perfection.
            </p>
            <p>
              If you have a goal you've been putting off, DreamStep was built for you. And if you'd like to say hi or follow along, I'd love to hear from you.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href="https://www.linkedin.com/in/iamjitendragupta" target="_blank" rel="noopener noreferrer" className="btn btn-outline !gap-2">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
            <a href="https://instagram.com/atpugardnetij" target="_blank" rel="noopener noreferrer" className="btn btn-outline !gap-2">
              <Instagram className="h-4 w-4" /> Instagram
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">Ready to take your first step?</h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">Tell DreamStep your goal, and get a roadmap with small daily tasks you can actually keep up with.</p>
        <Link to="/new" className="btn btn-primary mt-6">Start Your Journey <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}
