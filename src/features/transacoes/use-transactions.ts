import { useMemo, useState } from 'react';
import { useTransactionStore } from '@store/transaction-store';
import { Transaction, TransactionType } from '@/types';

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  search?: string;
  month?: number;
  year?: number;
}

export function useTransactions(filters?: TransactionFilters) {
  const transactions = useTransactionStore((s) => s.transactions);

  return useMemo(() => {
    let result = [...transactions];

    if (filters?.type) {
      result = result.filter((t) => t.type === filters.type);
    }

    if (filters?.categoryId) {
      result = result.filter((t) => t.categoryId === filters.categoryId);
    }

    if (filters?.month && filters?.year) {
      result = result.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === filters.year && d.getMonth() + 1 === filters.month;
      });
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((t) => t.description.toLowerCase().includes(q));
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filters?.type, filters?.categoryId, filters?.search, filters?.month, filters?.year]);
}

export function useTransactionFilters() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | undefined>();

  function reset() {
    setSearch('');
    setSelectedType(undefined);
  }

  return { search, setSearch, selectedType, setSelectedType, reset };
}
