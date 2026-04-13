export type ParseResult = {
  type: 'income' | 'expense';
  amount: number;
  categoryName: string;
  description: string;
};

// ---------------------------------------------------------------------------
// Normalização (strip acentos para matching — preserva original para description)
// ---------------------------------------------------------------------------
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ---------------------------------------------------------------------------
// Detecção de tipo
// ---------------------------------------------------------------------------
const EXPENSE_WORDS = ['gastei', 'paguei', 'comprei', 'saiu', 'gastamos', 'devo'];
const INCOME_WORDS  = ['recebi', 'ganhei', 'entrou', 'caiu', 'faturei'];

function detectType(normalised: string): 'income' | 'expense' | null {
  if (EXPENSE_WORDS.some(w => normalised.includes(w))) return 'expense';
  if (INCOME_WORDS.some(w => normalised.includes(w)))  return 'income';
  return null;
}

// ---------------------------------------------------------------------------
// Extração de valor
// ---------------------------------------------------------------------------
function parseAmount(raw: string): number {
  // "1.500" ou "1.500,00" — ponto como separador de milhar
  if (/^\d{1,3}\.\d{3}(,\d{1,2})?$/.test(raw)) {
    raw = raw.replace('.', '').replace(',', '.');
  } else {
    raw = raw.replace(',', '.');
  }
  return parseFloat(raw);
}

function extractAmount(normalised: string): number | null {
  const patterns = [
    /r\$\s*(\d+(?:[.,]\d{1,3})?)/,           // "R$ 120,50" ou "R$ 1.500"
    /(\d+(?:[.,]\d{1,3})?)\s*reais/,          // "120,50 reais"
    /\b(\d+(?:[.,]\d{1,3})?)\b/,              // número avulso
  ];

  for (const pattern of patterns) {
    const match = normalised.match(pattern);
    if (match) {
      const value = parseAmount(match[1]);
      if (!isNaN(value) && value > 0) return value;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Mapeamento de categorias
// ---------------------------------------------------------------------------
const EXPENSE_MAP: [string[], string][] = [
  [
    ['almoco', 'jantar', 'janta', 'lanche', 'cafe', 'pizza', 'restaurante',
     'comida', 'mercado', 'padaria', 'acougue', 'hamburguer', 'sushi', 'ifood'],
    'Alimentação',
  ],
  [
    ['uber', 'onibus', 'gasolina', 'combustivel', 'taxi', 'metro', 'moto',
     'estacionamento', 'pedagio', '99', 'combustivel', 'posto'],
    'Transporte',
  ],
  [
    ['academia', 'medico', 'farmacia', 'remedio', 'consulta', 'hospital',
     'dentista', 'plano de saude', 'exame', 'clinica'],
    'Saúde',
  ],
  [
    ['curso', 'livro', 'escola', 'faculdade', 'universidade', 'aula',
     'treinamento', 'mentoria', 'udemy', 'alura'],
    'Educação',
  ],
  [
    ['netflix', 'cinema', 'show', 'jogo', 'streaming', 'spotify', 'ingresso',
     'teatro', 'balada', 'disney', 'prime', 'hbo', 'youtube'],
    'Lazer',
  ],
  [
    ['aluguel', 'condominio', 'luz', 'agua', 'internet', 'energia', 'gas',
     'iptu', 'wifi', 'energia eletrica'],
    'Moradia',
  ],
  [
    ['roupa', 'sapato', 'eletronico', 'celular', 'computador', 'notebook',
     'tv', 'geladeira', 'camisa', 'tenis', 'vestuario'],
    'Compras',
  ],
];

const INCOME_MAP: [string[], string][] = [
  [['salario', 'pagamento mensal', 'holerite'],            'Salário'],
  [['freela', 'freelance', 'cliente', 'projeto', 'job'],   'Freelance'],
  [['dividendo', 'investimento', 'rendimento', 'juros'],   'Investimentos'],
];

function detectCategory(normalised: string, type: 'income' | 'expense'): string {
  const map = type === 'expense' ? EXPENSE_MAP : INCOME_MAP;
  for (const [keywords, categoryName] of map) {
    if (keywords.some(k => normalised.includes(k))) return categoryName;
  }
  return 'Outros';
}

// ---------------------------------------------------------------------------
// Função principal
// ---------------------------------------------------------------------------
export function parseTransaction(text: string): ParseResult | null {
  const normalised = norm(text.trim());

  const type = detectType(normalised);
  if (!type) return null;

  const amount = extractAmount(normalised);
  if (!amount) return null;

  const categoryName = detectCategory(normalised, type);

  return {
    type,
    amount,
    categoryName,
    description: text.trim(),
  };
}
