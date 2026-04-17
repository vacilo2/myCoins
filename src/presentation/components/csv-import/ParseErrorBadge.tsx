import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, typography, spacing, radius, Colors } from '@presentation/theme';

interface ParseErrorBadgeProps {
  message: string;
}

export function ParseErrorBadge({ message }: ParseErrorBadgeProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}


function createStyles(c: Colors) {
    return StyleSheet.create({
    badge: {
      backgroundColor: c.semantic.expenseMuted,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      alignSelf: 'flex-start',
    },
    text: {
      ...typography.label.sm,
      color: c.semantic.expense,
    },
  });
}

