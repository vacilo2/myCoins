import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '@presentation/theme/index';
import { usePreferencesStore } from '@store/preferences-store';
import { Button } from '@presentation/ui/button';
import {
  FinancialGoal, SpendingProfile, IncomeType, SpendingCategory,
} from '@/types';
import {
  FINANCIAL_GOAL_LABELS, SPENDING_PROFILE_LABELS,
  INCOME_TYPE_LABELS, SPENDING_CATEGORY_LABELS,
} from '@utils/profile';

const GOALS: { value: FinancialGoal; icon: string }[] = [
  { value: 'economizar', icon: 'piggy-bank-outline' },
  { value: 'sair_das_dividas', icon: 'credit-card-off-outline' },
  { value: 'controlar_gastos', icon: 'chart-line' },
  { value: 'investir', icon: 'trending-up' },
  { value: 'organizar', icon: 'format-list-checks' },
];

const PROFILES: { value: SpendingProfile; icon: string }[] = [
  { value: 'descontrolado', icon: 'alert-circle-outline' },
  { value: 'moderado', icon: 'minus-circle-outline' },
  { value: 'controlado', icon: 'check-circle-outline' },
  { value: 'desconhecido', icon: 'help-circle-outline' },
];

const INCOME_TYPES: { value: IncomeType; icon: string }[] = [
  { value: 'fixo', icon: 'calendar-check' },
  { value: 'variavel', icon: 'chart-bell-curve' },
  { value: 'autonomo', icon: 'account-hard-hat' },
  { value: 'multiplas_fontes', icon: 'source-branch' },
];

const CATEGORIES: SpendingCategory[] = [
  'alimentacao', 'transporte', 'moradia', 'lazer',
  'compras', 'saude', 'contas', 'outros',
];

export function FinancialProfileModal() {
  const preferences = usePreferencesStore((s) => s.preferences);
  const updatePreferences = usePreferencesStore((s) => s.updatePreferences);

  const [step, setStep] = useState(0);

  // Step 0
  const [goal, setGoal] = useState<FinancialGoal | ''>(preferences.financialGoal ?? '');
  const [profile, setProfile] = useState<SpendingProfile>(preferences.spendingProfile ?? 'desconhecido');

  // Step 1
  const [incomeType, setIncomeType] = useState<IncomeType | ''>(preferences.incomeType ?? '');
  const [categories, setCategories] = useState<SpendingCategory[]>(preferences.topSpendingCategories ?? []);
  const [savingsGoalText, setSavingsGoalText] = useState(
    preferences.savingsGoalPct > 0 ? String(preferences.savingsGoalPct) : ''
  );

  function toggleCategory(cat: SpendingCategory) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function handleSaveStep0() {
    updatePreferences({ financialGoal: goal, spendingProfile: profile });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(1);
  }

  function handleSaveStep1() {
    const savingsGoalPct = parseFloat(savingsGoalText) || 0;
    updatePreferences({
      incomeType,
      topSpendingCategories: categories,
      savingsGoalPct: Math.min(100, Math.max(0, savingsGoalPct)),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      {/* Header */}
      <View style={styles.header}>
        {step === 1 ? (
          <TouchableOpacity onPress={() => setStep(0)} hitSlop={8}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ) : <View style={styles.placeholder} />}
        <Text style={styles.headerTitle}>
          {step === 0 ? 'Seu perfil financeiro' : 'Detalhes avançados'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        <View style={[styles.progressBar, { width: step === 0 ? '50%' : '100%' }]} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 0 ? (
          <>
            {/* Objetivo */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Qual é seu principal objetivo?</Text>
              <View style={styles.optionGrid}>
                {GOALS.map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    style={[styles.optionBtn, goal === g.value && styles.optionBtnActive]}
                    onPress={() => setGoal(g.value)}
                    activeOpacity={0.75}
                  >
                    <MaterialCommunityIcons
                      name={g.icon as any}
                      size={22}
                      color={goal === g.value ? colors.accent.primary : colors.text.secondary}
                    />
                    <Text style={[styles.optionText, goal === g.value && styles.optionTextActive]}>
                      {FINANCIAL_GOAL_LABELS[g.value]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Perfil de gasto */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Como você se descreve financeiramente?</Text>
              <View style={styles.optionGrid}>
                {PROFILES.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    style={[styles.optionBtn, profile === p.value && styles.optionBtnActive]}
                    onPress={() => setProfile(p.value)}
                    activeOpacity={0.75}
                  >
                    <MaterialCommunityIcons
                      name={p.icon as any}
                      size={22}
                      color={profile === p.value ? colors.accent.primary : colors.text.secondary}
                    />
                    <Text style={[styles.optionText, profile === p.value && styles.optionTextActive]}>
                      {SPENDING_PROFILE_LABELS[p.value]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button label="Continuar" onPress={handleSaveStep0} size="lg" />
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.skipText}>Agora não</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Tipo de renda */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Qual é seu tipo de renda?</Text>
              <View style={styles.optionGrid}>
                {INCOME_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.optionBtn, incomeType === t.value && styles.optionBtnActive]}
                    onPress={() => setIncomeType(t.value)}
                    activeOpacity={0.75}
                  >
                    <MaterialCommunityIcons
                      name={t.icon as any}
                      size={22}
                      color={incomeType === t.value ? colors.accent.primary : colors.text.secondary}
                    />
                    <Text style={[styles.optionText, incomeType === t.value && styles.optionTextActive]}>
                      {INCOME_TYPE_LABELS[t.value]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Categorias de gasto */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Onde você mais gasta? <Text style={styles.optional}>(selecione até 3)</Text></Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const selected = categories.includes(cat);
                  const maxReached = categories.length >= 3 && !selected;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catBtn, selected && styles.catBtnActive, maxReached && styles.catBtnDisabled]}
                      onPress={() => !maxReached && toggleCategory(cat)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.catText, selected && styles.catTextActive]}>
                        {SPENDING_CATEGORY_LABELS[cat]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Meta de poupança */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meta de poupança mensal <Text style={styles.optional}>(opcional)</Text></Text>
              <Text style={styles.hint}>Ex: 10% ou 20% da sua renda</Text>
              <View style={styles.inputRow}>
                <TextInput
                  value={savingsGoalText}
                  onChangeText={setSavingsGoalText}
                  placeholder="20"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                  style={[styles.input, styles.inputSmall]}
                  maxLength={3}
                />
                <Text style={styles.suffix}>% da renda</Text>
              </View>
            </View>

            <Button label="Salvar perfil" onPress={handleSaveStep1} size="lg" />
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.skipText}>Agora não</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'], paddingVertical: spacing.lg,
  },
  headerTitle: { ...typography.heading.md, color: colors.text.primary },
  placeholder: { width: 24 },
  progress: {
    height: 3, backgroundColor: colors.border.subtle,
    marginHorizontal: spacing['2xl'], borderRadius: radius.full, overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: colors.accent.primary, borderRadius: radius.full },
  content: { padding: spacing['2xl'], gap: spacing.xl, paddingBottom: spacing['4xl'] },
  section: { gap: spacing.md },
  sectionTitle: { ...typography.heading.sm, color: colors.text.primary },
  optional: { ...typography.label.md, color: colors.text.tertiary },
  hint: { ...typography.body.sm, color: colors.text.tertiary },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.background.secondary, borderRadius: radius.md,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.border.default,
  },
  optionBtnActive: { borderColor: colors.accent.primary, backgroundColor: colors.accent.muted },
  optionText: { ...typography.label.md, color: colors.text.secondary },
  optionTextActive: { color: colors.accent.primary, fontWeight: '600' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catBtn: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border.default,
  },
  catBtnActive: { borderColor: colors.accent.primary, backgroundColor: colors.accent.muted },
  catBtnDisabled: { opacity: 0.4 },
  catText: { ...typography.label.md, color: colors.text.secondary },
  catTextActive: { color: colors.accent.primary, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  input: {
    ...typography.body.lg, color: colors.text.primary,
    backgroundColor: colors.background.tertiary, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border.default,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 52,
  },
  inputSmall: { width: 100 },
  suffix: { ...typography.body.md, color: colors.text.secondary },
  skipText: { ...typography.label.md, color: colors.text.tertiary, textAlign: 'center', paddingVertical: spacing.sm },
});
