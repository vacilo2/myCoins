import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography, spacing, radius } from '@presentation/theme';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
  variant?: 'income' | 'expense' | 'custom';
}

export function Badge({ label, color, size = 'md', variant }: BadgeProps) {
  const resolvedColor =
    color ??
    (variant === 'income'
      ? '#4a7c59'
      : variant === 'expense'
      ? '#b53333'
      : '#c96442');

  const bg =
    variant === 'income'
      ? '#2d4d38'
      : variant === 'expense'
      ? '#4d1f1f'
      : color
      ? color + '22'
      : '#3d2518';

  return (
    <View
      style={[
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: bg },
      ]}
    >
      <Text
        style={[
          size === 'sm' ? styles.textSm : styles.textMd,
          { color: resolvedColor },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
  },
  sm: {
    paddingVertical: 2,
  },
  md: {
    paddingVertical: spacing.xs,
  },
  textSm: {
    ...typography.label.sm,
  },
  textMd: {
    ...typography.label.md,
  },
});
