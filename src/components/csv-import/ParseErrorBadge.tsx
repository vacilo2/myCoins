import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@theme/index';

interface ParseErrorBadgeProps {
  message: string;
}

export function ParseErrorBadge({ message }: ParseErrorBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.semantic.expenseMuted,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.label.sm,
    color: colors.semantic.expense,
  },
});
