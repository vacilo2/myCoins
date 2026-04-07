import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, radius } from '@theme/index';
import { usePreferencesStore } from '@store/preferences-store';

export function AvatarButton() {
  const name = usePreferencesStore((s) => s.preferences.name);
  const initials = name ? name.trim().charAt(0).toUpperCase() : '?';

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={() => router.push('/(modals)/profile-settings')}
      activeOpacity={0.6}
      hitSlop={8}
    >
      <Text style={styles.text}>{initials}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});
