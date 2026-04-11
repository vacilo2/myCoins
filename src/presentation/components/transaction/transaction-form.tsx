import React, { useState } from 'react';
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
import { colors, typography, spacing, radius } from '@presentation/theme/index';
import { TransactionType, Transaction } from '@/types';
import { useTransactionStore } from '@store/transaction-store';
import { useCategoryStore } from '@store/category-store';
import { usePreferencesStore } from '@store/preferences-store';
import { Input } from '@presentation/ui/input';
import { Button } from '@presentation/ui/button';
import { DatePickerField } from '@presentation/ui/date-picker-field';
import { formatCurrency, parseCurrencyInput } from '@utils/currency';
import { toISODate } from '@utils/date';
import { isValidAmount } from '@utils/validators';
import { useUIStore } from '@store/ui-store';

interface TransactionFormProps {
  existing?: Transaction;
}

export function TransactionForm({ existing }: TransactionFormProps) {
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const getCategoriesByType = useCategoryStore((s) => s.getCategoriesByType);
  const currency = usePreferencesStore((s) => s.preferences.currency);
  const selectedMonth = useUIStore((s) => s.selectedMonth);
  const selectedYear = useUIStore((s) => s.selectedYear);

  function defaultDate() {
    if (existing) return existing.date.split('T')[0];
    const now = new Date();
    const day = now.getMonth() + 1 === selectedMonth && now.getFullYear() === selectedYear
      ? now.getDate()
      : 1;
    return toISODate(new Date(selectedYear, selectedMonth - 1, day));
  }

  const [type, setType] = useState<TransactionType>(existing?.type ?? 'expense');
  const [amountText, setAmountText] = useState(existing ? String(existing.amount) : '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [date, setDate] = useState(defaultDate);
  const [error, setError] = useState('');

  const categories = getCategoriesByType(type);

  function handleSave() {
    const amount = parseCurrencyInput(amountText);
    if (!isValidAmount(amount)) {
      setError('Informe um valor válido');
      return;
    }
    if (!categoryId) {
      setError('Selecione uma categoria');
      return;
    }
    setError('');

    if (existing) {
      updateTransaction(existing.id, { type, amount, categoryId, description, date });
    } else {
      addTransaction({ type, amount, categoryId, description, date });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  function handleDelete() {
    if (!existing) return;
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
              style={[styles.typeBtn, type === t && styles.typeBtnActive(t)]}
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
              <Text style={[styles.typeText, type === t && styles.typeTextActive(t)]}>
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

        {/* Categorias */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Categoria</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catItem, categoryId === cat.id && styles.catItemActive(cat.color)]}
                onPress={() => setCategoryId(cat.id)}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name={cat.icon as any}
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: spacing['2xl'],
    gap: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  typeRow: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
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
  typeBtnActive: (type: TransactionType) => ({
    backgroundColor:
      type === 'expense' ? colors.semantic.expenseMuted : colors.semantic.incomeMuted,
  }),
  typeText: {
    ...typography.label.lg,
    color: colors.text.secondary,
  },
  typeTextActive: (type: TransactionType) => ({
    color: type === 'expense' ? colors.semantic.expense : colors.semantic.income,
    fontWeight: '600',
  }),
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currencySymbol: {
    ...typography.heading.lg,
    color: colors.text.secondary,
  },
  amountInput: {
    ...typography.display.md,
    color: colors.text.primary,
    flex: 1,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.label.md,
    color: colors.text.secondary,
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
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  catItemActive: (color: string) => ({
    backgroundColor: color + '22',
    borderColor: color + '55',
  }),
  catName: {
    ...typography.label.md,
    color: colors.text.secondary,
  },
  error: {
    ...typography.body.sm,
    color: colors.semantic.expense,
    textAlign: 'center',
  },
});
