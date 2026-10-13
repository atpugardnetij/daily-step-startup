import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Footprints, Mail, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — DreamStep" },
      { name: "description", content: "Sign in or create your DreamStep account to keep your goals and roadmaps in sync." },
      { property: "og:title", content: "Sign in — DreamStep" },
      { property: "og:description", content: "Sign in or create your DreamStep account to keep your goals and roadmaps in sync." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<"confirm" | "reset" | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent("reset");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setSent("confirm");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/goals" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-primary-foreground shadow-glow">
        <Footprints className="h-7 w-7" />
      </span>
      <h1 className="mt-6 font-display text-2xl font-bold">
        {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back"}
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {mode === "signup"
          ? "Sign up to keep your dreams and roadmaps safe."
          : mode === "forgot"
            ? "We'll email you a link to set a new password."
            : "Sign in to pick up where you left off."}
      </p>

      {sent ? (
        <div className="card mt-8 w-full p-6 text-center">
          <Mail className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm font-medium">
            {sent === "confirm"
              ? "Check your email to confirm your account, then sign in."
              : "Check your email for a password reset link."}
          </p>
          <button className="btn btn-outline mt-4" onClick={() => { setSent(null); setMode("signin"); }}>
            Back to sign in
          </button>
        </div>
      ) : (
        <>
          <button onClick={google} className="btn btn-outline mt-8 w-full" type="button">
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"/></svg>
            Continue with Google
          </button>

          <div className="my-5 flex w-full items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="w-full space-y-3">
            <label className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            {mode !== "forgot" && (
              <label className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (6+ characters)"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
            )}
            <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
              <LogIn className="h-4 w-4" />
              {busy ? "Please wait…" : mode === "signup" ? "Sign up" : mode === "forgot" ? "Send reset link" : "Sign in"}
            </button>
          </form>

          <div className="mt-5 flex flex-col items-center gap-2 text-sm">
            {mode === "signin" && (
              <>
                <button className="text-primary hover:underline" onClick={() => setMode("forgot")}>Forgot your password?</button>
                <p className="text-muted-foreground">
                  New here?{" "}
                  <button className="font-medium text-primary hover:underline" onClick={() => setMode("signup")}>Create an account</button>
                </p>
              </>
            )}
            {mode !== "signin" && (
              <button className="text-primary hover:underline" onClick={() => setMode("signin")}>Back to sign in</button>
            )}
          </div>
        </>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">← Back to home</Link>
      </p>
    </div>
  );
}
