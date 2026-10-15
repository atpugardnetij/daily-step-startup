import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  goal: z.string().trim().min(4).max(200),
  months: z.number().int().min(1).max(24),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  minutesPerDay: z.number().int().min(10).max(240),
});

export interface AiMilestone { title: string; summary: string; weeks: string[]; resources: string[]; dailyTasks: string[] }
export interface AiPlanResult { ok: true; nextSteps: string; milestones: AiMilestone[] }
export interface AiPlanError { ok: false; error: string; retryable: boolean }

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["nextSteps", "milestones"],
  properties: {
    nextSteps: { type: "string" },
    milestones: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "summary", "weeks", "resources", "dailyTasks"],
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
          weeks: { type: "array", items: { type: "string" } },
          resources: { type: "array", items: { type: "string" } },
          dailyTasks: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

export const generateAiPlan = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<AiPlanResult | AiPlanError> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false, error: "AI planning isn't configured on the server yet.", retryable: false };

    const prompt = `Create a personalised learning/achievement roadmap.
Goal: ${data.goal}
Timeline: ${data.months} month(s)
Current level: ${data.level}
Daily time available: ${data.minutesPerDay} minutes

Return exactly ${data.months} milestones, one per month, in order. Each milestone:
- title: "Month N: <short phase name>"
- summary: one sentence
- weeks: exactly 4 weekly objectives, each starting "Week 1:", "Week 2:" etc.
- resources: 2-4 concrete, real resource suggestions (types or well-known free resources)
- dailyTasks: exactly 7 specific daily tasks for that month, each doable in about ${data.minutesPerDay} minutes, written as natural imperative sentences (don't just paste the goal text).
nextSteps: 2-3 encouraging, non-judgemental sentences on how to start. Consistency over perfection.`;

    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
        body: JSON.stringify({
          model: "google/gemini-3.8-flash",
          stream: true,
          messages: [
            { role: "system", content: "You are DreamStep, an expert, encouraging goal-planning coach. Output only JSON matching the schema." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_schema", json_schema: { name: "roadmap", strict: true, schema } },
        }),
      });
    } catch (e) {
      console.error("AI gateway network error", e);
      return { ok: false, error: "Couldn't reach the AI service. Please try again.", retryable: true };
    }

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      console.error("AI gateway error", res.status, body);
      let msg = "";
      try { msg = JSON.parse(body)?.error?.message ?? JSON.parse(body)?.message ?? ""; } catch { /* ignore */ }
      if (res.status === 429) return { ok: false, error: "The AI is busy right now. Please wait a moment and try again.", retryable: true };
      if (res.status === 402) return { ok: false, error: msg || "AI credits have run out for this workspace.", retryable: false };
      if (res.status === 403) return { ok: false, error: msg || "AI access is blocked for this workspace.", retryable: false };
      return { ok: false, error: "The AI service had a problem generating your roadmap.", retryable: res.status >= 500 };
    }

    // Consume SSE stream server-side
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") continue;
        try { text += JSON.parse(payload)?.choices?.[0]?.delta?.content ?? ""; } catch { /* partial */ }
      }
    }

    try {
      const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
      const parsed = JSON.parse(cleaned) as { nextSteps: string; milestones: AiMilestone[] };
      const ms = parsed.milestones.filter((m) => m.dailyTasks?.length);
      if (!ms.length) throw new Error("no milestones");
      return { ok: true, nextSteps: parsed.nextSteps, milestones: ms.slice(0, data.months) };
    } catch (e) {
      console.error("AI parse error", e, text.slice(0, 500));
      return { ok: false, error: "The AI returned an incomplete roadmap. Please try again.", retryable: true };
    }
  });
