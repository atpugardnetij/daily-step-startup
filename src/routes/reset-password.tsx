import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Lock, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — DreamStep" },
      { name: "description", content: "Set a new password for your DreamStep account." },
      { property: "og:title", content: "Reset password — DreamStep" },
      { property: "og:description", content: "Set a new password for your DreamStep account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated — you're signed in!");
      navigate({ to: "/goals" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-primary-foreground shadow-glow">
        <KeyRound className="h-7 w-7" />
      </span>
      <h1 className="mt-6 font-display text-2xl font-bold">Set a new password</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Choose a new password for your account.
      </p>

      <form onSubmit={submit} className="mt-8 w-full space-y-3">
        <label className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (6+ characters)"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <label className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link to="/auth" className="hover:underline">← Back to sign in</Link>
      </p>
    </div>
  );
}
