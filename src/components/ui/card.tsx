import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors, spacing, radius } from '@theme/index';

type CardVariant = 'elevated' | 'outlined' | 'flat';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function Card({
  children,
  variant = 'elevated',
  padding,
  style,
  onPress,
}: CardProps) {
  const containerStyle = [
    styles.base,
    styles[variant],
    padding !== undefined && { padding },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  elevated: {
    backgroundColor: colors.background.secondary,
  },
  outlined: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  flat: {
    backgroundColor: colors.background.tertiary,
  },
});
