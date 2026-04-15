import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@/types';
import { generateId } from '@utils/id';
import { isInMonth } from '@utils/date';
import { STORAGE_KEYS } from '@utils/constants';
import * as db from '@services/db/db-service';

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

  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>, userId?: string) => void;
  addInstallments: (data: AddInstallmentsData, userId?: string) => void;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>, userId?: string) => void;
  deleteTransaction: (id: string) => void;
  deleteInstallmentGroup: (groupId: string) => void;
  getByMonth: (year: number, month: number) => Transaction[];
  setHydrated: (value: boolean) => void;

  // Sync com Supabase
  loadFromCloud: (userId: string) => Promise<void>;
  clearStore: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isHydrated: false,

      addTransaction: (data, userId) => {
        const transaction: Transaction = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ transactions: [transaction, ...state.transactions] }));
        if (userId) db.upsertTransaction(transaction, userId);
      },

      addInstallments: ({ totalAmount, installments, categoryId, description, firstDate }, userId) => {
        const installmentAmount = Math.round((totalAmount / installments) * 100) / 100;
        const groupId = generateId();
        const createdAt = new Date().toISOString();
        const [year, month, day] = firstDate.split('-').map(Number);

        const newTransactions: Transaction[] = Array.from({ length: installments }, (_, i) => {
          // Avança mês a mês a partir da data da 1ª parcela
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

        set((state) => ({
          transactions: [...newTransactions, ...state.transactions],
        }));

        if (userId) {
          newTransactions.forEach(t => db.upsertTransaction(t, userId));
        }
      },

      deleteInstallmentGroup: (groupId) => {
        const { transactions } = useTransactionStore.getState();
        const toDelete = transactions.filter(t => t.installmentGroupId === groupId);
        set((state) => ({
          transactions: state.transactions.filter(t => t.installmentGroupId !== groupId),
        }));
        toDelete.forEach(t => db.removeTransaction(t.id));
      },

      updateTransaction: (id, data, userId) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        }));
        if (userId) {
          const updated = get().transactions.find(t => t.id === id);
          if (updated) db.upsertTransaction(updated, userId);
        }
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        db.removeTransaction(id);
      },

      getByMonth: (year, month) => {
        return get().transactions.filter((t) => isInMonth(t.date, year, month));
      },

      setHydrated: (value) => set({ isHydrated: value }),

      loadFromCloud: async (userId) => {
        const cloudTransactions = await db.fetchTransactions(userId);
        set({ transactions: cloudTransactions, isHydrated: true });
      },

      clearStore: () => set({ transactions: [], isHydrated: false }),
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
