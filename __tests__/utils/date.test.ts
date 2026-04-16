import { toISODate, isInMonth } from '@utils/date';

describe('toISODate', () => {
  it('formata data corretamente', () => {
    const date = new Date(2025, 0, 15); // 15 de janeiro de 2025 (mês 0-indexado)
    expect(toISODate(date)).toBe('2025-01-15');
  });

  it('inclui zero à esquerda no mês', () => {
    const date = new Date(2025, 8, 5); // setembro
    expect(toISODate(date)).toBe('2025-09-05');
  });

  it('inclui zero à esquerda no dia', () => {
    const date = new Date(2025, 11, 3); // dezembro
    expect(toISODate(date)).toBe('2025-12-03');
  });
});

describe('isInMonth', () => {
  it('retorna true para data no mês correto', () => {
    expect(isInMonth('2025-03-15', 2025, 3)).toBe(true);
  });

  it('retorna false para mês diferente', () => {
    expect(isInMonth('2025-04-15', 2025, 3)).toBe(false);
  });

  it('retorna false para ano diferente', () => {
    expect(isInMonth('2024-03-15', 2025, 3)).toBe(false);
  });

  it('funciona para primeiro dia do mês', () => {
    expect(isInMonth('2025-06-01', 2025, 6)).toBe(true);
  });

  it('funciona para último dia do mês', () => {
    expect(isInMonth('2025-06-30', 2025, 6)).toBe(true);
  });
});
