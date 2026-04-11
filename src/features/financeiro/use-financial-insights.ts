import { useMemo } from 'react';
import { getDaysInMonth } from 'date-fns';
import { usePreferencesStore } from '@store/preferences-store';
import { useSummary } from './use-summary';
import { FinancialGoal, SpendingProfile, IncomeType } from '@/types';

export type HealthStatus = 'good' | 'warning' | 'danger' | 'unknown';

export interface InsightMessage {
  id: string;
  text: string;
  type: 'positive' | 'neutral' | 'warning' | 'tip';
}

export interface FinancialInsights {
  // Dados brutos
  monthlyIncome: number;
  savedAmount: number;
  totalExpense: number;
  totalIncome: number;
  balance: number;

  // Orçamento
  budgetUsedPct: number;
  isOverBudget: boolean;

  // Poupança
  actualSavings: number;
  actualSavingsPct: number;
  savingsGoalPct: number;
  isHittingSavingsGoal: boolean;

  // Projeção
  daysPassed: number;
  daysInMonth: number;
  daysRemaining: number;
  projectedMonthlyExpense: number;

  // Saúde
  healthStatus: HealthStatus;

  // Perfil
  profileCompletionLevel: number;
  financialGoal: FinancialGoal | '';
  spendingProfile: SpendingProfile;
  incomeType: IncomeType | '';

  // Insights textuais
  insights: InsightMessage[];
}

export function useFinancialInsights(year: number, month: number): FinancialInsights {
  const preferences = usePreferencesStore((s) => s.preferences);
  const summary = useSummary(year, month);

  return useMemo(() => {
    const {
      monthlyIncome,
      savedAmount,
      savingsGoalPct,
      financialGoal,
      spendingProfile,
      incomeType,
      profileCompletionLevel,
    } = preferences;

    const { totalIncome, totalExpense, balance } = summary;

    // Referência de renda: prefere receitas lançadas, fallback para renda declarada
    const incomeRef = totalIncome > 0 ? totalIncome : monthlyIncome;

    // Orçamento
    const budgetUsedPct = incomeRef > 0 ? (totalExpense / incomeRef) * 100 : 0;
    const isOverBudget = incomeRef > 0 && totalExpense > incomeRef;

    // Poupança
    const actualSavings = incomeRef - totalExpense;
    const actualSavingsPct = incomeRef > 0 ? (actualSavings / incomeRef) * 100 : 0;
    const isHittingSavingsGoal = savingsGoalPct > 0 && actualSavingsPct >= savingsGoalPct;

    // Projeção
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
    const daysInMonthCount = getDaysInMonth(new Date(year, month - 1));
    const daysPassed = isCurrentMonth ? Math.max(today.getDate(), 1) : daysInMonthCount;
    const daysRemaining = isCurrentMonth ? daysInMonthCount - today.getDate() : 0;
    const dailyAvg = daysPassed > 0 ? totalExpense / daysPassed : 0;
    const projectedMonthlyExpense = dailyAvg * daysInMonthCount;

    // Saúde financeira
    let healthStatus: HealthStatus = 'unknown';
    if (incomeRef > 0) {
      if (totalExpense > incomeRef) healthStatus = 'danger';
      else if (budgetUsedPct > 80) healthStatus = 'warning';
      else healthStatus = 'good';
    }

    // Motor de insights textuais
    const insights: InsightMessage[] = [];
    const isVariableIncome = incomeType === 'variavel' || incomeType === 'autonomo';

    if (healthStatus === 'danger') {
      insights.push({
        id: 'over_budget',
        text: isVariableIncome
          ? 'Seus gastos superaram a renda informada este mês.'
          : 'Seus gastos superaram sua renda este mês. Hora de revisar.',
        type: 'warning',
      });
    }

    if (financialGoal === 'economizar' || financialGoal === 'investir') {
      if (isHittingSavingsGoal) {
        insights.push({
          id: 'savings_goal_met',
          text: `Você está atingindo sua meta de poupança de ${savingsGoalPct}%. Continue assim!`,
          type: 'positive',
        });
      } else if (savingsGoalPct > 0 && incomeRef > 0) {
        const missing = (savingsGoalPct / 100) * incomeRef - actualSavings;
        insights.push({
          id: 'savings_goal_gap',
          text: `Faltam R$ ${Math.abs(missing).toFixed(2).replace('.', ',')} para atingir sua meta de poupança.`,
          type: 'tip',
        });
      }
    }

    if (financialGoal === 'sair_das_dividas') {
      if (healthStatus === 'good') {
        insights.push({
          id: 'debt_good',
          text: 'Bom controle! Sobra do mês pode ir direto para quitar dívidas.',
          type: 'positive',
        });
      } else if (healthStatus !== 'unknown') {
        insights.push({
          id: 'debt_warning',
          text: 'Para sair das dívidas, reduza gastos não essenciais este mês.',
          type: 'warning',
        });
      }
    }

    if (spendingProfile === 'descontrolado' && healthStatus !== 'unknown') {
      insights.push({
        id: 'spending_tip',
        text: 'Dica: anote cada gasto pequeno — eles somam mais do que parecem.',
        type: 'tip',
      });
    }

    if (spendingProfile === 'controlado' && healthStatus === 'good') {
      insights.push({
        id: 'controlled_positive',
        text: 'Seu controle financeiro está ótimo este mês!',
        type: 'positive',
      });
    }

    if (isVariableIncome && healthStatus !== 'unknown') {
      insights.push({
        id: 'variable_income',
        text: 'Com renda variável, foque no valor absoluto da sobra, não só no percentual.',
        type: 'neutral',
      });
    }

    if (profileCompletionLevel < 50) {
      insights.push({
        id: 'complete_profile',
        text: 'Complete seu perfil para ver análises mais precisas.',
        type: 'tip',
      });
    }

    return {
      monthlyIncome,
      savedAmount,
      totalExpense,
      totalIncome,
      balance,
      budgetUsedPct,
      isOverBudget,
      actualSavings,
      actualSavingsPct,
      savingsGoalPct,
      isHittingSavingsGoal,
      daysPassed,
      daysInMonth: daysInMonthCount,
      daysRemaining,
      projectedMonthlyExpense,
      healthStatus,
      profileCompletionLevel,
      financialGoal,
      spendingProfile,
      incomeType,
      insights,
    };
  }, [preferences, summary, year, month]);
}
