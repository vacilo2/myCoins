import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, TransactionType } from '@/types';
import { generateId } from '@utils/id';
import { STORAGE_KEYS } from '@utils/constants';
import { DEFAULT_CATEGORIES } from '@services/seed/default-categories';
import { categoryRepository } from '@repositories/category-repository';

interface CategoryState {
  categories: Category[];
  isHydrated: boolean;
  syncError: string | null;

  addCategory: (data: Omit<Category, 'id' | 'isDefault'>, userId?: string) => void;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id' | 'isDefault'>>, userId?: string) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  getCategoriesByType: (type: TransactionType | 'both') => Category[];
  setHydrated: (value: boolean) => void;
  clearSyncError: () => void;

  // Sync com Supabase
  loadFromCloud: (userId: string) => Promise<void>;
  clearStore: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      isHydrated: false,
      syncError: null,

      addCategory: (data, userId) => {
        const category: Category = { ...data, id: generateId(), isDefault: false };
        set((state) => ({ categories: [...state.categories, category] }));
        if (userId) {
          categoryRepository.upsert(category, userId).then(result => {
            if (!result.ok) set({ syncError: result.error.message });
          });
        }
      },

      updateCategory: (id, data, userId) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
        if (userId) {
          const updated = get().categories.find(c => c.id === id);
          if (updated) {
            categoryRepository.upsert(updated, userId).then(result => {
              if (!result.ok) set({ syncError: result.error.message });
            });
          }
        }
      },

      deleteCategory: (id) => {
        const cat = get().categories.find((c) => c.id === id);
        if (cat?.isDefault) return;
        set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
        categoryRepository.remove(id).then(result => {
          if (!result.ok) set({ syncError: result.error.message });
        });
      },

      getCategoryById: (id) => get().categories.find((c) => c.id === id),

      getCategoriesByType: (type) => {
        const { categories } = get();
        if (type === 'both') return categories;
        return categories.filter((c) => c.type === type || c.type === 'both');
      },

      setHydrated: (value) => set({ isHydrated: value }),
      clearSyncError: () => set({ syncError: null }),

      loadFromCloud: async (userId) => {
        const result = await categoryRepository.fetchAll(userId);

        if (!result.ok) {
          set({ isHydrated: true, syncError: result.error.message });
          return;
        }

        let cloudCategories = result.value;

        // Primeiro acesso: semeia as categorias padrão no Supabase
        if (cloudCategories.length === 0) {
          const seedResult = await categoryRepository.upsertMany(DEFAULT_CATEGORIES, userId);
          if (!seedResult.ok) set({ syncError: seedResult.error.message });
          cloudCategories = DEFAULT_CATEGORIES;
        }

        set({ categories: cloudCategories, isHydrated: true });
      },

      clearStore: () => set({ categories: [], isHydrated: false, syncError: null }),
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
