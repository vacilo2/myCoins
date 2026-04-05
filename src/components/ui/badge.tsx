import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@theme/index';

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
      ? colors.semantic.income
      : variant === 'expense'
      ? colors.semantic.expense
      : colors.accent.primary);

  const bg = resolvedColor + '22';

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
