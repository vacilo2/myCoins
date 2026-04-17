import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, typography, spacing, radius, Colors } from '@presentation/theme';
import { formatCurrency } from '@utils/currency';
import { ParsedRow } from '@services/csv-import';
import { ParseErrorBadge } from './ParseErrorBadge';

interface ReviewRowCardProps {
  row: ParsedRow;
  selected: boolean;
  onToggle: () => void;
  currency: string;
}

export function ReviewRowCard({ row, selected, onToggle, currency }: ReviewRowCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const hasError = !!row.error;
  const isExpense = row.type === 'expense';
  const amountColor = isExpense ? colors.semantic.expense : colors.semantic.income;
  const amountPrefix = isExpense ? '-' : '+';

  return (
    <TouchableOpacity
      style={[styles.card, hasError && styles.cardError, selected && styles.cardSelected]}
      onPress={hasError ? undefined : onToggle}
      activeOpacity={hasError ? 1 : 0.75}
    >
      {/* Checkbox */}
      <View style={[styles.checkbox, selected && styles.checkboxActive, hasError && styles.checkboxDisabled]}>
        {selected && !hasError && (
          <MaterialCommunityIcons name="check" size={14} color={colors.background.primary} />
        )}
        {hasError && (
          <MaterialCommunityIcons name="alert" size={14} color={colors.semantic.expense} />
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.description, hasError && styles.textMuted]} numberOfLines={1}>
            {row.description}
          </Text>
          <Text style={[styles.amount, { color: hasError ? colors.text.tertiary : amountColor }]}>
            {amountPrefix}{formatCurrency(row.amount, currency)}
          </Text>
        </View>

        <View style={styles.meta}>
          <Text style={styles.date}>{formatDisplayDate(row.date)}</Text>
          <View style={[styles.typeBadge, { backgroundColor: hasError ? colors.border.default : amountColor + '22' }]}>
            <Text style={[styles.typeText, { color: hasError ? colors.text.tertiary : amountColor }]}>
              {isExpense ? 'Despesa' : 'Receita'}
            </Text>
          </View>
        </View>

        {hasError && <ParseErrorBadge message={row.error!} />}
      </View>
    </TouchableOpacity>
  );
}

function formatDisplayDate(iso: string): string {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}


function createStyles(c: Colors) {
    return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      backgroundColor: c.background.secondary,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: c.border.default,
    },
    cardError: {
      opacity: 0.6,
      borderColor: c.semantic.expense + '44',
    },
    cardSelected: {
      borderColor: c.accent.primary + '66',
      backgroundColor: c.accent.muted,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: radius.sm,
      borderWidth: 2,
      borderColor: c.border.default,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
      flexShrink: 0,
    },
    checkboxActive: {
      backgroundColor: c.accent.primary,
      borderColor: c.accent.primary,
    },
    checkboxDisabled: {
      borderColor: c.semantic.expense + '66',
      backgroundColor: c.semantic.expenseMuted,
    },
    content: { flex: 1, gap: spacing.xs },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    description: {
      ...typography.body.md,
      color: c.text.primary,
      flex: 1,
    },
    textMuted: { color: c.text.tertiary },
    amount: {
      ...typography.label.lg,
      fontWeight: '700',
      flexShrink: 0,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    date: {
      ...typography.label.sm,
      color: c.text.tertiary,
    },
    typeBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    typeText: {
      ...typography.label.sm,
      fontWeight: '600',
    },
  });
}

