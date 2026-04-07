import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CategoryIconProps {
  icon: string;
  size?: number;
  color?: string;
}

/**
 * Renderiza emoji ou MaterialCommunityIcons automaticamente.
 * Ícones do MaterialCommunityIcons são sempre kebab-case ASCII (ex: "cash-multiple").
 * Qualquer outra coisa é tratada como emoji/texto.
 */
function isEmoji(str: string): boolean {
  return !/^[a-z0-9-]+$/.test(str);
}

export function CategoryIcon({ icon, size = 22, color }: CategoryIconProps) {
  if (isEmoji(icon)) {
    return (
      <Text style={[styles.emoji, { fontSize: size }]}>
        {icon}
      </Text>
    );
  }

  return (
    <MaterialCommunityIcons
      name={icon as any}
      size={size}
      color={color}
    />
  );
}

const styles = StyleSheet.create({
  emoji: {
    lineHeight: undefined,
    textAlign: 'center',
  },
});
