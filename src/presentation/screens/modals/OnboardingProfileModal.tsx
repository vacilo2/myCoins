import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '@presentation/theme/index';
import { usePreferencesStore } from '@store/preferences-store';
import { Button } from '@presentation/ui/button';
import { parseCurrencyInput } from '@utils/currency';

export function OnboardingProfileModal() {
  const preferences = usePreferencesStore((s) => s.preferences);
  const updatePreferences = usePreferencesStore((s) => s.updatePreferences);

  const [name, setName] = useState(preferences.name);
  const [incomeText, setIncomeText] = useState(
    preferences.monthlyIncome > 0 ? String(preferences.monthlyIncome) : ''
  );
  const [savedText, setSavedText] = useState(
    preferences.savedAmount > 0 ? String(preferences.savedAmount) : ''
  );

  function handleSave() {
    const monthlyIncome = parseCurrencyInput(incomeText);
    const savedAmount = parseCurrencyInput(savedText);
    updatePreferences({
      name: name.trim(),
      monthlyIncome,
      savedAmount,
      onboardingCompleted: true,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  const canSave = name.trim().length >= 2;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.title}>Bem-vindo ao myCoins!</Text>
          <Text style={styles.subtitle}>
            Conta um pouco sobre você para personalizarmos sua experiência.
          </Text>
        </View>

        {/* Nome */}
        <View style={styles.field}>
          <Text style={styles.label}>Como você quer ser chamado?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Seu nome ou apelido"
            placeholderTextColor={colors.text.tertiary}
            style={styles.input}
            maxLength={30}
            autoFocus
          />
        </View>

        {/* Renda */}
        <View style={styles.field}>
          <Text style={styles.label}>Qual é sua renda mensal? <Text style={styles.optional}>(opcional)</Text></Text>
          <Text style={styles.hint}>Usado para calcular seu orçamento e saúde financeira</Text>
          <View style={styles.inputRow}>
            <Text style={styles.prefix}>R$</Text>
            <TextInput
              value={incomeText}
              onChangeText={setIncomeText}
              placeholder="0,00"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="decimal-pad"
              style={[styles.input, styles.inputFlex]}
            />
          </View>
        </View>

        {/* Valor guardado */}
        <View style={styles.field}>
          <Text style={styles.label}>Quanto você já tem guardado? <Text style={styles.optional}>(opcional)</Text></Text>
          <Text style={styles.hint}>Sua reserva atual — não precisamos saber onde</Text>
          <View style={styles.inputRow}>
            <Text style={styles.prefix}>R$</Text>
            <TextInput
              value={savedText}
              onChangeText={setSavedText}
              placeholder="0,00"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="decimal-pad"
              style={[styles.input, styles.inputFlex]}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            label="Vamos começar!"
            onPress={handleSave}
            size="lg"
            disabled={!canSave}
          />
          <TouchableOpacity onPress={() => {
            updatePreferences({ onboardingCompleted: true });
            router.back();
          }} hitSlop={8}>
            <Text style={styles.skipText}>Pular por enquanto</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background.primary },
  content: { padding: spacing['2xl'], gap: spacing.xl, paddingBottom: spacing['4xl'] },
  header: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  emoji: { fontSize: 48 },
  title: { ...typography.heading.xl, color: colors.text.primary, textAlign: 'center' },
  subtitle: { ...typography.body.md, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  field: { gap: spacing.sm },
  label: { ...typography.label.lg, color: colors.text.primary },
  optional: { ...typography.label.md, color: colors.text.tertiary },
  hint: { ...typography.body.sm, color: colors.text.tertiary },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  prefix: { ...typography.heading.md, color: colors.text.secondary },
  input: {
    ...typography.body.lg,
    color: colors.text.primary,
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  inputFlex: { flex: 1 },
  actions: { gap: spacing.md, marginTop: spacing.md },
  skipText: { ...typography.label.md, color: colors.text.tertiary, textAlign: 'center', paddingVertical: spacing.sm },
});
