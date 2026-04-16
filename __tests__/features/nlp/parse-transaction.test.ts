import { parseTransaction } from '@features/nlp/parse-transaction';

describe('parseTransaction — despesas', () => {
  it('reconhece "gastei" com valor e categoria', () => {
    const r = parseTransaction('gastei 45 reais com almoço');
    expect(r).not.toBeNull();
    expect(r!.type).toBe('expense');
    expect(r!.amount).toBe(45);
    expect(r!.categoryName).toBe('Alimentação');
    expect(r!.paymentMethod).toBe('cash');
  });

  it('reconhece "paguei" com R$', () => {
    const r = parseTransaction('paguei R$ 120,50 de farmácia');
    expect(r).not.toBeNull();
    expect(r!.type).toBe('expense');
    expect(r!.amount).toBe(120.5);
    expect(r!.categoryName).toBe('Saúde');
  });

  it('reconhece "comprei" com valor inteiro', () => {
    const r = parseTransaction('comprei roupa por 200 reais');
    expect(r).not.toBeNull();
    expect(r!.type).toBe('expense');
    expect(r!.amount).toBe(200);
    expect(r!.categoryName).toBe('Compras');
  });

  it('retorna null para texto sem verbo de ação', () => {
    expect(parseTransaction('almoço 50 reais')).toBeNull();
  });

  it('retorna null para texto sem valor', () => {
    expect(parseTransaction('gastei no mercado')).toBeNull();
  });
});

describe('parseTransaction — receitas', () => {
  it('reconhece "recebi" salário', () => {
    const r = parseTransaction('recebi 3000 de salário');
    expect(r).not.toBeNull();
    expect(r!.type).toBe('income');
    expect(r!.amount).toBe(3000);
    expect(r!.categoryName).toBe('Salário');
  });

  it('reconhece "ganhei" freelance', () => {
    const r = parseTransaction('ganhei 500 de freela');
    expect(r).not.toBeNull();
    expect(r!.type).toBe('income');
    expect(r!.categoryName).toBe('Freelance');
  });
});

describe('parseTransaction — crédito e parcelamento', () => {
  it('detecta crédito com cartão', () => {
    const r = parseTransaction('gastei 1200 no crédito em 12x');
    expect(r).not.toBeNull();
    expect(r!.paymentMethod).toBe('credit');
    expect(r!.installments).toBe(12);
  });

  it('detecta "dividi de 10x"', () => {
    const r = parseTransaction('comprei TV 2500 e dividi de 10x');
    expect(r).not.toBeNull();
    expect(r!.installments).toBe(10);
    expect(r!.paymentMethod).toBe('credit');
  });

  it('detecta parcelamento com "parcelado em N vezes"', () => {
    // "parcelei" sozinho não tem verbo de tipo (expense/income) → precisa de "paguei" ou similar
    const r = parseTransaction('paguei 800 parcelado em 6 vezes');
    expect(r).not.toBeNull();
    expect(r!.installments).toBe(6);
    expect(r!.paymentMethod).toBe('credit');
  });

  it('detecta "dividi em 24x"', () => {
    const r = parseTransaction('gastei 3600 no notebook e dividi em 24x');
    expect(r).not.toBeNull();
    expect(r!.installments).toBe(24);
  });

  it('não aceita parcelas < 2', () => {
    const r = parseTransaction('gastei 100 em 1x');
    // 1x não deve ser detectado como parcelamento
    if (r) expect(r.installments ?? 0).not.toBe(1);
  });

  it('não gera parcelamento para receitas', () => {
    const r = parseTransaction('recebi 1200 em 12 parcelas');
    if (r) expect(r.installments).toBeUndefined();
  });
});

describe('parseTransaction — formatos de valor', () => {
  it('aceita formato "1.500" como 1500', () => {
    const r = parseTransaction('gastei 1.500 com viagem');
    expect(r).not.toBeNull();
    expect(r!.amount).toBe(1500);
  });

  it('aceita formato "1.500,00"', () => {
    const r = parseTransaction('paguei 1.500,00 de aluguel');
    expect(r).not.toBeNull();
    expect(r!.amount).toBe(1500);
  });

  it('aceita formato com vírgula decimal "120,50"', () => {
    const r = parseTransaction('gastei 120,50 de lanche');
    expect(r).not.toBeNull();
    expect(r!.amount).toBe(120.5);
  });
});
