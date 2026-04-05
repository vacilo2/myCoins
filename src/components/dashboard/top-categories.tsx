import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@theme/index';
import { CategorySummary } from '@/types';
import { formatCurrency } from '@utils/currency';

interface TopCategoriesProps {
  categories: CategorySummary[];
  currency?: string;
}

export function TopCategories({ categories, currency = 'BRL' }: TopCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Maiores gastos</Text>
      <View style={styles.list}>
        {categories.map((item) => (
          <View key={item.category.id} style={styles.item}>
            <View style={[styles.iconWrapper, { backgroundColor: item.category.color + '22' }]}>
              <MaterialCommunityIcons
                name={item.category.icon as any}
                size={18}
                color={item.category.color}
              />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.category.name}</Text>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${Math.min(item.percentage, 100)}%` as any,
                      backgroundColor: item.category.color,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.right}>
              <Text style={styles.amount}>{formatCurrency(item.total, currency)}</Text>
              <Text style={styles.percentage}>{item.percentage.toFixed(0)}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    ...typography.heading.sm,
    color: colors.text.primary,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
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
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    ...typography.body.md,
    color: colors.text.primary,
  },
  barWrapper: {
    height: 3,
    backgroundColor: colors.surface.subtle,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  bar: {
    height: 3,
    borderRadius: radius.full,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.mono.sm,
    color: colors.text.primary,
  },
  percentage: {
    ...typography.label.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});
