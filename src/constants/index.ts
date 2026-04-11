export const STORAGE_KEYS = {
  TRANSACTIONS: '@mycoins:transactions',
  CATEGORIES: '@mycoins:categories',
  PREFERENCES: '@mycoins:preferences',
} as const;

export const APP_NAME = 'myCoins';

export const CURRENCIES = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro' },
  { code: 'USD', symbol: '$', name: 'Dólar Americano' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

export const DEFAULT_CURRENCY = 'BRL';
