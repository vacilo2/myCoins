import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, TransactionType } from '@/types';
import { generateId } from '@utils/id';
import { STORAGE_KEYS } from '@utils/constants';
import { DEFAULT_CATEGORIES } from '@services/seed/default-categories';
import * as db from '@services/db/db-service';

interface CategoryState {
  categories: Category[];
  isHydrated: boolean;

  addCategory: (data: Omit<Category, 'id' | 'isDefault'>, userId?: string) => void;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id' | 'isDefault'>>, userId?: string) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  getCategoriesByType: (type: TransactionType | 'both') => Category[];
  setHydrated: (value: boolean) => void;

  // Sync com Supabase
  loadFromCloud: (userId: string) => Promise<void>;
  clearStore: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      isHydrated: false,

      addCategory: (data, userId) => {
        const category: Category = { ...data, id: generateId(), isDefault: false };
        set((state) => ({ categories: [...state.categories, category] }));
        if (userId) db.upsertCategory(category, userId);
      },

      updateCategory: (id, data, userId) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
        if (userId) {
          const updated = get().categories.find(c => c.id === id);
          if (updated) db.upsertCategory(updated, userId);
        }
      },

      deleteCategory: (id) => {
        const cat = get().categories.find((c) => c.id === id);
        if (cat?.isDefault) return;
        set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
        db.removeCategory(id);
      },

      getCategoryById: (id) => get().categories.find((c) => c.id === id),

      getCategoriesByType: (type) => {
        const { categories } = get();
        if (type === 'both') return categories;
        return categories.filter((c) => c.type === type || c.type === 'both');
      },

      setHydrated: (value) => set({ isHydrated: value }),

      loadFromCloud: async (userId) => {
        let cloudCategories = await db.fetchCategories(userId);

        // Primeiro acesso: semeia as categorias padrão no Supabase
        if (cloudCategories.length === 0) {
          await db.upsertCategories(DEFAULT_CATEGORIES, userId);
          cloudCategories = DEFAULT_CATEGORIES;
        }

        set({ categories: cloudCategories, isHydrated: true });
      },

      clearStore: () => set({ categories: [], isHydrated: false }),
    }),
    {
      name: STORAGE_KEYS.CATEGORIES,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.categories.length === 0) {
            state.categories = DEFAULT_CATEGORIES;
          }
          state.setHydrated(true);
        }
      },
    }
  )
);
