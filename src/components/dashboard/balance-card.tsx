import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@theme/index';
import { formatCurrency } from '@utils/currency';

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
  currency = 'BRL',
}: BalanceCardProps) {
  const isPositive = balance >= 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Saldo</Text>
      <Text
        style={[
          styles.balance,
          { color: isPositive ? colors.text.primary : colors.semantic.expense },
        ]}
      >
        {formatCurrency(balance, currency)}
      </Text>

      <View style={styles.row}>
        <View style={styles.summaryItem}>
          <View style={[styles.dot, { backgroundColor: colors.semantic.income }]} />
          <View>
            <Text style={styles.summaryLabel}>Entradas</Text>
            <Text style={[styles.summaryValue, { color: colors.semantic.income }]}>
              {formatCurrency(totalIncome, currency)}
            </Text>
          </View>
        </View>

        <View style={styles.sep} />

        <View style={styles.summaryItem}>
          <View style={[styles.dot, { backgroundColor: colors.semantic.expense }]} />
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
    borderRadius: radius.lg,
    padding: spacing['2xl'],
    gap: spacing.md,
  },
  label: {
    ...typography.label.sm,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balance: {
    ...typography.mono.xl,
    fontSize: 36,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sep: {
    width: 1,
    height: 28,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.md,
  },
  summaryLabel: {
    ...typography.label.sm,
    color: colors.text.tertiary,
  },
  summaryValue: {
    ...typography.mono.sm,
    marginTop: 1,
  },
});
