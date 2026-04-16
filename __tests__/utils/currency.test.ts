import { formatCurrency, parseCurrencyInput, formatAmount } from '@utils/currency';

describe('formatCurrency', () => {
  it('formata BRL corretamente', () => {
    expect(formatCurrency(1234.56, 'BRL')).toContain('1.234,56');
  });

  it('usa BRL como padrão', () => {
    expect(formatCurrency(100)).toContain('100,00');
  });

  it('formata USD corretamente', () => {
    const result = formatCurrency(50.5, 'USD');
    expect(result).toContain('50,50');
  });

  it('formata zero corretamente', () => {
    expect(formatCurrency(0)).toContain('0,00');
  });

  it('formata valores negativos', () => {
    expect(formatCurrency(-200, 'BRL')).toContain('200,00');
  });
});

describe('parseCurrencyInput', () => {
  it('converte string simples', () => {
    expect(parseCurrencyInput('150')).toBe(150);
  });

  it('converte com vírgula decimal', () => {
    expect(parseCurrencyInput('1500,50')).toBe(1500.5);
  });

  it('retorna 0 para entrada inválida', () => {
    expect(parseCurrencyInput('abc')).toBe(0);
  });

  it('retorna 0 para string vazia', () => {
    expect(parseCurrencyInput('')).toBe(0);
  });

  it('ignora símbolos de moeda', () => {
    expect(parseCurrencyInput('R$ 200')).toBe(200);
  });
});

describe('formatAmount', () => {
  it('formata com 2 casas decimais', () => {
    expect(formatAmount(1234.5)).toContain('1.234,50');
  });

  it('formata zero', () => {
    expect(formatAmount(0)).toBe('0,00');
  });
});
