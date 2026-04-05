import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, TransactionType } from '@/types';
import { generateId } from '@utils/id';
import { STORAGE_KEYS } from '@utils/constants';
import { DEFAULT_CATEGORIES } from '@services/seed/default-categories';

interface CategoryState {
  categories: Category[];
  isHydrated: boolean;

  addCategory: (data: Omit<Category, 'id' | 'isDefault'>) => void;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id' | 'isDefault'>>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  getCategoriesByType: (type: TransactionType | 'both') => Category[];
  setHydrated: (value: boolean) => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      isHydrated: false,

      addCategory: (data) => {
        const category: Category = { ...data, id: generateId(), isDefault: false };
        set((state) => ({ categories: [...state.categories, category] }));
      },

      updateCategory: (id, data) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
      },

      deleteCategory: (id) => {
        const cat = get().categories.find((c) => c.id === id);
        if (cat?.isDefault) return; // não apaga categorias padrão
        set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
      },

      getCategoryById: (id) => get().categories.find((c) => c.id === id),

      getCategoriesByType: (type) => {
        const { categories } = get();
        if (type === 'both') return categories;
        return categories.filter((c) => c.type === type || c.type === 'both');
      },

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEYS.CATEGORIES,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Semeia categorias padrão no primeiro uso
          if (state.categories.length === 0) {
            state.categories = DEFAULT_CATEGORIES;
          }
          state.setHydrated(true);
        }
      },
    }
  )
);
