import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, spacing, Colors } from '@presentation/theme';

interface DividerProps {
  vertical?: boolean;
  marginVertical?: number;
}

export function Divider({ vertical = false, marginVertical = spacing.md }: DividerProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  if (vertical) {
    return <View style={styles.vertical} />;
  }
  return <View style={[styles.horizontal, { marginVertical }]} />;
}


function createStyles(c: Colors) {
    return StyleSheet.create({
    horizontal: {
      height: 1,
      backgroundColor: c.border.subtle,
    },
    vertical: {
      width: 1,
      backgroundColor: c.border.subtle,
      alignSelf: 'stretch',
    },
  });
}

