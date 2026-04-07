import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@theme/index';
import { HealthStatus } from '@hooks/use-financial-insights';

interface HealthIndicatorProps {
  status: HealthStatus;
}

const CONFIG: Record<HealthStatus, { icon: string; label: string; color: string; bg: string }> = {
  good: {
    icon: 'check-circle-outline',
    label: 'Saudável',
    color: colors.semantic.income,
    bg: colors.semantic.incomeMuted,
  },
  warning: {
    icon: 'alert-circle-outline',
    label: 'Atenção',
    color: '#F59E0B',
    bg: '#F59E0B22',
  },
  danger: {
    icon: 'close-circle-outline',
    label: 'Orçamento estourado',
    color: colors.semantic.expense,
    bg: colors.semantic.expenseMuted,
  },
  unknown: {
    icon: 'help-circle-outline',
    label: 'Configure a renda',
    color: colors.text.tertiary,
    bg: colors.background.tertiary,
  },
};

export function HealthIndicator({ status }: HealthIndicatorProps) {
  const cfg = CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <MaterialCommunityIcons name={cfg.icon as any} size={14} color={cfg.color} />
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.label.sm,
    fontWeight: '600',
  },
});
