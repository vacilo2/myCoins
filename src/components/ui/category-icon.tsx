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
 * Se o icon contiver caractere emoji (não-ASCII simples), usa Text.
 * Caso contrário, usa MaterialCommunityIcons (compatibilidade com categorias legadas).
 */
function isEmoji(str: string): boolean {
  return /\p{Emoji}/u.test(str) && !/^[a-z0-9-]+$/.test(str);
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
