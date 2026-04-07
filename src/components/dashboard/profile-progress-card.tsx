import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
      <View style={styles.row}>
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons name="chart-box-outline" size={22} color={colors.accent.primary} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>Melhore suas análises</Text>
          <Text style={styles.sub}>Perfil {profileCompletionLevel}% completo</Text>
        </View>
        <TouchableOpacity onPress={snoozeProfileCard} hitSlop={8}>
          <MaterialCommunityIcons name="close" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Barra de progresso */}
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${profileCompletionLevel}%` as any }]} />
      </View>

      {/* Ações */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push('/(modals)/financial-profile')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnPrimaryText}>Continuar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={snoozeProfileCard} hitSlop={8}>
          <Text style={styles.btnSecondaryText}>Agora não</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent.primary + '44',
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accent.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1, gap: 2 },
  title: { ...typography.label.lg, color: colors.text.primary, fontWeight: '700' },
  sub: { ...typography.label.sm, color: colors.text.secondary },
  barBg: {
    height: 6,
    backgroundColor: colors.border.subtle,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: radius.full,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  btnPrimary: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  btnPrimaryText: {
    ...typography.label.lg,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  btnSecondaryText: {
    ...typography.label.md,
    color: colors.text.tertiary,
  },
});
