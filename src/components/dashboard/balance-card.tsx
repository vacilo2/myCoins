import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@theme/index';
import { formatCurrency } from '@utils/currency';
import { formatMonthYear } from '@utils/date';

interface BalanceCardProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  currentDate: Date;
  currency?: string;
}

export function BalanceCard({
  balance,
  totalIncome,
  totalExpense,
  currentDate,
  currency = 'BRL',
}: BalanceCardProps) {
  const isPositive = balance >= 0;

  return (
    <View style={styles.container}>
      {/* Saldo principal */}
      <View style={styles.header}>
        <Text style={styles.label}>Saldo atual</Text>
        <Text style={styles.period}>{formatMonthYear(currentDate)}</Text>
      </View>

      <Text style={[styles.balance, { color: isPositive ? colors.text.primary : colors.semantic.expense }]}>
        {formatCurrency(balance, currency)}
      </Text>

      {/* Entradas e Saídas */}
      <View style={styles.row}>
        <View style={styles.summaryItem}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.semantic.incomeMuted }]}>
            <MaterialCommunityIcons name="arrow-down" size={16} color={colors.semantic.income} />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Entradas</Text>
            <Text style={[styles.summaryValue, { color: colors.semantic.income }]}>
              {formatCurrency(totalIncome, currency)}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.summaryItem}>
          <View style={[styles.iconWrapper, { backgroundColor: colors.semantic.expenseMuted }]}>
            <MaterialCommunityIcons name="arrow-up" size={16} color={colors.semantic.expense} />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Saídas</Text>
            <Text style={[styles.summaryValue, { color: colors.semantic.expense }]}>
              {formatCurrency(totalExpense, currency)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.label.md,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  period: {
    ...typography.label.md,
    color: colors.text.tertiary,
    textTransform: 'capitalize',
  },
  balance: {
    ...typography.mono.xl,
    fontSize: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  separator: {
    width: 1,
    height: 32,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.md,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    ...typography.label.sm,
    color: colors.text.tertiary,
  },
  summaryValue: {
    ...typography.mono.sm,
    marginTop: 2,
  },
});
