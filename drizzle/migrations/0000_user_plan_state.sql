CREATE TABLE public.user_plan_state (
  user_id uuid PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{"plans":[],"activeId":null}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_plan_state TO authenticated;
GRANT ALL ON public.user_plan_state TO service_role;
ALTER TABLE public.user_plan_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own state select" ON public.user_plan_state FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own state insert" ON public.user_plan_state FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own state update" ON public.user_plan_state FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own state delete" ON public.user_plan_state FOR DELETE TO authenticated USING (auth.uid() = user_id);