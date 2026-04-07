import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing, radius } from '@theme/index';
import { useUIStore } from '@store/ui-store';
import { usePreferencesStore } from '@store/preferences-store';

export function ProfileProgressCard() {
  const snoozeProfileCard = useUIStore((s) => s.snoozeProfileCard);
  const profileCardSnoozedUntil = useUIStore((s) => s.profileCardSnoozedUntil);
  const profileCompletionLevel = usePreferencesStore((s) => s.preferences.profileCompletionLevel);

  const isSnoozed = profileCardSnoozedUntil > Date.now();
  if (isSnoozed || profileCompletionLevel >= 100) return null;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Complete seu perfil</Text>
          <Text style={styles.sub}>{profileCompletionLevel}% concluído</Text>
        </View>
        <TouchableOpacity onPress={snoozeProfileCard} hitSlop={8}>
          <Text style={styles.dismiss}>Dispensar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${profileCompletionLevel}%` as any }]} />
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push('/(modals)/financial-profile')}
        activeOpacity={0.7}
      >
        <Text style={styles.btnText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  title: {
    ...typography.label.lg,
    color: colors.text.primary,
  },
  sub: {
    ...typography.label.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  dismiss: {
    ...typography.label.sm,
    color: colors.text.tertiary,
  },
  barBg: {
    height: 3,
    backgroundColor: colors.surface.subtle,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: radius.full,
  },
  btn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  btnText: {
    ...typography.label.md,
    color: colors.text.primary,
  },
});
