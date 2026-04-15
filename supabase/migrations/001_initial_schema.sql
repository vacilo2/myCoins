-- =============================================================================
-- myCoins — Schema inicial
-- Execute este arquivo no Supabase: SQL Editor > New Query > Run
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Tabela: categories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id          text        PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  type        text        NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  icon        text        NOT NULL DEFAULT '',
  color       text        NOT NULL DEFAULT '#6B7280',
  is_default  boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Tabela: transactions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id          text        PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text        NOT NULL CHECK (type IN ('income', 'expense')),
  amount      numeric     NOT NULL CHECK (amount > 0),
  category_id text        NOT NULL,
  description text        NOT NULL DEFAULT '',
  date        text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Cada usuário só acessa os próprios dados
CREATE POLICY "categories: own data" ON public.categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "transactions: own data" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Índices para performance
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_categories_user        ON public.categories  (user_id);
