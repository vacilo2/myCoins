import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@theme/index';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SafeAreaWrapper({ children, style }: SafeAreaWrapperProps) {
  return (
    <SafeAreaView style={[styles.container, style]} edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});
