import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, radius } from '@presentation/theme/index';

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
          placeholderTextColor='#87867f'
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
    color: '#b0aea5',
  },
  labelFocused: {
    color: '#c96442',
  },
  labelError: {
    color: '#b53333',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252523',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#30302e',
    minHeight: 52,
  },
  containerFocused: {
    borderColor: '#3898ec',
  },
  containerError: {
    borderColor: '#b53333',
  },
  input: {
    flex: 1,
    ...typography.body.lg,
    color: '#faf9f5',
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
    color: '#87867f',
  },
  hintError: {
    color: '#b53333',
  },
});
