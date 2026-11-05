import { supabase } from "@/integrations/supabase/client";
import { getState, onLocalChange, parseSaved, replaceState, type State } from "./store";
import { mergeStates } from "./sync-merge";

const OWNER_KEY = "dreamstep:owner";
let userId: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let pending = false;
let lastRemoteAt: string | null = null;

async function push() {
  if (timer) { clearTimeout(timer); timer = null; }
  if (!userId || !pending) return;
  pending = false;
  const updated_at = new Date().toISOString();
  const { error } = await supabase.from("user_plan_state")
    .upsert({ user_id: userId, data: getState() as never, updated_at });
  if (error) { pending = true; console.warn("DreamStep sync failed, will retry", error.message); timer = setTimeout(push, 5000); }
  else lastRemoteAt = updated_at;
}
export async function flushSync() { await push(); }

async function fetchRemote(): Promise<{ state: State; at: string } | null> {
  if (!userId) return null;
  const { data, error } = await supabase.from("user_plan_state").select("data, updated_at").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data ? { state: parseSaved(JSON.stringify(data.data)), at: data.updated_at } : null;
}

async function signedIn(id: string) {
  if (userId === id) return;
  userId = id;
  const owner = localStorage.getItem(OWNER_KEY);
  const local = getState();
  try {
    const remote = await fetchRemote();
    // Device data from a different account is never mixed into this one.
    const base = owner && owner !== id ? { plans: [], activeId: null } : local;
    const merged = remote ? mergeStates(base, remote.state) : base;
    lastRemoteAt = remote?.at ?? null;
    replaceState(merged);
    localStorage.setItem(OWNER_KEY, id);
    if (!remote || merged.plans.length !== remote.state.plans.length || merged.activeId !== remote.state.activeId) {
      pending = true; await push();
    }
  } catch (e) { console.warn("DreamStep: could not load saved goals", e); userId = null; }
}

async function refresh() {
  if (!userId || pending || document.visibilityState !== "visible") return;
  try {
    const remote = await fetchRemote();
    if (remote && remote.at !== lastRemoteAt && !pending) { lastRemoteAt = remote.at; replaceState(remote.state); }
  } catch { /* offline: try again later */ }
}

/** Start syncing plans with the signed-in account. Call once from the root, in useEffect. */
export function startSync() {
  const offLocal = onLocalChange(() => {
    if (!userId) return;
    pending = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(push, 600);
  });
  supabase.auth.getUser().then(({ data }) => { if (data.user) void signedIn(data.user.id); });
  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) void signedIn(session.user.id);
    if (event === "SIGNED_OUT") {
      userId = null; pending = false; lastRemoteAt = null;
      // Goals are safe in the account; clear them from this device for privacy.
      localStorage.removeItem(OWNER_KEY);
      replaceState({ plans: [], activeId: null });
    }
  });
  const onVis = () => { if (document.visibilityState === "visible") void refresh(); else void push(); };
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("focus", refresh);
  const poll = setInterval(refresh, 15000);
  return () => { offLocal(); sub.subscription.unsubscribe(); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", refresh); clearInterval(poll); };
}
