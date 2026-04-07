import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@theme/index';
import { Transaction, Category } from '@/types';
import { CategoryIcon } from '@ui/category-icon';
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
}: TransactionCardProps) {
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? colors.semantic.income : colors.semantic.expense;
  const amountPrefix = isIncome ? '+' : '-';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.6}>
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: (category?.color ?? colors.text.tertiary) + '15' },
        ]}
      >
        <CategoryIcon
          icon={category?.icon ?? 'cash'}
          size={18}
          color={category?.color ?? colors.text.tertiary}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description || category?.name || 'Lançamento'}
        </Text>
        <Text style={styles.meta}>
          {category?.name} · {formatDateShort(transaction.date)}
        </Text>
      </View>

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
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  description: {
    ...typography.body.md,
    color: colors.text.primary,
  },
  meta: {
    ...typography.label.sm,
    color: colors.text.tertiary,
  },
  amount: {
    ...typography.mono.sm,
  },
});
