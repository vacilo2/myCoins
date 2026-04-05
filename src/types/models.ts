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

export interface UserPreferences {
  name: string;
  currency: string;
  theme: 'light' | 'dark';
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
