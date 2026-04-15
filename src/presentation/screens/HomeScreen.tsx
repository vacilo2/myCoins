import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { colors, typography, spacing, radius } from '@presentation/theme/index';
import { useTransactionStore } from '@store/transaction-store';
import { useCategoryStore } from '@store/category-store';
import { usePreferencesStore } from '@store/preferences-store';
import { useAuthStore } from '@store/auth-store';
import { TransactionCard } from '@presentation/components/transaction/transaction-card';
import { parseTransaction } from '@features/nlp/parse-transaction';
import { toISODate } from '@utils/date';
import { formatCurrency } from '@utils/currency';

// ---------------------------------------------------------------------------
// Dicas organizadas por categoria
// (estrutura preparada para personagem/mascote futuro)
// ---------------------------------------------------------------------------
type TipCategory = {
  id: string;
  label: string;
  icon: string;
  color: string;
  tips: string[];
};

const TIP_CATEGORIES: TipCategory[] = [
  {
    id: 'expense',
    label: 'Despesas',
    icon: 'arrow-up-circle-outline',
    color: colors.semantic.expense,
    tips: [
      'gastei 45 reais com almoço',
      'paguei 120 de farmácia',
      'comprei roupa por 200 reais',
      'saiu 80 reais de gasolina',
      'paguei 150 de academia',
    ],
  },
  {
    id: 'income',
    label: 'Receitas',
    icon: 'arrow-down-circle-outline',
    color: colors.semantic.income,
    tips: [
      'recebi 3000 de salário',
      'ganhei 500 de freela',
      'entrou 200 de dividendos',
      'recebi 150 de freelance',
    ],
  },
  {
    id: 'credit',
    label: 'Crédito',
    icon: 'credit-card-outline',
    color: colors.accent.primary,
    tips: [
      'gastei 1200 no crédito em 12x',
      'comprei notebook 3600 dividi em 24x',
      'parcelei 800 em 6 vezes',
      'gastei 500 no cartão em 3x',
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildGreeting(name: string): string {
  const hour = new Date().getHours();
  const firstName = name?.trim().split(' ')[0] || '';
  const period = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  return firstName ? `${period}, ${firstName}` : period;
}

function normStr(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ---------------------------------------------------------------------------
// Sub-componente: Seção de dicas
// (o espaço do mascote fica reservado acima das dicas)
// ---------------------------------------------------------------------------
function TipsSection({ onSelectTip }: { onSelectTip: (tip: string) => void }) {
  const [activeTab, setActiveTab] = useState('expense');
  const active = TIP_CATEGORIES.find(c => c.id === activeTab)!;

  return (
    <View style={tipStyles.container}>
      {/* ── Área reservada para o mascote ── */}
      <View style={tipStyles.mascotArea}>
        <View style={tipStyles.mascotAvatar}>
          <MaterialCommunityIcons name="robot-happy-outline" size={24} color={colors.accent.primary} />
        </View>
        <View style={tipStyles.mascotBubble}>
          <Text style={tipStyles.mascotText}>
            Toque em uma dica ou escreva do seu jeito!
          </Text>
        </View>
      </View>

      {/* ── Abas de categoria ── */}
      <View style={tipStyles.tabs}>
        {TIP_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[tipStyles.tab, activeTab === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '18' }]}
            onPress={() => setActiveTab(cat.id)}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons
              name={cat.icon as any}
              size={14}
              color={activeTab === cat.id ? cat.color : colors.text.tertiary}
            />
            <Text style={[tipStyles.tabText, activeTab === cat.id && { color: cat.color }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Chips de dicas ── */}
      <View style={tipStyles.chips}>
        {active.tips.map((tip, i) => (
          <TouchableOpacity
            key={i}
            style={[tipStyles.chip, { borderColor: active.color + '55' }]}
            onPress={() => onSelectTip(tip)}
            activeOpacity={0.75}
          >
            <Text style={[tipStyles.chipText, { color: active.color }]}>{tip}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tela principal
// ---------------------------------------------------------------------------
export function HomeScreen() {
  const [inputText, setInputText] = useState('');
  const [feedback, setFeedback]   = useState<{ message: string; isError: boolean } | null>(null);
  const feedbackOpacity           = useRef(new Animated.Value(0)).current;
  const inputRef                  = useRef<TextInput>(null);

  const addTransaction  = useTransactionStore(s => s.addTransaction);
  const addInstallments = useTransactionStore(s => s.addInstallments);
  const transactions    = useTransactionStore(s => s.transactions);
  const authUser        = useAuthStore(s => s.user);
  const categories      = useCategoryStore(s => s.categories);
  const getCategoryById = useCategoryStore(s => s.getCategoryById);
  const isStoreReady    = useCategoryStore(s => s.isHydrated);
  const preferences     = usePreferencesStore(s => s.preferences);

  const recentThree = transactions.slice(0, 3);

  const findCategoryId = useCallback(
    (categoryName: string, type: 'income' | 'expense'): string => {
      const target = normStr(categoryName);
      const exact = categories.find(c => normStr(c.name) === target && (c.type === type || c.type === 'both'));
      if (exact) return exact.id;
      const outros = categories.find(c => normStr(c.name) === 'outros' && (c.type === type || c.type === 'both'));
      return outros?.id ?? categories[0]?.id ?? 'unknown';
    },
    [categories],
  );

  const findCategoryByText = useCallback(
    (text: string, type: 'income' | 'expense'): { id: string; name: string } | null => {
      const normText = normStr(text);
      const compatible = categories.filter(c => c.type === type || c.type === 'both');
      const sorted = [...compatible].sort((a, b) => b.name.length - a.name.length);
      for (const cat of sorted) {
        if (normText.includes(normStr(cat.name))) return { id: cat.id, name: cat.name };
      }
      return null;
    },
    [categories],
  );

  const showFeedback = useCallback(
    (message: string, isError: boolean) => {
      setFeedback({ message, isError });
      feedbackOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(feedbackOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(3000),
        Animated.timing(feedbackOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => setFeedback(null));
    },
    [feedbackOpacity],
  );

  const handleSubmit = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const result = parseTransaction(trimmed);

    if (!result) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showFeedback('Não entendi. Tente: "gastei 50 reais com almoço"', true);
      return;
    }

    const matchByText  = findCategoryByText(trimmed, result.type);
    const categoryId   = matchByText ? matchByText.id : findCategoryId(result.categoryName, result.type);
    const categoryName = matchByText ? matchByText.name : result.categoryName;
    const userId       = authUser?.id;

    if (result.installments && result.installments > 1) {
      addInstallments({ totalAmount: result.amount, installments: result.installments, categoryId, description: result.description, firstDate: toISODate(new Date()) }, userId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setInputText('');
      const parcelValue = Math.round((result.amount / result.installments) * 100) / 100;
      showFeedback(`${result.installments}x de ${formatCurrency(parcelValue, preferences.currency || 'BRL')} em ${categoryName}`, false);
      return;
    }

    addTransaction({ type: result.type, amount: result.amount, categoryId, description: result.description, date: toISODate(new Date()), paymentMethod: result.paymentMethod }, userId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setInputText('');

    const typeLabel    = result.type === 'expense' ? 'Despesa' : 'Receita';
    const creditSuffix = result.paymentMethod === 'credit' ? ' · Crédito' : '';
    showFeedback(`${typeLabel} de ${formatCurrency(result.amount, preferences.currency || 'BRL')} em ${categoryName}${creditSuffix}`, false);
  }, [inputText, addTransaction, addInstallments, findCategoryId, findCategoryByText, showFeedback, preferences.currency, authUser?.id]);

  const handleSelectTip = useCallback((tip: string) => {
    setInputText(tip);
    inputRef.current?.focus();
    Haptics.selectionAsync?.();
  }, []);

  const canSubmit = inputText.trim().length > 0 && isStoreReady;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Header */}
          <View style={styles.header}>
            <Text style={styles.appName}>myCoins</Text>
            <Text style={styles.greeting}>{buildGreeting(preferences.name)}</Text>
          </View>

          {/* 2. Input compacto */}
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ex: gastei 42 reais com jantar"
              placeholderTextColor={colors.text.tertiary}
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              style={styles.textInput}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.sendButton, !canSubmit && styles.sendButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons name="send" size={18} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>

          {/* 3. Feedback */}
          {feedback && (
            <Animated.View style={[styles.feedbackStrip, feedback.isError && styles.feedbackError, { opacity: feedbackOpacity }]}>
              <MaterialCommunityIcons
                name={feedback.isError ? 'alert-circle-outline' : 'check-circle-outline'}
                size={15}
                color={feedback.isError ? colors.semantic.expense : colors.semantic.income}
              />
              <Text style={[styles.feedbackText, feedback.isError && styles.feedbackTextError]}>
                {feedback.message}
              </Text>
            </Animated.View>
          )}

          {/* 4. Dicas */}
          <TipsSection onSelectTip={handleSelectTip} />

          {/* 5. Recentes */}
          {recentThree.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recentes</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
                  <Text style={styles.seeAll}>Ver todos</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.list}>
                {recentThree.map(t => (
                  <TransactionCard
                    key={t.id}
                    transaction={t}
                    category={getCategoryById(t.categoryId)}
                    currency={preferences.currency}
                    onPress={() => router.push({ pathname: '/(modals)/edit-transaction', params: { id: t.id } })}
                  />
                ))}
              </View>
            </View>
          )}

          {recentThree.length === 0 && (
            <View style={styles.emptyHint}>
              <Text style={styles.emptyText}>Toque em uma dica acima ou escreva para registrar seu primeiro lançamento.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles — TipsSection
// ---------------------------------------------------------------------------
const tipStyles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  // Área do mascote — preparada para imagem/personagem futuro
  mascotArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mascotAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.accent.muted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accent.primary + '44',
  },
  mascotBubble: {
    flex: 1,
    backgroundColor: colors.surface.subtle,
    borderRadius: radius.lg,
    borderTopLeftRadius: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  mascotText: {
    ...(typography.body.sm as object),
    color: colors.text.secondary,
  },
  // Abas
  tabs: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.tertiary,
  },
  tabText: {
    ...(typography.label.sm as object),
    color: colors.text.tertiary,
  },
  // Chips
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: colors.background.secondary,
  },
  chipText: {
    ...(typography.label.sm as object),
  },
});

// ---------------------------------------------------------------------------
// Styles — HomeScreen
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.primary },
  flex: { flex: 1 },
  content: {
    padding: spacing['2xl'],
    gap: spacing.xl,
    paddingBottom: 120,
  },
  header: { gap: spacing.xs, marginTop: spacing.sm },
  appName: {
    ...(typography.label.md as object),
    color: colors.accent.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  greeting: {
    ...(typography.heading.xl as object),
    color: colors.text.primary,
  },

  // Input compacto — linha única com botão à direita
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.default,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  textInput: {
    ...(typography.body.md as object),
    color: colors.text.primary,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.35 },

  // Feedback
  feedbackStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface.subtle,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.semantic.incomeMuted,
  },
  feedbackError: { borderColor: colors.semantic.expenseMuted },
  feedbackText: {
    ...(typography.body.sm as object),
    color: colors.semantic.income,
    flex: 1,
  },
  feedbackTextError: { color: colors.semantic.expense },

  // Recentes
  recentSection: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: {
    ...(typography.heading.sm as object),
    color: colors.text.primary,
  },
  seeAll: {
    ...(typography.label.md as object),
    color: colors.accent.primary,
  },
  list: { gap: spacing.sm },

  // Empty
  emptyHint: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  emptyText: {
    ...(typography.body.md as object),
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
