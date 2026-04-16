import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '@/types';
import { STORAGE_KEYS } from '@utils/constants';
import { computeProfileLevel } from '@utils/profile';
import { preferencesRepository } from '@repositories/preferences-repository';

interface PreferencesState {
  preferences: UserPreferences;
  isHydrated: boolean;

  updatePreferences: (data: Partial<UserPreferences>, userId?: string) => void;
  setHydrated: (value: boolean) => void;

  // Sync com Supabase
  loadFromCloud: (userId: string) => Promise<void>;
  clearStore: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  name: '',
  currency: 'BRL',
  theme: 'dark',
  monthlyIncome: 0,
  savedAmount: 0,
  onboardingCompleted: false,
  financialGoal: '',
  spendingProfile: 'desconhecido',
  topSpendingCategories: [],
  incomeType: '',
  savingsGoalPct: 0,
  profileCompletionLevel: 0,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      preferences: DEFAULT_PREFERENCES,
      isHydrated: false,

      updatePreferences: (data, userId) => {
        set((state) => {
          const merged = { ...state.preferences, ...data };
          const updated = { ...merged, profileCompletionLevel: computeProfileLevel(merged) };
          // Sync remoto em background (sem bloquear UI)
          if (userId) {
            preferencesRepository.upsert(updated, userId).catch(() => {
              // falha silenciosa: preferências locais continuam funcionando
            });
          }
          return { preferences: updated };
        });
      },

      setHydrated: (value) => set({ isHydrated: value }),

      loadFromCloud: async (userId) => {
        const result = await preferencesRepository.fetch(userId);
        if (result.ok && result.value !== null) {
          const cloud = result.value;
          // Cloud sobrepõe local ao fazer login (estratégia cloud-wins)
          set((state) => {
            const merged = { ...state.preferences, ...cloud };
            return {
              preferences: { ...merged, profileCompletionLevel: computeProfileLevel(merged) },
            };
          });
        }
        // Se cloud vazio ou erro: mantém preferências locais (fallback)
      },

      clearStore: () => set({ preferences: DEFAULT_PREFERENCES }),
    }),
    {
      name: STORAGE_KEYS.PREFERENCES,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
