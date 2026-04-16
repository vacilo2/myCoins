-- =============================================================================
-- myCoins — Adiciona campos de parcelamento em transactions
-- Execute no Supabase: SQL Editor > New Query > Run
-- =============================================================================

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS payment_method       text    NOT NULL DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS installment_index    integer,
  ADD COLUMN IF NOT EXISTS installment_total    integer,
  ADD COLUMN IF NOT EXISTS installment_group_id text;

-- Índice para deleteInstallmentGroup (filtra por grupo de parcelas)
CREATE INDEX IF NOT EXISTS idx_transactions_installment_group
  ON public.transactions (installment_group_id)
  WHERE installment_group_id IS NOT NULL;
