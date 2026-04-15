import { supabase } from '@services/auth/supabase';
import type { Transaction, Category } from '@/types';

// ---------------------------------------------------------------------------
// Helpers de mapeamento (snake_case Supabase ↔ camelCase app)
// ---------------------------------------------------------------------------
function toDbTransaction(t: Transaction, userId: string) {
  return {
    id:          t.id,
    user_id:     userId,
    type:        t.type,
    amount:      t.amount,
    category_id: t.categoryId,
    description: t.description,
    date:        t.date,
    created_at:  t.createdAt,
  };
}

function fromDbTransaction(row: Record<string, any>): Transaction {
  return {
    id:          row.id,
    type:        row.type,
    amount:      Number(row.amount),
    categoryId:  row.category_id,
    description: row.description,
    date:        row.date,
    createdAt:   row.created_at,
  };
}

function toDbCategory(c: Category, userId: string) {
  return {
    id:         c.id,
    user_id:    userId,
    name:       c.name,
    type:       c.type,
    icon:       c.icon,
    color:      c.color,
    is_default: c.isDefault,
  };
}

function fromDbCategory(row: Record<string, any>): Category {
  return {
    id:        row.id,
    name:      row.name,
    type:      row.type,
    icon:      row.icon,
    color:     row.color,
    isDefault: row.is_default,
  };
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------
export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) { console.error('[db] fetchTransactions:', error.message); return []; }
  return (data ?? []).map(fromDbTransaction);
}

export async function upsertTransaction(t: Transaction, userId: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .upsert(toDbTransaction(t, userId));
  if (error) console.error('[db] upsertTransaction:', error.message);
}

export async function removeTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) console.error('[db] removeTransaction:', error.message);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export async function fetchCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) { console.error('[db] fetchCategories:', error.message); return []; }
  return (data ?? []).map(fromDbCategory);
}

export async function upsertCategory(c: Category, userId: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .upsert(toDbCategory(c, userId));
  if (error) console.error('[db] upsertCategory:', error.message);
}

export async function removeCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) console.error('[db] removeCategory:', error.message);
}

export async function upsertCategories(categories: Category[], userId: string): Promise<void> {
  const rows = categories.map(c => toDbCategory(c, userId));
  const { error } = await supabase.from('categories').upsert(rows);
  if (error) console.error('[db] upsertCategories:', error.message);
}
