import { create } from 'zustand';

interface UIState {
  selectedMonth: number; // 1–12
  selectedYear: number;
  setSelectedDate: (month: number, year: number) => void;
}

const now = new Date();

export const useUIStore = create<UIState>()((set) => ({
  selectedMonth: now.getMonth() + 1,
  selectedYear: now.getFullYear(),
  setSelectedDate: (month, year) => set({ selectedMonth: month, selectedYear: year }),
}));
