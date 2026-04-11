import { useMemo } from 'react';
import { useTransactionStore } from '@store/transaction-store';
import { useCategoryStore } from '@store/category-store';
import { CategorySummary, MonthlySummary } from '@/types';

export function useSummary(year: number, month: number): MonthlySummary {
  const transactions = useTransactionStore((s) => s.transactions);

  return useMemo(() => {
    const filtered = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    const totalIncome = filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      month,
      year,
    };
  }, [transactions, year, month]);
}

export function useTotalBalance(): number {
  const transactions = useTransactionStore((s) => s.transactions);

  return useMemo(() => {
    return transactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);
  }, [transactions]);
}

export function useTopCategories(
  year: number,
  month: number,
  limit: number = 4
): CategorySummary[] {
  const transactions = useTransactionStore((s) => s.transactions);
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);

  return useMemo(() => {
    const filtered = transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    const totalExpense = filtered.reduce((sum, t) => sum + t.amount, 0);

    const map = new Map<string, { total: number; count: number }>();
    filtered.forEach((t) => {
      const existing = map.get(t.categoryId) ?? { total: 0, count: 0 };
      map.set(t.categoryId, { total: existing.total + t.amount, count: existing.count + 1 });
    });

    const result: CategorySummary[] = [];
    map.forEach((data, categoryId) => {
      const category = getCategoryById(categoryId);
      if (category) {
        result.push({
          category,
          total: data.total,
          count: data.count,
          percentage: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0,
        });
      }
    });

    return result.sort((a, b) => b.total - a.total).slice(0, limit);
  }, [transactions, year, month, limit, getCategoryById]);
}
