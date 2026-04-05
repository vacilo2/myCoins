import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { colors, typography, spacing, radius } from '@theme/index';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.75}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.text.inverse : colors.text.primary}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={[styles.label, styles[`label_${variant}`], styles[`label_${size}`]]}>
            {label}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },

  // Variants
  primary: {
    backgroundColor: colors.accent.primary,
  },
  secondary: {
    backgroundColor: colors.surface.subtle,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  danger: {
    backgroundColor: colors.semantic.expenseMuted,
    borderWidth: 1,
    borderColor: colors.semantic.expense,
  },
  disabled: {
    opacity: 0.4,
  },

  // Sizes
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
  },

  // Label variants
  label: {
    ...typography.label.lg,
  },
  label_primary: {
    color: colors.text.inverse,
    fontWeight: '700',
  },
  label_secondary: {
    color: colors.text.primary,
  },
  label_ghost: {
    color: colors.text.secondary,
  },
  label_danger: {
    color: colors.semantic.expense,
  },

  // Label sizes
  label_sm: {
    fontSize: 13,
  },
  label_md: {
    fontSize: 14,
  },
  label_lg: {
    fontSize: 16,
  },
});
