import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  isSameMonth,
  isSameYear,
  subMonths,
  addMonths,
  isToday,
  isYesterday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(date: string | Date, pattern: string = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: ptBR });
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Hoje';
  if (isYesterday(d)) return 'Ontem';
  return format(d, 'dd MMM', { locale: ptBR });
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: ptBR });
}

export function formatMonthShort(date: Date): string {
  return format(date, 'MMM/yy', { locale: ptBR });
}

export function isInMonth(dateStr: string, year: number, month: number): boolean {
  const date = parseISO(dateStr);
  const ref = new Date(year, month - 1, 1);
  return isSameMonth(date, ref) && isSameYear(date, ref);
}

export function isInInterval(dateStr: string, start: Date, end: Date): boolean {
  return isWithinInterval(parseISO(dateStr), { start, end });
}

export function getMonthStart(year: number, month: number): Date {
  return startOfMonth(new Date(year, month - 1, 1));
}

export function getMonthEnd(year: number, month: number): Date {
  return endOfMonth(new Date(year, month - 1, 1));
}

export function getPreviousMonth(date: Date): Date {
  return subMonths(date, 1);
}

export function getNextMonth(date: Date): Date {
  return addMonths(date, 1);
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
