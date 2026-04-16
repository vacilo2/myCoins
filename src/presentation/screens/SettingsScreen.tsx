import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, typography, spacing, radius } from '@presentation/theme/index';
import { usePreferencesStore } from '@store/preferences-store';
import { useTransactionStore } from '@store/transaction-store';
import { ScreenHeader } from '@presentation/layouts/screen-header';
import { Input } from '@presentation/ui/input';
import { CURRENCIES } from '@utils/constants';
import { useAuth } from '@features/auth';

export function SettingsScreen() {
  const preferences = usePreferencesStore((s) => s.preferences);
  const updatePreferences = usePreferencesStore((s) => s.updatePreferences);
  const { signOut, user } = useAuth();
  const userId = user?.id;

  function handleSignOut() {
    const doSignOut = () => signOut();

    if (Platform.OS === 'web') {
      if (window.confirm('Deseja sair da sua conta?')) doSignOut();
      return;
    }

    Alert.alert(
      'Sair da conta',
      'Deseja encerrar sua sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: doSignOut },
      ]
    );
  }

  function handleClearData() {
    const doReset = () => useTransactionStore.setState({ transactions: [] });

    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm('Apagar todos os lançamentos? Esta ação não pode ser desfeita.')) {
        doReset();
      }
      return;
    }

    Alert.alert(
      'Apagar todos os lançamentos',
      'Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: doReset },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Configurações" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Perfil */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Perfil</Text>
          <Input
            label="Seu nome"
            value={preferences.name}
            onChangeText={(v) => updatePreferences({ name: v }, userId)}
            placeholder="Como quer ser chamado?"
          />
        </View>

        {/* Moeda */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Moeda</Text>
          <View style={styles.currencyRow}>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[
                  styles.currencyBtn,
                  preferences.currency === c.code && styles.currencyBtnActive,
                ]}
                onPress={() => updatePreferences({ currency: c.code }, userId)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.currencySymbol,
                    preferences.currency === c.code && styles.currencySymbolActive,
                  ]}
                >
                  {c.symbol}
                </Text>
                <Text
                  style={[
                    styles.currencyCode,
                    preferences.currency === c.code && styles.currencyCodeActive,
                  ]}
                >
                  {c.code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Conta</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="account-outline" size={18} color={colors.text.secondary} />
              <Text style={[styles.rowLabel, { flex: 1, marginLeft: spacing.sm }]} numberOfLines={1}>
                {user?.email ?? '—'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
            <MaterialCommunityIcons name="logout" size={18} color={colors.semantic.expense} />
            <Text style={styles.dangerText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>

        {/* Sobre */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sobre</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Versão</Text>
              <Text style={styles.rowValue}>1.1.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Armazenamento</Text>
              <Text style={styles.rowValue}>Nuvem</Text>
            </View>
          </View>
        </View>

        {/* Dados */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Dados</Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(modals)/financial-profile')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="account-cog-outline" size={18} color={colors.accent.primary} />
            <Text style={styles.actionText}>Perfil financeiro</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(modals)/import-csv')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="file-import-outline" size={18} color={colors.accent.primary} />
            <Text style={styles.actionText}>Importar extrato CSV</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Zona de perigo */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.semantic.expense }]}>Zona de perigo</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData} activeOpacity={0.8}>
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.semantic.expense} />
            <Text style={styles.dangerText}>Apagar todos os lançamentos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.primary },
  content: { padding: spacing['2xl'], gap: spacing['3xl'], paddingBottom: 100 },
  section: { gap: spacing.md },
  sectionLabel: {
    ...typography.label.md,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currencyRow: { flexDirection: 'row', gap: spacing.sm },
  currencyBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.xs,
  },
  currencyBtnActive: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.muted,
  },
  currencySymbol: {
    ...typography.heading.md,
    color: colors.text.secondary,
  },
  currencySymbolActive: { color: colors.accent.primary },
  currencyCode: {
    ...typography.label.sm,
    color: colors.text.tertiary,
  },
  currencyCodeActive: { color: colors.accent.primary },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  rowLabel: { ...typography.body.md, color: colors.text.primary },
  rowValue: { ...typography.body.md, color: colors.text.secondary },
  divider: { height: 1, backgroundColor: colors.border.subtle },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  actionText: {
    ...typography.label.lg,
    color: colors.text.primary,
    flex: 1,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.semantic.expense + '44',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.semantic.expenseMuted,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.semantic.expense + '44',
  },
  dangerText: {
    ...typography.label.lg,
    color: colors.semantic.expense,
  },
});
