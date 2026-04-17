import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { typography, spacing, radius } from '@presentation/theme';
import { HealthStatus } from '@features/financeiro/use-financial-insights';

interface HealthIndicatorProps {
  status: HealthStatus;
}

const CONFIG: Record<HealthStatus, { icon: string; label: string; color: string; bg: string }> = {
  good: {
    icon: 'check-circle-outline',
    label: 'Saudável',
    color: '#4a7c59',
    bg: '#2d4d38',
  },
  warning: {
    icon: 'alert-circle-outline',
    label: 'Atenção',
    color: '#c96442',
    bg: '#3d2518',
  },
  danger: {
    icon: 'close-circle-outline',
    label: 'Orçamento estourado',
    color: '#b53333',
    bg: '#4d1f1f',
  },
  unknown: {
    icon: 'help-circle-outline',
    label: 'Configure a renda',
    color: '#87867f',
    bg: '#252523',
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
