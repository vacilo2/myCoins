export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: string; // ISO date string
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType | 'both';
  icon: string;
  color: string;
  isDefault: boolean;
}

export type FinancialGoal =
  | 'economizar'
  | 'sair_das_dividas'
  | 'controlar_gastos'
  | 'investir'
  | 'organizar';

export type SpendingProfile = 'descontrolado' | 'moderado' | 'controlado' | 'desconhecido';
export type IncomeType = 'fixo' | 'variavel' | 'autonomo' | 'multiplas_fontes';
export type SpendingCategory =
  | 'alimentacao'
  | 'transporte'
  | 'moradia'
  | 'lazer'
  | 'compras'
  | 'saude'
  | 'contas'
  | 'outros';

export interface UserPreferences {
  // Camada 1
  name: string;
  currency: string;
  theme: 'light' | 'dark';
  monthlyIncome: number;
  savedAmount: number;
  onboardingCompleted: boolean;

  // Camada 2
  financialGoal: FinancialGoal | '';
  spendingProfile: SpendingProfile;

  // Camada 3
  topSpendingCategories: SpendingCategory[];
  incomeType: IncomeType | '';
  savingsGoalPct: number;

  // Calculado
  profileCompletionLevel: number;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  month: number;
  year: number;
}

export interface CategorySummary {
  category: Category;
  total: number;
  percentage: number;
  count: number;
}
