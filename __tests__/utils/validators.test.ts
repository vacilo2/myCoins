import { isValidAmount, isValidDescription, isValidCategoryName } from '@utils/validators';

describe('isValidAmount', () => {
  it('aceita valor positivo', () => expect(isValidAmount(100)).toBe(true));
  it('aceita decimal positivo', () => expect(isValidAmount(0.01)).toBe(true));
  it('rejeita zero', () => expect(isValidAmount(0)).toBe(false));
  it('rejeita negativo', () => expect(isValidAmount(-50)).toBe(false));
  it('rejeita Infinity', () => expect(isValidAmount(Infinity)).toBe(false));
  it('rejeita NaN', () => expect(isValidAmount(NaN)).toBe(false));
});

describe('isValidDescription', () => {
  it('aceita texto normal', () => expect(isValidDescription('Almoço')).toBe(true));
  it('aceita texto com 100 chars', () => expect(isValidDescription('a'.repeat(100))).toBe(true));
  it('rejeita string vazia', () => expect(isValidDescription('')).toBe(false));
  it('rejeita só espaços', () => expect(isValidDescription('   ')).toBe(false));
  it('rejeita texto maior que 100 chars', () => expect(isValidDescription('a'.repeat(101))).toBe(false));
});

describe('isValidCategoryName', () => {
  it('aceita nome válido', () => expect(isValidCategoryName('Alimentação')).toBe(true));
  it('aceita nome com 2 chars', () => expect(isValidCategoryName('AB')).toBe(true));
  it('aceita nome com 30 chars', () => expect(isValidCategoryName('a'.repeat(30))).toBe(true));
  it('rejeita nome com 1 char', () => expect(isValidCategoryName('A')).toBe(false));
  it('rejeita nome com 31 chars', () => expect(isValidCategoryName('a'.repeat(31))).toBe(false));
  it('rejeita string vazia', () => expect(isValidCategoryName('')).toBe(false));
});
