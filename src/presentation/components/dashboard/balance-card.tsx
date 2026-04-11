import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@presentation/theme/index';
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

      <Text style={[styles.balance, { color: isPositive ? '#faf9f5' : '#b53333' }]}>
        {formatCurrency(balance, currency)}
      </Text>

      {/* Entradas e Saídas */}
      <View style={styles.row}>
        <View style={styles.summaryItem}>
          <View style={[styles.iconWrapper, { backgroundColor: '#2d4d38' }]}>
            <MaterialCommunityIcons name="arrow-down" size={16} color='#4a7c59' />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Entradas</Text>
            <Text style={[styles.summaryValue, { color: '#4a7c59' }]}>
              {formatCurrency(totalIncome, currency)}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.summaryItem}>
          <View style={[styles.iconWrapper, { backgroundColor: '#4d1f1f' }]}>
            <MaterialCommunityIcons name="arrow-up" size={16} color='#b53333' />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Saídas</Text>
            <Text style={[styles.summaryValue, { color: '#b53333' }]}>
              {formatCurrency(totalExpense, currency)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const serifFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#30302e',
    borderRadius: radius.lg,
    padding: spacing['2xl'],
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: '#3d3d3a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.label.md,
    color: '#b0aea5',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  period: {
    ...typography.label.md,
    color: '#87867f',
    textTransform: 'capitalize',
  },
  balance: {
    ...typography.mono.xl,
    fontFamily: serifFont,
    fontSize: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252523',
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
    backgroundColor: '#30302e',
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
    color: '#87867f',
  },
  summaryValue: {
    ...typography.mono.sm,
    marginTop: 2,
  },
});
