import { Category } from '@/types';
import { generateId } from '@utils/id';

export const DEFAULT_CATEGORIES: Category[] = [
  // Despesas
  { id: generateId(), name: 'Alimentação', type: 'expense', icon: 'food', color: '#F97316', isDefault: true },
  { id: generateId(), name: 'Transporte', type: 'expense', icon: 'car', color: '#3B82F6', isDefault: true },
  { id: generateId(), name: 'Moradia', type: 'expense', icon: 'home', color: '#8B5CF6', isDefault: true },
  { id: generateId(), name: 'Saúde', type: 'expense', icon: 'heart-pulse', color: '#EF4444', isDefault: true },
  { id: generateId(), name: 'Educação', type: 'expense', icon: 'school', color: '#06B6D4', isDefault: true },
  { id: generateId(), name: 'Lazer', type: 'expense', icon: 'gamepad-variant', color: '#EC4899', isDefault: true },
  { id: generateId(), name: 'Compras', type: 'expense', icon: 'shopping', color: '#F59E0B', isDefault: true },
  { id: generateId(), name: 'Outros', type: 'expense', icon: 'dots-horizontal', color: '#6B7280', isDefault: true },

  // Receitas
  { id: generateId(), name: 'Salário', type: 'income', icon: 'cash-multiple', color: '#4ADE80', isDefault: true },
  { id: generateId(), name: 'Freelance', type: 'income', icon: 'laptop', color: '#34D399', isDefault: true },
  { id: generateId(), name: 'Investimentos', type: 'income', icon: 'trending-up', color: '#C6F135', isDefault: true },
  { id: generateId(), name: 'Outros', type: 'income', icon: 'plus-circle', color: '#6B7280', isDefault: true },
];
