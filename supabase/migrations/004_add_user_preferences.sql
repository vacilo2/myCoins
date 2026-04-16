-- =============================================================================
-- myCoins — Tabela de preferências por usuário
-- Execute no Supabase: SQL Editor > New Query > Run
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id                  uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                     text        NOT NULL DEFAULT '',
  currency                 text        NOT NULL DEFAULT 'BRL',
  theme                    text        NOT NULL DEFAULT 'light',
  monthly_income           numeric     NOT NULL DEFAULT 0,
  saved_amount             numeric     NOT NULL DEFAULT 0,
  onboarding_completed     boolean     NOT NULL DEFAULT false,
  financial_goal           text        NOT NULL DEFAULT '',
  spending_profile         text        NOT NULL DEFAULT 'desconhecido',
  top_spending_categories  jsonb       NOT NULL DEFAULT '[]',
  income_type              text        NOT NULL DEFAULT '',
  savings_goal_pct         numeric     NOT NULL DEFAULT 0,
  updated_at               timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences: own data" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);
