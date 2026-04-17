import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme, typography, spacing, radius, Colors } from '@presentation/theme';
import { MonthlyChartData } from '@features/relatorios/use-reports';
import { formatCurrency } from '@utils/currency';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BAR_WIDTH = 24;

interface ChartBarProps {
  data: MonthlyChartData[];
  currency?: string;
}

export function ChartBar({ data, currency = 'BRL' }: ChartBarProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const maxValue = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
  const chartHeight = 120;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receitas vs Despesas</Text>
      <View style={styles.chart}>
        {data.map((item, index) => {
          const incomeHeight = (item.income / maxValue) * chartHeight;
          const expenseHeight = (item.expense / maxValue) * chartHeight;
          return (
            <View key={index} style={styles.group}>
              <View style={[styles.chartArea, { height: chartHeight }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: incomeHeight,
                      backgroundColor: colors.semantic.income,
                      marginRight: 3,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    {
                      height: expenseHeight,
                      backgroundColor: colors.semantic.expense,
                    },
                  ]}
                />
              </View>
              <Text style={styles.label}>{item.month}</Text>
            </View>
          );
        })}
      </View>

      {/* Legenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.semantic.income }]} />
          <Text style={styles.legendText}>Receitas</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.semantic.expense }]} />
          <Text style={styles.legendText}>Despesas</Text>
        </View>
      </View>
    </View>
  );
}


function createStyles(c: Colors) {
    return StyleSheet.create({
    container: {
      backgroundColor: c.background.secondary,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.lg,
      borderWidth: 1,
      borderColor: c.border.default,
    },
    title: {
      ...typography.heading.sm,
      color: c.text.primary,
    },
    chart: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    group: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    chartArea: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    bar: {
      width: BAR_WIDTH,
      borderRadius: radius.xs,
      minHeight: 2,
    },
    label: {
      ...typography.label.sm,
      color: c.text.tertiary,
    },
    legend: {
      flexDirection: 'row',
      gap: spacing.lg,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
    },
    legendText: {
      ...typography.label.sm,
      color: c.text.secondary,
    },
  });
}

