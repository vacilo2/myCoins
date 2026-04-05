import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@theme/index';

interface DividerProps {
  vertical?: boolean;
  marginVertical?: number;
}

export function Divider({ vertical = false, marginVertical = spacing.md }: DividerProps) {
  if (vertical) {
    return <View style={styles.vertical} />;
  }
  return <View style={[styles.horizontal, { marginVertical }]} />;
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: colors.border.subtle,
  },
  vertical: {
    width: 1,
    backgroundColor: colors.border.subtle,
    alignSelf: 'stretch',
  },
});
