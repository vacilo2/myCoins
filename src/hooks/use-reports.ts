import { useMemo } from 'react';
import { useTransactionStore } from '@store/transaction-store';
import { useCategoryStore } from '@store/category-store';
import { CategorySummary } from '@/types';

export interface MonthlyChartData {
  month: string;
  income: number;
  expense: number;
}

export function useMonthlyChart(monthsBack: number = 6): MonthlyChartData[] {
  const transactions = useTransactionStore((s) => s.transactions);

  return useMemo(() => {
    const result: MonthlyChartData[] = [];
    const now = new Date();

    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const filtered = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });

      const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      result.push({ month: monthNames[month - 1], income, expense });
    }

    return result;
  }, [transactions, monthsBack]);
}

export function useCategoryReport(year: number, month: number): CategorySummary[] {
  const transactions = useTransactionStore((s) => s.transactions);
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);

  return useMemo(() => {
    const filtered = transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    const totalExpense = filtered.reduce((s, t) => s + t.amount, 0);
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

    return result.sort((a, b) => b.total - a.total);
  }, [transactions, year, month, getCategoryById]);
}
