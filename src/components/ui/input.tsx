import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, radius } from '@theme/index';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, focused && styles.labelFocused, error && styles.labelError]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.container,
          focused && styles.containerFocused,
          error && styles.containerError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeft, rightIcon && styles.inputWithRight, style]}
          placeholderTextColor={colors.text.tertiary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {(error || hint) && (
        <Text style={[styles.hint, error && styles.hintError]}>{error ?? hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label.md,
    color: colors.text.secondary,
  },
  labelFocused: {
    color: colors.accent.primary,
  },
  labelError: {
    color: colors.semantic.expense,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    minHeight: 52,
  },
  containerFocused: {
    borderColor: colors.border.focused,
  },
  containerError: {
    borderColor: colors.semantic.expense,
  },
  input: {
    flex: 1,
    ...typography.body.lg,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputWithLeft: {
    paddingLeft: spacing.sm,
  },
  inputWithRight: {
    paddingRight: spacing.sm,
  },
  leftIcon: {
    paddingLeft: spacing.md,
  },
  rightIcon: {
    paddingRight: spacing.md,
  },
  hint: {
    ...typography.body.sm,
    color: colors.text.tertiary,
  },
  hintError: {
    color: colors.semantic.expense,
  },
});
