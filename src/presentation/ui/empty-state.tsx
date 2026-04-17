import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography, spacing } from '@presentation/theme';
import { Button } from './button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} size="sm" style={styles.action} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
    gap: spacing.md,
  },
  iconWrapper: {
    marginBottom: spacing.sm,
    opacity: 0.5,
  },
  title: {
    ...typography.heading.md,
    color: '#b0aea5',
    textAlign: 'center',
  },
  description: {
    ...typography.body.md,
    color: '#87867f',
    textAlign: 'center',
    lineHeight: 22,
  },
  action: {
    marginTop: spacing.md,
  },
});
