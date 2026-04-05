import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@/types';
import { generateId } from '@utils/id';
import { isInMonth } from '@utils/date';
import { STORAGE_KEYS } from '@utils/constants';

interface TransactionState {
  transactions: Transaction[];
  isHydrated: boolean;

  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  deleteTransaction: (id: string) => void;
  getByMonth: (year: number, month: number) => Transaction[];
  setHydrated: (value: boolean) => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isHydrated: false,

      addTransaction: (data) => {
        const transaction: Transaction = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        }));
      },

      updateTransaction: (id, data) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      getByMonth: (year, month) => {
        return get().transactions.filter((t) => isInMonth(t.date, year, month));
      },

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEYS.TRANSACTIONS,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
