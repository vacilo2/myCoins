import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '@/types';
import { STORAGE_KEYS } from '@utils/constants';

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
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferences: DEFAULT_PREFERENCES,
      isHydrated: false,

      updatePreferences: (data) => {
        set((state) => ({ preferences: { ...state.preferences, ...data } }));
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
