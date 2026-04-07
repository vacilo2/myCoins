import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, typography, spacing, radius } from '@theme/index';
import { usePreferencesStore } from '@store/preferences-store';
import { useTransactionStore } from '@store/transaction-store';
import { Input } from '@ui/input';
import { CURRENCIES } from '@utils/constants';

export default function ProfileSettingsModal() {
  const preferences = usePreferencesStore((s) => s.preferences);
  const updatePreferences = usePreferencesStore((s) => s.updatePreferences);

  function handleClearData() {
    Alert.alert(
      'Apagar todos os dados',
      'Esta ação não pode ser desfeita. Todos os lançamentos serão removidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => {
            useTransactionStore.setState({ transactions: [] });
          },
        },
      ]
    );
  }

  const initial = preferences.name ? preferences.name.trim().charAt(0).toUpperCase() : '?';

  return (
    <View style={styles.container}>
      {/* Drag handle */}
      <View style={styles.handleBar}>
        <View style={styles.handle} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configurações</Text>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <MaterialCommunityIcons name="close" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Perfil */}
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{preferences.name || 'Sem nome'}</Text>
            <Text style={styles.profileSub}>Perfil local</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Nome */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil</Text>
          <Input
            label="Seu nome"
            value={preferences.name}
            onChangeText={(v) => updatePreferences({ name: v })}
            placeholder="Como quer ser chamado?"
          />
        </View>

        <View style={styles.divider} />

        {/* Moeda */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moeda</Text>
          <View style={styles.currencyRow}>
            {CURRENCIES.map((c) => {
              const active = preferences.currency === c.code;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.currencyBtn, active && styles.currencyBtnActive]}
                  onPress={() => updatePreferences({ currency: c.code })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.currencySymbol, active && styles.currencyActive]}>
                    {c.symbol}
                  </Text>
                  <Text style={[styles.currencyCode, active && styles.currencyActive]}>
                    {c.code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Ações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>
          <MenuItem
            icon="account-cog-outline"
            label="Perfil financeiro"
            onPress={() => router.push('/(modals)/financial-profile')}
          />
          <MenuItem
            icon="file-import-outline"
            label="Importar extrato CSV"
            onPress={() => router.push('/(modals)/import-csv')}
          />
        </View>

        <View style={styles.divider} />

        {/* Sobre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versão</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Armazenamento</Text>
            <Text style={styles.infoValue}>Local</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Zona de perigo */}
        <View style={styles.section}>
          <MenuItem
            icon="trash-can-outline"
            label="Apagar todos os lançamentos"
            onPress={handleClearData}
            destructive
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  destructive,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const tint = destructive ? colors.semantic.expense : colors.text.primary;
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <MaterialCommunityIcons name={icon as any} size={18} color={tint} />
      <Text style={[styles.menuLabel, { color: tint }]}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={16} color={colors.text.tertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    ...typography.heading.md,
    color: colors.text.primary,
  },
  scroll: {
    paddingHorizontal: spacing['2xl'],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  profileName: {
    ...typography.heading.sm,
    color: colors.text.primary,
  },
  profileSub: {
    ...typography.body.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing.sm,
  },
  section: {
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.label.sm,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  currencyBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    gap: 2,
  },
  currencyBtnActive: {
    backgroundColor: colors.accent.muted,
  },
  currencySymbol: {
    ...typography.heading.sm,
    color: colors.text.tertiary,
  },
  currencyCode: {
    ...typography.label.sm,
    color: colors.text.tertiary,
  },
  currencyActive: {
    color: colors.accent.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  menuLabel: {
    ...typography.body.md,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.body.md,
    color: colors.text.primary,
  },
  infoValue: {
    ...typography.body.md,
    color: colors.text.tertiary,
  },
});
