import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme, typography, spacing, radius, Colors } from '@presentation/theme';

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
  const { colors } = useTheme();
  const styles = createStyles(colors);
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


function createStyles(c: Colors) {
    return StyleSheet.create({
    base: {
      borderRadius: radius.lg,
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
      backgroundColor: '#c96442',
      borderRadius: radius.lg,
    },
    secondary: {
      backgroundColor: '#30302e',
      borderWidth: 1,
      borderColor: '#3d3d3a',
      borderRadius: radius.md,
    },
    ghost: {
      backgroundColor: c.transparent,
      borderWidth: 1,
      borderColor: '#30302e',
      borderRadius: radius.md,
    },
    danger: {
      backgroundColor: '#b53333',
      borderRadius: radius.md,
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
      color: '#faf9f5',
      fontWeight: '700',
    },
    label_secondary: {
      color: '#faf9f5',
    },
    label_ghost: {
      color: '#d97757',
    },
    label_danger: {
      color: '#faf9f5',
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
}

