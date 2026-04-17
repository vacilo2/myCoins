import React, { useState } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useTheme, typography, spacing, radius, Colors } from '@presentation/theme';
import { TransactionType, Transaction } from '@/types';
import { useTransactionStore } from '@store/transaction-store';
import { useCategoryStore } from '@store/category-store';
import { usePreferencesStore } from '@store/preferences-store';
import { Input } from '@presentation/ui/input';
import { CategoryIcon } from '@presentation/ui/category-icon';
import { Button } from '@presentation/ui/button';
import { DatePickerField } from '@presentation/ui/date-picker-field';
import { formatCurrency, parseCurrencyInput } from '@utils/currency';
import { toISODate } from '@utils/date';
import { isValidAmount } from '@utils/validators';
import { useUIStore } from '@store/ui-store';
import { useAuthStore } from '@store/auth-store';

interface TransactionFormProps {
  existing?: Transaction;
}

const INSTALLMENT_PRESETS = [2, 3, 6, 12, 18, 24];

export function TransactionForm({ existing }: TransactionFormProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const addTransaction    = useTransactionStore((s) => s.addTransaction);
  const addInstallments   = useTransactionStore((s) => s.addInstallments);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const deleteInstallmentGroup = useTransactionStore((s) => s.deleteInstallmentGroup);
  const getCategoriesByType = useCategoryStore((s) => s.getCategoriesByType);
  const currency = usePreferencesStore((s) => s.preferences.currency);
  const selectedMonth = useUIStore((s) => s.selectedMonth);
  const selectedYear  = useUIStore((s) => s.selectedYear);
  const authUser = useAuthStore((s) => s.user);

  function defaultDate() {
    if (existing) return existing.date.split('T')[0];
    const now = new Date();
    const day = now.getMonth() + 1 === selectedMonth && now.getFullYear() === selectedYear
      ? now.getDate()
      : 1;
    return toISODate(new Date(selectedYear, selectedMonth - 1, day));
  }

  const [type, setType]               = useState<TransactionType>(existing?.type ?? 'expense');
  const [amountText, setAmountText]   = useState(existing ? String(existing.amount) : '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [categoryId, setCategoryId]   = useState(existing?.categoryId ?? '');
  const [date, setDate]               = useState(defaultDate);
  const [error, setError]             = useState('');

  // Crédito / parcelamento
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>(
    existing?.paymentMethod ?? 'cash'
  );
  const [installments, setInstallments]       = useState(existing?.installmentTotal ?? 2);
  const [customInstallments, setCustomInstallments] = useState('');

  const isCredit   = type === 'expense' && paymentMethod === 'credit';
  const totalAmount = parseCurrencyInput(amountText);
  const installmentAmount = isCredit && isValidAmount(totalAmount) && installments > 0
    ? Math.round((totalAmount / installments) * 100) / 100
    : null;

  const categories = getCategoriesByType(type);

  function handleSave() {
    const amount = parseCurrencyInput(amountText);
    if (!isValidAmount(amount)) { setError('Informe um valor válido'); return; }
    if (!categoryId)             { setError('Selecione uma categoria'); return; }
    setError('');

    const userId = authUser?.id;

    if (existing) {
      updateTransaction(existing.id, { type, amount, categoryId, description, date }, userId);
    } else if (isCredit && installments > 1) {
      addInstallments({ totalAmount: amount, installments, categoryId, description, firstDate: date }, userId);
    } else {
      addTransaction({ type, amount, categoryId, description, date, paymentMethod }, userId);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  function handleDelete() {
    if (!existing) return;
    if (Platform.OS === 'web') {
      // Alert.alert não funciona corretamente na web
      // eslint-disable-next-line no-alert
      if (window.confirm('Excluir este lançamento?')) {
        deleteTransaction(existing.id);
        router.back();
      }
      return;
    }
    Alert.alert('Excluir lançamento', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteTransaction(existing.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.back();
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tipo */}
        <View style={styles.typeRow}>
          {(['expense', 'income'] as TransactionType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, type === t ? typeBtnActiveStyle(t) : undefined]}
              onPress={() => { setType(t); setCategoryId(''); }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={t === 'expense' ? 'arrow-up' : 'arrow-down'}
                size={16}
                color={
                  type === t
                    ? t === 'expense'
                      ? colors.semantic.expense
                      : colors.semantic.income
                    : colors.text.secondary
                }
              />
              <Text style={[styles.typeText, type === t ? typeTextActiveStyle(t) : undefined]}>
                {t === 'expense' ? 'Despesa' : 'Receita'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Valor */}
        <View style={styles.amountWrapper}>
          <Text style={styles.currencySymbol}>{currency === 'BRL' ? 'R$' : '$'}</Text>
          <TextInput
            value={amountText}
            onChangeText={setAmountText}
            placeholder="0,00"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="decimal-pad"
            style={styles.amountInput}
            returnKeyType="done"
          />
        </View>

        {/* Descrição */}
        <Input
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          placeholder="Ex: Almoço, Conta de luz..."
          maxLength={100}
        />

        {/* Data */}
        <DatePickerField
          label="Data"
          value={date}
          onChange={setDate}
        />

        {/* Pagamento — só para despesas e lançamentos novos */}
        {type === 'expense' && !existing && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Pagamento</Text>
            <View style={styles.paymentRow}>
              {(['cash', 'credit'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.paymentBtn, paymentMethod === m ? styles.paymentBtnActive : undefined]}
                  onPress={() => setPaymentMethod(m)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={m === 'cash' ? 'cash' : 'credit-card-outline'}
                    size={16}
                    color={paymentMethod === m ? colors.accent.primary : colors.text.secondary}
                  />
                  <Text style={[styles.paymentText, paymentMethod === m ? styles.paymentTextActive : undefined]}>
                    {m === 'cash' ? 'À vista' : 'Crédito'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Seletor de parcelas */}
            {isCredit && (
              <View style={styles.installmentsSection}>
                <Text style={styles.installmentsLabel}>Parcelas</Text>
                <View style={styles.presetsRow}>
                  {INSTALLMENT_PRESETS.map((n) => (
                    <TouchableOpacity
                      key={n}
                      style={[styles.presetBtn, installments === n ? styles.presetBtnActive : undefined]}
                      onPress={() => { setInstallments(n); setCustomInstallments(''); }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.presetText, installments === n ? styles.presetTextActive : undefined]}>
                        {n}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Campo customizado */}
                <View style={styles.customRow}>
                  <Text style={styles.customLabel}>Outro:</Text>
                  <TextInput
                    value={customInstallments}
                    onChangeText={(v) => {
                      setCustomInstallments(v);
                      const n = parseInt(v, 10);
                      if (!isNaN(n) && n >= 1 && n <= 120) setInstallments(n);
                    }}
                    placeholder="ex: 36"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="number-pad"
                    style={styles.customInput}
                    maxLength={3}
                  />
                </View>

                {/* Preview do valor da parcela */}
                {installmentAmount !== null && (
                  <View style={styles.previewCard}>
                    <MaterialCommunityIcons name="information-outline" size={14} color={colors.accent.primary} />
                    <Text style={styles.previewText}>
                      {installments}x de{' '}
                      <Text style={styles.previewAmount}>
                        {formatCurrency(installmentAmount, currency)}
                      </Text>
                      {' '}por mês
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Categorias */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Categoria</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catItem, categoryId === cat.id ? catItemActiveStyle(cat.color) : undefined]}
                onPress={() => setCategoryId(cat.id)}
                activeOpacity={0.75}
              >
                <CategoryIcon
                  icon={cat.icon}
                  size={20}
                  color={categoryId === cat.id ? cat.color : colors.text.secondary}
                />
                <Text
                  style={[styles.catName, categoryId === cat.id && { color: cat.color }]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label={existing ? 'Salvar alterações' : 'Adicionar'} onPress={handleSave} size="lg" />

        {existing && (
          <Button
            label="Excluir lançamento"
            variant="danger"
            onPress={handleDelete}
            size="md"
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Dynamic style helpers (cannot live inside StyleSheet.create with strict TS)
function typeBtnActiveStyle(t: TransactionType): ViewStyle {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return { backgroundColor: t === 'expense' ? colors.semantic.expenseMuted : colors.semantic.incomeMuted };
}
function typeTextActiveStyle(t: TransactionType): TextStyle {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return { color: t === 'expense' ? colors.semantic.expense : colors.semantic.income, fontWeight: '600' };
}
function catItemActiveStyle(color: string): ViewStyle {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return { backgroundColor: color + '22', borderColor: color + '55' };
}


function createStyles(c: Colors) {
    return StyleSheet.create({
    flex: { flex: 1 },
    content: {
      padding: spacing['2xl'],
      gap: spacing.lg,
      paddingBottom: spacing['4xl'],
    },
    typeRow: {
      flexDirection: 'row',
      backgroundColor: c.background.tertiary,
      borderRadius: radius.md,
      padding: spacing.xs,
      gap: spacing.xs,
    },
    typeBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderRadius: radius.sm,
      gap: spacing.xs,
    },
    typeText: {
      ...typography.label.lg,
      color: c.text.secondary,
    },
    amountWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    currencySymbol: {
      ...typography.heading.lg,
      color: c.text.secondary,
    },
    amountInput: {
      ...typography.display.md,
      color: c.text.primary,
      flex: 1,
      paddingVertical: spacing.sm,
      minHeight: 52,
    },
    section: {
      gap: spacing.sm,
    },
    sectionLabel: {
      ...typography.label.md,
      color: c.text.secondary,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    catItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: c.background.tertiary,
      borderRadius: radius.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: c.border.default,
    },
    catName: {
      ...typography.label.md,
      color: c.text.secondary,
    },
    error: {
      ...typography.body.sm,
      color: c.semantic.expense,
      textAlign: 'center',
    },
  
    // Pagamento
    paymentRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    paymentBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border.default,
      backgroundColor: c.background.tertiary,
    },
    paymentBtnActive: {
      borderColor: c.accent.primary,
      backgroundColor: c.accent.muted,
    },
    paymentText: {
      ...typography.label.md,
      color: c.text.secondary,
    },
    paymentTextActive: {
      color: c.accent.primary,
      fontWeight: '600',
    },
  
    // Parcelas
    installmentsSection: {
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    installmentsLabel: {
      ...typography.label.sm,
      color: c.text.tertiary,
    },
    presetsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    presetBtn: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: c.border.default,
      backgroundColor: c.background.tertiary,
    },
    presetBtnActive: {
      borderColor: c.accent.primary,
      backgroundColor: c.accent.muted,
    },
    presetText: {
      ...typography.label.md,
      color: c.text.secondary,
    },
    presetTextActive: {
      color: c.accent.primary,
      fontWeight: '600',
    },
    customRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    customLabel: {
      ...typography.label.md,
      color: c.text.secondary,
    },
    customInput: {
      ...typography.body.md,
      color: c.text.primary,
      backgroundColor: c.background.tertiary,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: c.border.default,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      width: 80,
    },
    previewCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: c.accent.muted,
      borderRadius: radius.sm,
      padding: spacing.md,
    },
    previewText: {
      ...typography.body.sm,
      color: c.text.secondary,
      flex: 1,
    },
    previewAmount: {
      color: c.accent.primary,
      fontWeight: '700',
    },
  });
}

