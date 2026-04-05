export function formatCurrency(
  value: number,
  currency: string = 'BRL',
  options?: { compact?: boolean }
): string {
  if (options?.compact && Math.abs(value) >= 1000) {
    const compact = value / 1000;
    return formatCurrency(compact, currency).replace(/\d+([.,]\d+)?/, `${compact.toFixed(1)}k`);
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, '').replace(',', '.');
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

export function formatAmount(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
