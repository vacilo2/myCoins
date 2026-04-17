import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, typography, spacing, radius, Colors } from '@presentation/theme';
import { Transaction, Category } from '@/types';
import { CategoryIcon } from '@presentation/ui/category-icon';
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
  const { colors } = useTheme();
  const styles = createStyles(colors);
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
        <CategoryIcon
          icon={category?.icon ?? 'cash'}
          size={20}
          color={category?.color ?? colors.text.tertiary}
        />
      </View>

      {/* Descrição e categoria */}
      <View style={styles.info}>
        <View style={styles.descRow}>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description || category?.name || 'Lançamento'}
          </Text>
          {transaction.paymentMethod === 'credit' && transaction.installmentTotal && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {transaction.installmentIndex}/{transaction.installmentTotal}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.meta}>
          <Text style={styles.categoryName}>{category?.name}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.date}>{formatDateShort(transaction.date)}</Text>
          {transaction.paymentMethod === 'credit' && (
            <>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.creditLabel}>Crédito</Text>
            </>
          )}
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


function createStyles(c: Colors) {
    return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.background.secondary,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: c.border.subtle,
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
      color: c.text.primary,
      fontWeight: '500',
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    categoryName: {
      ...typography.label.sm,
      color: c.text.tertiary,
    },
    dot: {
      ...typography.label.sm,
      color: c.text.tertiary,
    },
    date: {
      ...typography.label.sm,
      color: c.text.tertiary,
    },
    amount: {
      ...typography.mono.md,
      fontWeight: '600',
    },
    descRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    badge: {
      backgroundColor: c.accent.muted,
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: c.accent.primary,
    },
    creditLabel: {
      ...typography.label.sm,
      color: c.accent.primary,
    },
  });
}

