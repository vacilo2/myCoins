import { useState, useEffect } from 'react';
import { usePreferencesStore } from '@store/preferences-store';
import { useCategoryStore } from '@store/category-store';
import { useUIStore } from '@store/ui-store';
import { useSummary, useTopCategories, useFinancialInsights } from '../financeiro';
import { useTransactions } from '../transacoes';
import { getPreviousMonth, getNextMonth, formatMonthYear } from '@utils/date';

export function useDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const setSelectedDate = useUIStore((s) => s.setSelectedDate);
  const onboardingCompleted = usePreferencesStore((s) => s.preferences.onboardingCompleted);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const preferences = usePreferencesStore((s) => s.preferences);
  const topCategories = useTopCategories(year, month, 4);
  const recentTransactions = useTransactions({ month, year });
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);
  const insights = useFinancialInsights(year, month);

  const recent = recentTransactions.slice(0, 5);

  function handleMonthChange(date: Date) {
    setCurrentDate(date);
    setSelectedDate(date.getMonth() + 1, date.getFullYear());
  }

  return {
    currentDate,
    year,
    month,
    preferences,
    topCategories,
    recentTransactions,
    recent,
    getCategoryById,
    insights,
    onboardingCompleted,
    handleMonthChange,
    getPreviousMonth,
    getNextMonth,
    formatMonthYear,
  };
}
