import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@theme/index';
import { useMonthlyChart, useCategoryReport } from '@hooks/use-reports';
import { useSummary } from '@hooks/use-summary';
import { usePreferencesStore } from '@store/preferences-store';
import { ChartBar } from '@/components/reports/chart-bar';
import { ScreenHeader } from '@/components/layout/screen-header';
import { formatCurrency } from '@utils/currency';
import { getPreviousMonth, getNextMonth, formatMonthYear } from '@utils/date';

export default function ReportsScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const currency = usePreferencesStore((s) => s.preferences.currency);
  const summary = useSummary(year, month);
  const chartData = useMonthlyChart(6);
  const categoryReport = useCategoryReport(year, month);

  const savingsRate =
    summary.totalIncome > 0
      ? ((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100
      : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Relatórios" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Navegação de mês */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => setCurrentDate(getPreviousMonth(currentDate))} hitSlop={12}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{formatMonthYear(currentDate)}</Text>
          <TouchableOpacity onPress={() => setCurrentDate(getNextMonth(currentDate))} hitSlop={12}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Métricas do mês */}
        <View style={styles.metricsRow}>
          <View style={[styles.metric, { backgroundColor: colors.semantic.incomeMuted }]}>
            <Text style={styles.metricLabel}>Receitas</Text>
            <Text style={[styles.metricValue, { color: colors.semantic.income }]}>
              {formatCurrency(summary.totalIncome, currency)}
            </Text>
          </View>
          <View style={[styles.metric, { backgroundColor: colors.semantic.expenseMuted }]}>
            <Text style={styles.metricLabel}>Despesas</Text>
            <Text style={[styles.metricValue, { color: colors.semantic.expense }]}>
              {formatCurrency(summary.totalExpense, currency)}
            </Text>
          </View>
        </View>

        {/* Taxa de economia */}
        <View style={styles.savingsCard}>
          <View>
            <Text style={styles.savingsLabel}>Taxa de economia</Text>
            <Text style={styles.savingsDesc}>Quanto você guardou do que recebeu</Text>
          </View>
          <Text
            style={[
              styles.savingsValue,
              { color: savingsRate >= 0 ? colors.semantic.income : colors.semantic.expense },
            ]}
          >
            {savingsRate.toFixed(1)}%
          </Text>
        </View>

        {/* Gráfico de barras */}
        <ChartBar data={chartData} currency={currency} />

        {/* Despesas por categoria */}
        {categoryReport.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Despesas por categoria</Text>
            <View style={styles.catList}>
              {categoryReport.map((item) => (
                <View key={item.category.id} style={styles.catRow}>
                  <View style={[styles.catIcon, { backgroundColor: item.category.color + '22' }]}>
                    <MaterialCommunityIcons
                      name={item.category.icon as any}
                      size={16}
                      color={item.category.color}
                    />
                  </View>
                  <View style={styles.catInfo}>
                    <Text style={styles.catName}>{item.category.name}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${Math.min(item.percentage, 100)}%` as any,
                            backgroundColor: item.category.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.catRight}>
                    <Text style={styles.catAmount}>{formatCurrency(item.total, currency)}</Text>
                    <Text style={styles.catPct}>{item.percentage.toFixed(0)}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { flex: 1 },
  content: { padding: spacing['2xl'], gap: spacing['2xl'], paddingBottom: 100 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  monthText: {
    ...typography.label.lg,
    color: colors.text.primary,
    textTransform: 'capitalize',
    minWidth: 140,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metric: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  metricLabel: {
    ...typography.label.sm,
    color: colors.text.secondary,
  },
  metricValue: {
    ...typography.mono.md,
    fontWeight: '700',
  },
  savingsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  savingsLabel: {
    ...typography.label.lg,
    color: colors.text.primary,
  },
  savingsDesc: {
    ...typography.body.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  savingsValue: {
    ...typography.mono.lg,
    fontWeight: '700',
  },
  section: { gap: spacing.md },
  sectionTitle: {
    ...typography.heading.sm,
    color: colors.text.primary,
  },
  catList: { gap: spacing.sm },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catInfo: { flex: 1, gap: 6 },
  catName: { ...typography.body.sm, color: colors.text.primary },
  barTrack: { height: 3, backgroundColor: colors.surface.subtle, borderRadius: radius.full },
  barFill: { height: 3, borderRadius: radius.full },
  catRight: { alignItems: 'flex-end' },
  catAmount: { ...typography.mono.sm, color: colors.text.primary },
  catPct: { ...typography.label.sm, color: colors.text.tertiary, marginTop: 2 },
});
