import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@theme/index';
import { Transaction, Category } from '@/types';
import { formatCurrency } from '@utils/currency';
import { formatDateShort } from '@utils/date';

interface TransactionCardProps {
  transaction: Transaction;
  category?: Category;
  currency?: string;
  onPress?: () => void;
  onDelete?: () => void;
}

export function TransactionCard({
  transaction,
  category,
  currency = 'BRL',
  onPress,
  onDelete,
}: TransactionCardProps) {
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? colors.semantic.income : colors.semantic.expense;
  const amountPrefix = isIncome ? '+' : '-';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      {/* Ícone da categoria */}
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: (category?.color ?? colors.text.tertiary) + '22' },
        ]}
      >
        <MaterialCommunityIcons
          name={(category?.icon ?? 'cash') as any}
          size={20}
          color={category?.color ?? colors.text.tertiary}
        />
      </View>

      {/* Descrição e categoria */}
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description || category?.name || 'Lançamento'}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.categoryName}>{category?.name}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.date}>{formatDateShort(transaction.date)}</Text>
        </View>
      </View>

      {/* Valor */}
      <Text style={[styles.amount, { color: amountColor }]}>
        {amountPrefix}
        {formatCurrency(transaction.amount, currency)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  description: {
    ...typography.body.md,
    color: colors.text.primary,
    fontWeight: '500',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryName: {
    ...typography.label.sm,
    color: colors.text.tertiary,
  },
  dot: {
    ...typography.label.sm,
    color: colors.text.tertiary,
  },
  date: {
    ...typography.label.sm,
    color: colors.text.tertiary,
  },
  amount: {
    ...typography.mono.md,
    fontWeight: '600',
  },
});
