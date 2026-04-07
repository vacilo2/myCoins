import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@theme/index';
import { FinancialInsights } from '@hooks/use-financial-insights';
import { formatCurrency } from '@utils/currency';

interface InsightCardsProps {
  insights: FinancialInsights;
  currency: string;
}

export function InsightCards({ insights, currency }: InsightCardsProps) {
  const {
    budgetUsedPct,
    actualSavingsPct,
    savingsGoalPct,
    projectedMonthlyExpense,
    monthlyIncome,
    incomeType,
  } = insights;

  const isVariableIncome = incomeType === 'variavel' || incomeType === 'autonomo';

  const budgetColor =
    budgetUsedPct > 100
      ? colors.semantic.expense
      : budgetUsedPct > 80
      ? '#F59E0B'
      : colors.semantic.income;

  const savingsColor =
    savingsGoalPct > 0 && actualSavingsPct >= savingsGoalPct
      ? colors.semantic.income
      : actualSavingsPct < 0
      ? colors.semantic.expense
      : colors.text.secondary;

  const projColor =
    projectedMonthlyExpense > monthlyIncome && monthlyIncome > 0
      ? colors.semantic.expense
      : colors.text.secondary;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {monthlyIncome > 0 && !isVariableIncome && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Orçamento</Text>
          <Text style={[styles.cardValue, { color: budgetColor }]}>
            {Math.min(budgetUsedPct, 999).toFixed(0)}%
          </Text>
          <Text style={styles.cardSub}>da renda utilizado</Text>
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.min(budgetUsedPct, 100)}%` as any,
                  backgroundColor: budgetColor,
                },
              ]}
            />
          </View>
        </View>
      )}

      {monthlyIncome > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Poupança</Text>
          <Text style={[styles.cardValue, { color: savingsColor }]}>
            {actualSavingsPct.toFixed(0)}%
          </Text>
          {savingsGoalPct > 0 ? (
            <Text style={styles.cardSub}>meta: {savingsGoalPct}%</Text>
          ) : (
            <Text style={styles.cardSub}>do mês poupado</Text>
          )}
        </View>
      )}

      {insights.daysPassed > 1 && insights.daysRemaining > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Projeção</Text>
          <Text style={[styles.cardValue, { color: projColor, fontSize: 16 }]}>
            {formatCurrency(projectedMonthlyExpense, currency, { compact: true })}
          </Text>
          <Text style={styles.cardSub}>gasto estimado</Text>
        </View>
      )}

      {insights.savedAmount > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reserva</Text>
          <Text style={[styles.cardValue, { color: colors.accent.primary, fontSize: 16 }]}>
            {formatCurrency(insights.savedAmount, currency, { compact: true })}
          </Text>
          <Text style={styles.cardSub}>guardados</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing['2xl'],
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    minWidth: 120,
    gap: spacing.xs,
  },
  cardTitle: {
    ...typography.label.sm,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    ...typography.heading.lg,
    color: colors.text.primary,
  },
  cardSub: {
    ...typography.label.sm,
    color: colors.text.tertiary,
  },
  barBg: {
    height: 3,
    backgroundColor: colors.surface.subtle,
    borderRadius: radius.full,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
