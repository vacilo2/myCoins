import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, typography, spacing, radius } from '@theme/index';
import { usePreferencesStore } from '@store/preferences-store';
import { useTransactionStore } from '@store/transaction-store';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Input } from '@ui/input';
import { CURRENCIES } from '@utils/constants';

export default function SettingsScreen() {
  const preferences = usePreferencesStore((s) => s.preferences);
  const updatePreferences = usePreferencesStore((s) => s.updatePreferences);
  const deleteAll = useTransactionStore((s) => s.transactions);

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
            // clear via store reset
            useTransactionStore.setState({ transactions: [] });
          },
        },
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
            onChangeText={(v) => updatePreferences({ name: v })}
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
                onPress={() => updatePreferences({ currency: c.code })}
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

        {/* Sobre */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sobre</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Versão</Text>
              <Text style={styles.rowValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Armazenamento</Text>
              <Text style={styles.rowValue}>Local</Text>
            </View>
          </View>
        </View>

        {/* Importar */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Dados</Text>
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
