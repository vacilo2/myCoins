import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '@/types';
import { STORAGE_KEYS } from '@utils/constants';
import { computeProfileLevel } from '@utils/profile';

interface PreferencesState {
  preferences: UserPreferences;
  isHydrated: boolean;

  updatePreferences: (data: Partial<UserPreferences>) => void;
  setHydrated: (value: boolean) => void;
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
    (set) => ({
      preferences: DEFAULT_PREFERENCES,
      isHydrated: false,

      updatePreferences: (data) => {
        set((state) => {
          const merged = { ...state.preferences, ...data };
          return { preferences: { ...merged, profileCompletionLevel: computeProfileLevel(merged) } };
        });
      },

      setHydrated: (value) => set({ isHydrated: value }),
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
