import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { TransactionType } from '@/types';

export interface ParsedRow {
  date: string;         // YYYY-MM-DD
  description: string;
  amount: number;       // always positive
  type: TransactionType;
  rawLine: string;
  error?: string;
  dedupKey: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  filename: string;
}

const DATE_ALIASES = ['data', 'date', 'dt', 'fecha', 'datum'];
const DESC_ALIASES = [
  'descricao', 'descricção', 'descricão', 'historico', 'histórico',
  'lancamento', 'lançamento', 'description', 'memo', 'desc',
  'details', 'narrative', 'estabelecimento', 'beneficiario',
  'title', 'titulo', 'nome', 'comercio', 'loja', 'merchant',
];
const AMOUNT_ALIASES = ['valor', 'amount', 'value', 'quantia', 'montante'];
const DEBIT_ALIASES = ['debito', 'débito', 'debit', 'saida', 'saída', 'deducao', 'dedução'];
const CREDIT_ALIASES = ['credito', 'crédito', 'credit', 'entrada', 'receita'];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function detectDelimiter(lines: string[]): string {
  const candidates = [';', ',', '\t'];
  const sample = lines.slice(0, Math.min(5, lines.length));
  let best = ',';
  let bestScore = -1;

  for (const d of candidates) {
    const counts = sample.map((l) => l.split(d).length);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    if (min >= 2 && max - min <= 1) {
      if (min > bestScore) {
        bestScore = min;
        best = d;
      }
    }
  }
  return best;
}

function splitCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.replace(/^"|"$/g, '').trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.replace(/^"|"$/g, '').trim());
  return result;
}

function parseAmount(s: string): number | null {
  const raw = s.replace(/[^\d.,-]/g, '');
  if (!raw) return null;

  const isNegative = s.trim().startsWith('-') || s.trim().startsWith('(');

  // BR: 1.234,56 or 1234,56
  if (/\d,\d/.test(raw) && !/\d\.\d{2},/.test(raw) === false || /^\d{1,3}(\.\d{3})*(,\d{1,2})?$/.test(raw)) {
    const n = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
    if (!isNaN(n)) return Math.abs(n);
  }

  // US: 1,234.56 or 1234.56 or simple integer
  const n = parseFloat(raw.replace(/,/g, ''));
  if (!isNaN(n)) return Math.abs(n);

  return null;
}

function parseDate(s: string): string | null {
  const t = s.trim();

  // DD/MM/YYYY
  const br = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    const [, d, m, y] = br;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;

  // DD-MM-YYYY
  const brDash = t.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (brDash) {
    const [, d, m, y] = brDash;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD.MM.YYYY
  const brDot = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (brDot) {
    const [, d, m, y] = brDot;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return null;
}

export async function pickAndParseCSV(): Promise<ParseResult | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['text/csv', 'text/comma-separated-values', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  const content = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: 'utf8' as any,
  });

  const rows = parseCSV(content);
  return { rows, filename: asset.name };
}

export function parseCSV(content: string): ParsedRow[] {
  const text = content
    .replace(/^\uFEFF/, '')   // strip BOM
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines);

  let headerIdx = -1;
  let dateCol = -1;
  let descCol = -1;
  let amountCol = -1;
  let debitCol = -1;
  let creditCol = -1;

  for (let i = 0; i < Math.min(6, lines.length); i++) {
    const cells = splitCSVLine(lines[i], delimiter).map(normalize);

    const di = cells.findIndex((c) => DATE_ALIASES.some((a) => c.includes(a)));
    const dsi = cells.findIndex((c) => DESC_ALIASES.some((a) => c.includes(a)));
    const ai = cells.findIndex((c) => AMOUNT_ALIASES.some((a) => c.includes(a)));
    const dbi = cells.findIndex((c) => DEBIT_ALIASES.some((a) => c.includes(a)));
    const ci = cells.findIndex((c) => CREDIT_ALIASES.some((a) => c.includes(a)));

    if (di >= 0 && dsi >= 0 && (ai >= 0 || (dbi >= 0 && ci >= 0))) {
      headerIdx = i;
      dateCol = di;
      descCol = dsi;
      amountCol = ai;
      debitCol = dbi;
      creditCol = ci;
      break;
    }
  }

  if (headerIdx < 0) return [];

  // Detectar convenção de sinal: se maioria dos valores é positiva → crédito (Nubank style)
  // positivo = despesa, negativo = receita. Caso contrário, negativo = despesa.
  let positiveCount = 0;
  let negativeCount = 0;
  if (amountCol >= 0) {
    for (let i = headerIdx + 1; i < Math.min(headerIdx + 20, lines.length); i++) {
      const cells = splitCSVLine(lines[i], delimiter);
      const raw = cells[amountCol]?.trim() ?? '';
      const val = parseFloat(raw.replace(/[^\d.,-]/g, '').replace(',', '.'));
      if (!isNaN(val)) { val >= 0 ? positiveCount++ : negativeCount++; }
    }
  }
  // Se >60% são positivos → convenção de cartão (positivo = despesa)
  const total = positiveCount + negativeCount;
  const creditCardMode = total > 0 && positiveCount / total > 0.6;

  const rows: ParsedRow[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cells = splitCSVLine(line, delimiter);
    const dateStr = cells[dateCol]?.trim() ?? '';
    const descStr = cells[descCol]?.trim() ?? '';

    let amountRaw = '';
    let type: TransactionType = 'expense';

    if (amountCol >= 0) {
      amountRaw = cells[amountCol]?.trim() ?? '';
      const numVal = parseFloat(amountRaw.replace(/[^\d.,-]/g, '').replace(',', '.'));
      const isNegative =
        amountRaw.startsWith('-') ||
        amountRaw.startsWith('(') ||
        numVal < 0;

      if (creditCardMode) {
        // Nubank/cartão: positivo = despesa, negativo = receita
        type = isNegative ? 'income' : 'expense';
      } else {
        // Conta corrente: negativo = despesa, positivo = receita
        type = isNegative ? 'expense' : 'income';
      }
    } else if (debitCol >= 0 && creditCol >= 0) {
      const debit = cells[debitCol]?.trim() ?? '';
      const credit = cells[creditCol]?.trim() ?? '';
      if (debit && parseAmount(debit)) {
        amountRaw = debit;
        type = 'expense';
      } else if (credit && parseAmount(credit)) {
        amountRaw = credit;
        type = 'income';
      }
    }

    const date = parseDate(dateStr);
    const amount = parseAmount(amountRaw);

    let error: string | undefined;
    if (!date) error = 'Data inválida';
    else if (!amount || amount === 0) error = 'Valor inválido';
    else if (!descStr) error = 'Descrição vazia';

    const safeDate = date ?? '1970-01-01';
    const safeAmount = amount ?? 0;
    const safeDesc = descStr || 'Sem descrição';
    const signedAmount = type === 'expense' ? -safeAmount : safeAmount;
    const dedupKey = `${safeDate}__${safeDesc.trim().toLowerCase()}__${signedAmount.toFixed(2)}`;

    rows.push({
      date: safeDate,
      description: safeDesc,
      amount: safeAmount,
      type,
      rawLine: line,
      error,
      dedupKey,
    });
  }

  return rows;
}

export function buildExistingDedupKeys(
  transactions: Array<{ date: string; description: string; amount: number; type: TransactionType }>
): Set<string> {
  return new Set(
    transactions.map((t) => {
      const d = t.date.split('T')[0];
      const signed = t.type === 'expense' ? -t.amount : t.amount;
      return `${d}__${t.description.trim().toLowerCase()}__${signed.toFixed(2)}`;
    })
  );
}
