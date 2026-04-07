import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@theme/index';
import { HealthStatus } from '@hooks/use-financial-insights';

interface HealthIndicatorProps {
  status: HealthStatus;
}

const CONFIG: Record<HealthStatus, { label: string; color: string }> = {
  good: { label: 'Saudável', color: colors.semantic.income },
  warning: { label: 'Atenção', color: '#F59E0B' },
  danger: { label: 'Orçamento estourado', color: colors.semantic.expense },
  unknown: { label: 'Configure a renda', color: colors.text.tertiary },
};

export function HealthIndicator({ status }: HealthIndicatorProps) {
  const cfg = CONFIG[status];

  return (
    <View style={styles.badge}>
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    ...typography.label.sm,
  },
});
