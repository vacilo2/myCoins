-- =============================================================================
-- myCoins — Migra transactions.date de text para date
-- Seguro: todos os registros usam formato "yyyy-MM-dd" (gerado por toISODate)
-- Execute no Supabase: SQL Editor > New Query > Run
-- =============================================================================

ALTER TABLE public.transactions
  ALTER COLUMN date TYPE date USING date::date;

-- Recriar índice com tipo date nativo (ordenação correta e mais eficiente)
DROP INDEX IF EXISTS idx_transactions_user_date;
CREATE INDEX idx_transactions_user_date ON public.transactions (user_id, date DESC);
