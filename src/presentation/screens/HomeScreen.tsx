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
import { TransactionCard } from '@presentation/components/transaction/transaction-card';
import { parseTransaction } from '@features/nlp/parse-transaction';
import { toISODate } from '@utils/date';
import { formatCurrency } from '@utils/currency';

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
// Component
// ---------------------------------------------------------------------------
export function HomeScreen() {
  const [inputText, setInputText]   = useState('');
  const [feedback, setFeedback]     = useState<{ message: string; isError: boolean } | null>(null);
  const feedbackOpacity             = useRef(new Animated.Value(0)).current;
  const inputRef                    = useRef<TextInput>(null);

  const addTransaction  = useTransactionStore(s => s.addTransaction);
  const transactions    = useTransactionStore(s => s.transactions);
  const categories      = useCategoryStore(s => s.categories);
  const getCategoryById = useCategoryStore(s => s.getCategoryById);
  const isStoreReady    = useCategoryStore(s => s.isHydrated);
  const preferences     = usePreferencesStore(s => s.preferences);

  const recentThree = transactions.slice(0, 3);

  // -------------------------------------------------------------------------
  // Lookup category id by name + type
  // -------------------------------------------------------------------------
  const findCategoryId = useCallback(
    (categoryName: string, type: 'income' | 'expense'): string => {
      const target = normStr(categoryName);
      const exact = categories.find(
        c => normStr(c.name) === target && (c.type === type || c.type === 'both'),
      );
      if (exact) return exact.id;
      const outros = categories.find(
        c => normStr(c.name) === 'outros' && (c.type === type || c.type === 'both'),
      );
      return outros?.id ?? categories[0]?.id ?? 'unknown';
    },
    [categories],
  );

  // -------------------------------------------------------------------------
  // Busca categoria pelo texto digitado — prioriza nomes de categorias existentes
  // Ex: "gastei 40 com aiqfome" → encontra categoria "Aiqfome" no store
  // -------------------------------------------------------------------------
  const findCategoryByText = useCallback(
    (text: string, type: 'income' | 'expense'): { id: string; name: string } | null => {
      const normText = normStr(text);
      // Filtra categorias compatíveis com o tipo
      const compatible = categories.filter(
        c => c.type === type || c.type === 'both',
      );
      // Ordena por tamanho do nome decrescente para match mais específico primeiro
      const sorted = [...compatible].sort((a, b) => b.name.length - a.name.length);
      for (const cat of sorted) {
        if (normText.includes(normStr(cat.name))) {
          return { id: cat.id, name: cat.name };
        }
      }
      return null;
    },
    [categories],
  );

  // -------------------------------------------------------------------------
  // Feedback animation
  // -------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const handleSubmit = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const result = parseTransaction(trimmed);

    if (!result) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showFeedback('Não entendi. Tente: "gastei 50 reais com almoço"', true);
      return;
    }

    // Prioridade 1: nome de categoria existente no texto (inclui categorias do usuário)
    // Prioridade 2: categoria sugerida pelo parser (palavras-chave fixas)
    const matchByText = findCategoryByText(trimmed, result.type);
    const categoryId   = matchByText ? matchByText.id : findCategoryId(result.categoryName, result.type);
    const categoryName = matchByText ? matchByText.name : result.categoryName;

    addTransaction({
      type:        result.type,
      amount:      result.amount,
      categoryId,
      description: result.description,
      date:        toISODate(new Date()),
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setInputText('');
    inputRef.current?.clear();

    const typeLabel = result.type === 'expense' ? 'Despesa' : 'Receita';
    const formatted = formatCurrency(result.amount, preferences.currency || 'BRL');
    showFeedback(`${typeLabel} de ${formatted} registrada em ${categoryName}`, false);
  }, [inputText, addTransaction, findCategoryId, showFeedback, preferences.currency]);

  const canSubmit = inputText.trim().length > 0 && isStoreReady;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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

          {/* 2. Input card */}
          <View style={styles.inputCard}>
            <TextInput
              ref={inputRef}
              value={inputText}
              onChangeText={setInputText}
              placeholder={'Ex: gastei 42 reais com jantar'}
              placeholderTextColor={colors.text.tertiary}
              multiline
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
              <MaterialCommunityIcons name="send" size={20} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>

          {/* 3. Feedback strip */}
          {feedback && (
            <Animated.View
              style={[
                styles.feedbackStrip,
                feedback.isError && styles.feedbackError,
                { opacity: feedbackOpacity },
              ]}
            >
              <MaterialCommunityIcons
                name={feedback.isError ? 'alert-circle-outline' : 'check-circle-outline'}
                size={16}
                color={feedback.isError ? colors.semantic.expense : colors.semantic.income}
              />
              <Text style={[styles.feedbackText, feedback.isError && styles.feedbackTextError]}>
                {feedback.message}
              </Text>
            </Animated.View>
          )}

          {/* 4. Recentes */}
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
                    onPress={() =>
                      router.push({
                        pathname: '/(modals)/edit-transaction',
                        params: { id: t.id },
                      })
                    }
                  />
                ))}
              </View>
            </View>
          )}

          {recentThree.length === 0 && (
            <View style={styles.emptyHint}>
              <Text style={styles.emptyText}>
                Digite acima para registrar seu primeiro lançamento.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing['2xl'],
    gap: spacing['2xl'],
    paddingBottom: 120,
  },

  // Header
  header: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
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

  // Input card
  inputCard: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.md,
  },
  textInput: {
    ...(typography.body.lg as object),
    color: colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sendButton: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent.primary,
    borderRadius: radius.full,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },

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
  feedbackError: {
    borderColor: colors.semantic.expenseMuted,
  },
  feedbackText: {
    ...(typography.body.sm as object),
    color: colors.semantic.income,
    flex: 1,
  },
  feedbackTextError: {
    color: colors.semantic.expense,
  },

  // Recentes
  recentSection: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...(typography.heading.sm as object),
    color: colors.text.primary,
  },
  seeAll: {
    ...(typography.label.md as object),
    color: colors.accent.primary,
  },
  list: {
    gap: spacing.sm,
  },

  // Empty state
  emptyHint: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    ...(typography.body.md as object),
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
