import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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
  Image,
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
// Pool completo de dicas — exibidas aleatoriamente a cada abertura
// ---------------------------------------------------------------------------
type TipCategory = {
  id: string;
  label: string;
  icon: string;
  color: string;
  pool: string[];  // todos os exemplos disponíveis
};

const TIP_POOL: TipCategory[] = [
  {
    id: 'expense',
    label: 'Despesas',
    icon: 'arrow-up-circle-outline',
    color: colors.semantic.expense,
    pool: [
      'gastei 45 reais com almoço',
      'paguei 120 de farmácia',
      'comprei roupa por 200 reais',
      'saiu 80 reais de gasolina',
      'paguei 150 de academia',
      'gastei 35 com lanche',
      'paguei 250 de conta de luz',
      'saiu 90 de uber',
      'gastei 60 com mercado',
      'paguei 180 de internet',
      'gastei 40 com café da manhã',
      'paguei 300 de aluguel',
      'saiu 55 de farmácia',
      'gastei 70 com pizza',
      'paguei 200 de plano de saúde',
      'saiu 150 de condomínio',
      'gastei 25 com estacionamento',
      'paguei 100 de dentista',
      'gastei 80 com livro',
      'saiu 45 de pedágio',
    ],
  },
  {
    id: 'income',
    label: 'Receitas',
    icon: 'arrow-down-circle-outline',
    color: colors.semantic.income,
    pool: [
      'recebi 3000 de salário',
      'ganhei 500 de freela',
      'entrou 200 de dividendos',
      'recebi 150 de freelance',
      'ganhei 800 de projeto',
      'entrou 1200 de bônus',
      'recebi 400 de aluguel',
      'ganhei 250 de venda',
      'entrou 600 de consultoria',
      'recebi 100 de cashback',
      'ganhei 2500 de salário',
      'entrou 350 de rendimentos',
      'recebi 180 de reembolso',
      'ganhei 700 de comissão',
      'entrou 450 de investimento',
    ],
  },
  {
    id: 'credit',
    label: 'Crédito',
    icon: 'credit-card-outline',
    color: colors.accent.primary,
    pool: [
      'gastei 1200 no crédito em 12x',
      'comprei notebook 3600 dividi em 24x',
      'parcelei 800 em 6 vezes',
      'gastei 500 no cartão em 3x',
      'comprei celular 2400 em 12x',
      'parcelei 1500 em 10 vezes',
      'gastei 900 no crédito em 9x',
      'comprei geladeira 2800 dividi em 18x',
      'parcelei 600 em 4 vezes',
      'gastei 3000 no cartão em 24x',
      'comprei TV 1800 em 12x',
      'parcelei 400 em 2 vezes',
    ],
  },
];

// Seleciona N itens aleatórios de um array sem repetição
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

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
// Mascote — sprites por estado
// ---------------------------------------------------------------------------
type MascotState = 'idle' | 'typing' | 'success' | 'error';

const MASCOT_IMAGES: Record<MascotState, number> = {
  idle:    require('../../../assets/images/mascot-idle.png'),
  typing:  require('../../../assets/images/mascot-typing.png'),
  success: require('../../../assets/images/mascot-success.png'),
  error:   require('../../../assets/images/mascot-error.png'),
};

const MASCOT_BUBBLE_TEXT: Record<MascotState, string | null> = {
  idle:    null, // usa a mensagem aleatória
  typing:  'Entendendo o que você digitou...',
  success: 'Lançamento registrado!',
  error:   'Não entendi. Tente outro formato.',
};

function MascotBubble({ mascotState, idleMessage }: { mascotState: MascotState; idleMessage: string }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const loopRef    = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    loopRef.current?.stop();
    Animated.timing(translateX, { toValue: 0, duration: 100, useNativeDriver: true }).start();

    if (mascotState === 'typing') {
      // Bounce contínuo para cima/baixo
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0,  duration: 300, useNativeDriver: true }),
        ])
      );
      loopRef.current.start();
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 150, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,    duration: 150, useNativeDriver: true }),
      ]).start();

    } else if (mascotState === 'success') {
      // Jump + scale up
      Animated.sequence([
        Animated.timing(scale,      { toValue: 1.2,  duration: 120, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -12,  duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0,    duration: 250, useNativeDriver: true }),
        Animated.timing(scale,      { toValue: 1,    duration: 150, useNativeDriver: true }),
      ]).start();

    } else if (mascotState === 'error') {
      // Shake lateral
      Animated.sequence([
        Animated.timing(translateX, { toValue:  10, duration: 60, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(translateX, { toValue:  8,  duration: 60, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -8,  duration: 60, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 0,   duration: 60, useNativeDriver: true }),
      ]).start();

    } else {
      // Idle — float suave
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, { toValue: -3, duration: 1200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0,  duration: 1200, useNativeDriver: true }),
        ])
      );
      loopRef.current.start();
    }

    return () => loopRef.current?.stop();
  }, [mascotState]);

  const isTyping  = mascotState === 'typing';
  const bubbleMsg = MASCOT_BUBBLE_TEXT[mascotState] ?? idleMessage;

  return (
    <View style={tipStyles.mascotArea}>
      <Animated.View
        style={[
          tipStyles.mascotAvatar,
          (mascotState === 'typing' || mascotState === 'success') && tipStyles.mascotAvatarActive,
          { transform: [{ translateY }, { translateX }, { scale }] },
        ]}
      >
        <Image
          source={MASCOT_IMAGES[mascotState]}
          style={tipStyles.mascotImage}
          resizeMode="contain"
        />
      </Animated.View>

      <View style={[
        tipStyles.mascotBubble,
        isTyping  && tipStyles.mascotBubbleTyping,
        mascotState === 'success' && tipStyles.mascotBubbleSuccess,
        mascotState === 'error'   && tipStyles.mascotBubbleError,
      ]}>
        <Text style={[
          tipStyles.mascotText,
          mascotState === 'success' && { color: colors.semantic.income },
          mascotState === 'error'   && { color: colors.semantic.expense },
        ]}>
          {bubbleMsg}
        </Text>
        {isTyping && (
          <View style={tipStyles.dotsRow}>
            {[0, 1, 2].map(i => <TypingDot key={i} delay={i * 150} />)}
          </View>
        )}
      </View>
    </View>
  );
}

function TypingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1,   duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return <Animated.View style={[tipStyles.dot, { opacity: anim }]} />;
}

// ---------------------------------------------------------------------------
// Seção de dicas
// ---------------------------------------------------------------------------
function TipsSection({
  onSelectTip,
  visible,
  onToggleVisible,
  randomTips,
}: {
  onSelectTip: (tip: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  randomTips: Record<string, string[]>;
}) {
  const [activeTab, setActiveTab] = useState('expense');
  const active    = TIP_POOL.find(c => c.id === activeTab)!;
  const shownTips = randomTips[activeTab] ?? [];

  return (
    <View style={tipStyles.sectionContainer}>
      {/* Cabeçalho com toggle */}
      <View style={tipStyles.sectionHeader}>
        <Text style={tipStyles.sectionTitle}>Dicas de frases</Text>
        <TouchableOpacity onPress={onToggleVisible} activeOpacity={0.7} style={tipStyles.toggleBtn}>
          <MaterialCommunityIcons
            name={visible ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.text.tertiary}
          />
          <Text style={tipStyles.toggleText}>{visible ? 'Ocultar' : 'Mostrar'}</Text>
        </TouchableOpacity>
      </View>

      {visible && (
        <>
          {/* Abas */}
          <View style={tipStyles.tabs}>
            {TIP_POOL.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[tipStyles.tab, activeTab === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '18' }]}
                onPress={() => setActiveTab(cat.id)}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={13}
                  color={activeTab === cat.id ? cat.color : colors.text.tertiary}
                />
                <Text style={[tipStyles.tabText, activeTab === cat.id && { color: cat.color }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chips */}
          <View style={tipStyles.chips}>
            {shownTips.map((tip, i) => (
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
        </>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tela principal
// ---------------------------------------------------------------------------
export function HomeScreen() {
  const [inputText, setInputText]       = useState('');
  const [feedback, setFeedback]         = useState<{ message: string; isError: boolean } | null>(null);
  const [tipsVisible, setTipsVisible]   = useState(true);
  const [mascotState, setMascotState]   = useState<MascotState>('idle');
  const feedbackOpacity                 = useRef(new Animated.Value(0)).current;
  const inputRef                        = useRef<TextInput>(null);
  const mascotTimerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincroniza mascote com o input (exceto quando em success/error temporário)
  useEffect(() => {
    if (mascotState === 'success' || mascotState === 'error') return;
    setMascotState(inputText.trim().length > 0 ? 'typing' : 'idle');
  }, [inputText]);

  const setTemporaryMascotState = useCallback((state: 'success' | 'error') => {
    if (mascotTimerRef.current) clearTimeout(mascotTimerRef.current);
    setMascotState(state);
    mascotTimerRef.current = setTimeout(() => setMascotState('idle'), 2500);
  }, []);

  // Sorteia dicas uma vez por abertura da tela
  const randomTips = useMemo(() => {
    const result: Record<string, string[]> = {};
    TIP_POOL.forEach(cat => { result[cat.id] = pickRandom(cat.pool, 5); });
    return result;
  }, []);

  const addTransaction    = useTransactionStore(s => s.addTransaction);
  const addInstallments   = useTransactionStore(s => s.addInstallments);
  const transactions      = useTransactionStore(s => s.transactions);
  const txSyncError       = useTransactionStore(s => s.syncError);
  const clearTxSyncError  = useTransactionStore(s => s.clearSyncError);
  const authUser          = useAuthStore(s => s.user);
  const categories        = useCategoryStore(s => s.categories);
  const getCategoryById   = useCategoryStore(s => s.getCategoryById);
  const isStoreReady      = useCategoryStore(s => s.isHydrated);
  const preferences       = usePreferencesStore(s => s.preferences);

  // Exibe erro de sync como feedback temporário
  useEffect(() => {
    if (txSyncError) {
      showFeedback(txSyncError, true);
      clearTxSyncError();
    }
  }, [txSyncError]);

  const recentThree = transactions.slice(0, 3);

  const findCategoryId = useCallback(
    (categoryName: string, type: 'income' | 'expense'): string => {
      const target = normStr(categoryName);
      const exact  = categories.find(c => normStr(c.name) === target && (c.type === type || c.type === 'both'));
      if (exact) return exact.id;
      const outros = categories.find(c => normStr(c.name) === 'outros' && (c.type === type || c.type === 'both'));
      return outros?.id ?? categories[0]?.id ?? 'unknown';
    },
    [categories],
  );

  const findCategoryByText = useCallback(
    (text: string, type: 'income' | 'expense'): { id: string; name: string } | null => {
      const normText   = normStr(text);
      const compatible = categories.filter(c => c.type === type || c.type === 'both');
      const sorted     = [...compatible].sort((a, b) => b.name.length - a.name.length);
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
      setTemporaryMascotState('error');
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
      setTemporaryMascotState('success');
      const parcelValue = Math.round((result.amount / result.installments) * 100) / 100;
      showFeedback(`${result.installments}x de ${formatCurrency(parcelValue, preferences.currency || 'BRL')} em ${categoryName}`, false);
      return;
    }

    addTransaction({ type: result.type, amount: result.amount, categoryId, description: result.description, date: toISODate(new Date()), paymentMethod: result.paymentMethod }, userId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setInputText('');
    setTemporaryMascotState('success');

    const typeLabel    = result.type === 'expense' ? 'Despesa' : 'Receita';
    const creditSuffix = result.paymentMethod === 'credit' ? ' · Crédito' : '';
    showFeedback(`${typeLabel} de ${formatCurrency(result.amount, preferences.currency || 'BRL')} em ${categoryName}${creditSuffix}`, false);
  }, [inputText, addTransaction, addInstallments, findCategoryId, findCategoryByText, showFeedback, setTemporaryMascotState, preferences.currency, authUser?.id]);

  const handleSelectTip = useCallback((tip: string) => {
    setInputText(tip);
    inputRef.current?.focus();
    Haptics.selectionAsync?.();
  }, []);

  const hasText   = inputText.trim().length > 0;
  const canSubmit = hasText && isStoreReady;

  // Mensagem do mascote quando não está digitando
  const mascotIdleMessage = useMemo(() => {
    const messages = [
      'Toque em uma dica ou escreva do seu jeito!',
      'Me conta o que gastou hoje?',
      'Registre um lançamento para começar!',
      'Dica: você pode parcelar no crédito também!',
      'Controle seu dinheiro frase por frase 💪',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

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

          {/* 2. Mascote */}
          <MascotBubble mascotState={mascotState} idleMessage={mascotIdleMessage} />

          {/* 3. Input compacto */}
          <View style={[styles.inputRow, hasText && styles.inputRowActive]}>
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

          {/* 4. Feedback */}
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

          {/* 5. Dicas */}
          <TipsSection
            onSelectTip={handleSelectTip}
            visible={tipsVisible}
            onToggleVisible={() => setTipsVisible(v => !v)}
            randomTips={randomTips}
          />

          {/* 6. Recentes */}
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
              <Text style={styles.emptyText}>Toque em uma dica ou escreva para registrar seu primeiro lançamento.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles — Mascote + Dicas
// ---------------------------------------------------------------------------
const tipStyles = StyleSheet.create({
  // Mascote
  mascotArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mascotAvatar: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotAvatarActive: {
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  mascotImage: {
    width: 58,
    height: 58,
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
  mascotBubbleTyping: {
    borderColor: colors.accent.primary + '55',
    backgroundColor: colors.accent.muted,
  },
  mascotBubbleSuccess: {
    borderColor: colors.semantic.income + '55',
    backgroundColor: colors.semantic.incomeMuted,
  },
  mascotBubbleError: {
    borderColor: colors.semantic.expense + '55',
    backgroundColor: colors.semantic.expenseMuted,
  },
  mascotText: {
    ...(typography.body.sm as object),
    color: colors.text.secondary,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent.primary,
  },

  // Seção de dicas
  sectionContainer: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...(typography.label.md as object),
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  toggleText: {
    ...(typography.label.sm as object),
    color: colors.text.tertiary,
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

  // Input
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
  inputRowActive: {
    borderColor: colors.accent.primary + '88',
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
