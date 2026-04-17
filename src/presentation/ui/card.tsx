import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { spacing, radius } from '@presentation/theme';

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
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  elevated: {
    backgroundColor: '#30302e',
    borderWidth: 1,
    borderColor: '#30302e',
  },
  outlined: {
    backgroundColor: '#30302e',
    borderWidth: 1,
    borderColor: '#3d3d3a',
  },
  flat: {
    backgroundColor: '#252523',
    borderWidth: 1,
    borderColor: '#30302e',
  },
});
