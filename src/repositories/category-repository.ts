import * as db from '@services/db/db-service';
import { ok, err } from '@/types/result';
import type { Result } from '@/types/result';
import type { AppError } from '@/types/errors';
import type { Category } from '@/types';

export const categoryRepository = {
  async fetchAll(userId: string): Promise<Result<Category[], AppError>> {
    try {
      const data = await db.fetchCategories(userId);
      return ok(data);
    } catch (e) {
      return err({ code: 'FETCH_FAILED', message: 'Falha ao buscar categorias', raw: e });
    }
  },

  async upsert(category: Category, userId: string): Promise<Result<void, AppError>> {
    try {
      await db.upsertCategory(category, userId);
      return ok(undefined);
    } catch (e) {
      return err({ code: 'SYNC_FAILED', message: 'Falha ao sincronizar categoria', raw: e });
    }
  },

  async upsertMany(categories: Category[], userId: string): Promise<Result<void, AppError>> {
    try {
      await db.upsertCategories(categories, userId);
      return ok(undefined);
    } catch (e) {
      return err({ code: 'SYNC_FAILED', message: 'Falha ao sincronizar categorias', raw: e });
    }
  },

  async remove(id: string): Promise<Result<void, AppError>> {
    try {
      await db.removeCategory(id);
      return ok(undefined);
    } catch (e) {
      return err({ code: 'DELETE_FAILED', message: 'Falha ao excluir categoria', raw: e });
    }
  },
};
