import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@/types';
import { generateId } from '@utils/id';
import { isInMonth } from '@utils/date';
import { STORAGE_KEYS } from '@utils/constants';
import { transactionRepository } from '@repositories/transaction-repository';

interface AddInstallmentsData {
  totalAmount: number;       // valor total da compra
  installments: number;      // número de parcelas
  categoryId: string;
  description: string;
  firstDate: string;         // data da 1ª parcela (ISO)
}

interface TransactionState {
  transactions: Transaction[];
  isHydrated: boolean;
  syncError: string | null;

  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>, userId?: string) => void;
  addInstallments: (data: AddInstallmentsData, userId?: string) => void;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>, userId?: string) => void;
  deleteTransaction: (id: string) => void;
  deleteInstallmentGroup: (groupId: string) => void;
  getByMonth: (year: number, month: number) => Transaction[];
  setHydrated: (value: boolean) => void;
  clearSyncError: () => void;

  // Sync com Supabase
  loadFromCloud: (userId: string) => Promise<void>;
  clearStore: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isHydrated: false,
      syncError: null,

      addTransaction: (data, userId) => {
        const transaction: Transaction = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ transactions: [transaction, ...state.transactions] }));
        if (userId) {
          transactionRepository.upsert(transaction, userId).then(result => {
            if (!result.ok) set({ syncError: result.error.message });
          });
        }
      },

      addInstallments: ({ totalAmount, installments, categoryId, description, firstDate }, userId) => {
        const installmentAmount = Math.round((totalAmount / installments) * 100) / 100;
        const groupId = generateId();
        const createdAt = new Date().toISOString();
        const [year, month, day] = firstDate.split('-').map(Number);

        const newTransactions: Transaction[] = Array.from({ length: installments }, (_, i) => {
          const d = new Date(year, month - 1 + i, day);
          const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          return {
            id: generateId(),
            type: 'expense' as const,
            amount: installmentAmount,
            categoryId,
            description: `${description} (${i + 1}/${installments})`,
            date,
            createdAt,
            paymentMethod: 'credit' as const,
            installmentIndex: i + 1,
            installmentTotal: installments,
            installmentGroupId: groupId,
          };
        });

        set((state) => ({ transactions: [...newTransactions, ...state.transactions] }));

        if (userId) {
          Promise.all(newTransactions.map(t => transactionRepository.upsert(t, userId)))
            .then(results => {
              const failed = results.find(r => !r.ok);
              if (failed && !failed.ok) set({ syncError: failed.error.message });
            });
        }
      },

      deleteInstallmentGroup: (groupId) => {
        const { transactions } = useTransactionStore.getState();
        const toDelete = transactions.filter(t => t.installmentGroupId === groupId);
        set((state) => ({
          transactions: state.transactions.filter(t => t.installmentGroupId !== groupId),
        }));
        Promise.all(toDelete.map(t => transactionRepository.remove(t.id)))
          .then(results => {
            const failed = results.find(r => !r.ok);
            if (failed && !failed.ok) set({ syncError: failed.error.message });
          });
      },

      updateTransaction: (id, data, userId) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        }));
        if (userId) {
          const updated = get().transactions.find(t => t.id === id);
          if (updated) {
            transactionRepository.upsert(updated, userId).then(result => {
              if (!result.ok) set({ syncError: result.error.message });
            });
          }
        }
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        transactionRepository.remove(id).then(result => {
          if (!result.ok) set({ syncError: result.error.message });
        });
      },

      getByMonth: (year, month) => {
        return get().transactions.filter((t) => isInMonth(t.date, year, month));
      },

      setHydrated: (value) => set({ isHydrated: value }),
      clearSyncError: () => set({ syncError: null }),

      loadFromCloud: async (userId) => {
        const result = await transactionRepository.fetchAll(userId);
        if (result.ok) {
          set({ transactions: result.value, isHydrated: true });
        } else {
          set({ isHydrated: true, syncError: result.error.message });
        }
      },

      clearStore: () => set({ transactions: [], isHydrated: false, syncError: null }),
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
