import { supabase } from '@services/auth/supabase';
import { ok, err } from '@/types/result';
import type { Result } from '@/types/result';
import type { AppError } from '@/types/errors';
import type { UserPreferences } from '@/types';

function toDb(prefs: UserPreferences, userId: string) {
  return {
    user_id:                  userId,
    name:                     prefs.name,
    currency:                 prefs.currency,
    theme:                    prefs.theme,
    monthly_income:           prefs.monthlyIncome,
    saved_amount:             prefs.savedAmount,
    onboarding_completed:     prefs.onboardingCompleted,
    financial_goal:           prefs.financialGoal,
    spending_profile:         prefs.spendingProfile,
    top_spending_categories:  prefs.topSpendingCategories,
    income_type:              prefs.incomeType,
    savings_goal_pct:         prefs.savingsGoalPct,
    updated_at:               new Date().toISOString(),
  };
}

function fromDb(row: Record<string, any>): UserPreferences {
  return {
    name:                   row.name ?? '',
    currency:               row.currency ?? 'BRL',
    theme:                  (row.theme ?? 'light') as 'light' | 'dark',
    monthlyIncome:          Number(row.monthly_income ?? 0),
    savedAmount:            Number(row.saved_amount ?? 0),
    onboardingCompleted:    Boolean(row.onboarding_completed),
    financialGoal:          row.financial_goal ?? '',
    spendingProfile:        row.spending_profile ?? 'desconhecido',
    topSpendingCategories:  row.top_spending_categories ?? [],
    incomeType:             row.income_type ?? '',
    savingsGoalPct:         Number(row.savings_goal_pct ?? 0),
    profileCompletionLevel: 0, // recalculado no store via computeProfileLevel
  };
}

export const preferencesRepository = {
  async fetch(userId: string): Promise<Result<UserPreferences | null, AppError>> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) return err({ code: 'FETCH_FAILED', message: 'Falha ao buscar preferências', raw: error });
      return ok(data ? fromDb(data) : null);
    } catch (e) {
      return err({ code: 'FETCH_FAILED', message: 'Falha ao buscar preferências', raw: e });
    }
  },

  async upsert(prefs: UserPreferences, userId: string): Promise<Result<void, AppError>> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert(toDb(prefs, userId));

      if (error) return err({ code: 'SYNC_FAILED', message: 'Falha ao salvar preferências', raw: error });
      return ok(undefined);
    } catch (e) {
      return err({ code: 'SYNC_FAILED', message: 'Falha ao salvar preferências', raw: e });
    }
  },
};
