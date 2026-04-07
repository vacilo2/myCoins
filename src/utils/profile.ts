import { UserPreferences } from '@/types';

/**
 * Calcula o nível de completude do perfil (0–100).
 * Cada campo tem um peso que soma 100.
 */
export function computeProfileLevel(prefs: UserPreferences): number {
  let score = 0;
  if (prefs.name?.trim()) score += 15;
  if (prefs.monthlyIncome > 0) score += 20;
  if (prefs.savedAmount >= 0 && prefs.onboardingCompleted) score += 10;
  if (prefs.financialGoal) score += 20;
  if (prefs.spendingProfile && prefs.spendingProfile !== 'desconhecido') score += 15;
  if (prefs.incomeType) score += 10;
  if (prefs.savingsGoalPct > 0) score += 10;
  return Math.min(100, score);
}

export const FINANCIAL_GOAL_LABELS: Record<string, string> = {
  economizar: 'Economizar',
  sair_das_dividas: 'Sair das dívidas',
  controlar_gastos: 'Controlar gastos',
  investir: 'Investir',
  organizar: 'Me organizar',
};

export const SPENDING_PROFILE_LABELS: Record<string, string> = {
  descontrolado: 'Descontrolado',
  moderado: 'Moderado',
  controlado: 'Controlado',
  desconhecido: 'Não sei ainda',
};

export const INCOME_TYPE_LABELS: Record<string, string> = {
  fixo: 'Salário fixo',
  variavel: 'Renda variável',
  autonomo: 'Autônomo / freela',
  multiplas_fontes: 'Múltiplas fontes',
};

export const SPENDING_CATEGORY_LABELS: Record<string, string> = {
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  moradia: 'Moradia',
  lazer: 'Lazer',
  compras: 'Compras',
  saude: 'Saúde',
  contas: 'Contas',
  outros: 'Outros',
};
