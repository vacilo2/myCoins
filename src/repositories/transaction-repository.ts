import * as db from '@services/db/db-service';
import { ok, err } from '@/types/result';
import type { Result } from '@/types/result';
import type { AppError } from '@/types/errors';
import type { Transaction } from '@/types';

export const transactionRepository = {
  async fetchAll(userId: string): Promise<Result<Transaction[], AppError>> {
    try {
      const data = await db.fetchTransactions(userId);
      return ok(data);
    } catch (e) {
      return err({ code: 'FETCH_FAILED', message: 'Falha ao buscar transações', raw: e });
    }
  },

  async upsert(transaction: Transaction, userId: string): Promise<Result<void, AppError>> {
    try {
      await db.upsertTransaction(transaction, userId);
      return ok(undefined);
    } catch (e) {
      return err({ code: 'SYNC_FAILED', message: 'Falha ao sincronizar transação', raw: e });
    }
  },

  async remove(id: string): Promise<Result<void, AppError>> {
    try {
      await db.removeTransaction(id);
      return ok(undefined);
    } catch (e) {
      return err({ code: 'DELETE_FAILED', message: 'Falha ao excluir transação', raw: e });
    }
  },
};
