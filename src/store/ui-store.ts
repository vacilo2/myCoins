import { create } from 'zustand';

interface UIState {
  selectedMonth: number; // 1–12
  selectedYear: number;
  profileCardSnoozedUntil: number; // timestamp ms (0 = nunca snoozado)
  setSelectedDate: (month: number, year: number) => void;
  snoozeProfileCard: () => void;
}

const now = new Date();

export const useUIStore = create<UIState>()((set) => ({
  selectedMonth: now.getMonth() + 1,
  selectedYear: now.getFullYear(),
  profileCardSnoozedUntil: 0,
  setSelectedDate: (month, year) => set({ selectedMonth: month, selectedYear: year }),
  snoozeProfileCard: () => set({ profileCardSnoozedUntil: Date.now() + 3 * 24 * 60 * 60 * 1000 }),
}));
