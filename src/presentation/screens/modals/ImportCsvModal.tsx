import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '@presentation/theme/index';
import { ParseResult, buildExistingDedupKeys } from '@services/csv-import';
import { useTransactionStore } from '@store/transaction-store';
import { useCategoryStore } from '@store/category-store';
import { usePreferencesStore } from '@store/preferences-store';
import { StepFilePick } from '@presentation/components/csv-import/StepFilePick';
import { StepReview } from '@presentation/components/csv-import/StepReview';
import { StepResult } from '@presentation/components/csv-import/StepResult';

type Step = 0 | 1 | 2;

interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
}

const STEP_TITLES: Record<Step, string> = {
  0: 'Importar extrato',
  1: 'Revisar lançamentos',
  2: 'Resultado',
};

export function ImportCsvModal() {
  const [step, setStep] = useState<Step>(0);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importResult, setImportResult] = useState<ImportResult>({ imported: 0, skipped: 0, errors: 0 });

  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const currency = usePreferencesStore((s) => s.preferences.currency);

  function getDefaultCategoryId(): string {
    const outros = categories.find(
      (c) => c.name.toLowerCase().includes('outros') || c.name.toLowerCase().includes('other')
    );
    return outros?.id ?? (categories[0]?.id ?? '');
  }

  function handlePicked(result: ParseResult) {
    setParseResult(result);

    // Auto-select all valid rows, excluding duplicates
    const existingKeys = buildExistingDedupKeys(transactions);
    const initialSelected = new Set<string>();
    for (const row of result.rows) {
      if (!row.error && !existingKeys.has(row.dedupKey)) {
        initialSelected.add(row.dedupKey);
      }
    }

    setSelected(initialSelected);
    setStep(1);
  }

  function handleError(msg: string) {
    Alert.alert('Erro ao importar', msg);
  }

  function handleToggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleSelectAll() {
    if (!parseResult) return;
    const existingKeys = buildExistingDedupKeys(transactions);
    const all = new Set<string>();
    for (const row of parseResult.rows) {
      if (!row.error && !existingKeys.has(row.dedupKey)) {
        all.add(row.dedupKey);
      }
    }
    setSelected(all);
  }

  function handleDeselectAll() {
    setSelected(new Set());
  }

  const handleConfirm = useCallback(() => {
    if (!parseResult) return;

    const existingKeys = buildExistingDedupKeys(transactions);
    const defaultCategoryId = getDefaultCategoryId();

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of parseResult.rows) {
      if (row.error) {
        errors++;
        continue;
      }
      if (!selected.has(row.dedupKey)) {
        skipped++;
        continue;
      }
      if (existingKeys.has(row.dedupKey)) {
        skipped++;
        continue;
      }

      addTransaction({
        type: row.type,
        amount: row.amount,
        description: row.description,
        date: row.date,
        categoryId: defaultCategoryId,
      });
      imported++;
    }

    if (imported > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setImportResult({ imported, skipped, errors });
    setStep(2);
  }, [parseResult, selected, transactions, categories]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {step > 0 && step < 2 ? (
          <TouchableOpacity onPress={() => setStep((step - 1) as Step)} hitSlop={8}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <Text style={styles.title}>{STEP_TITLES[step]}</Text>

        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Steps */}
      {step === 0 && (
        <StepFilePick onPicked={handlePicked} onError={handleError} />
      )}

      {step === 1 && parseResult && (
        <StepReview
          filename={parseResult.filename}
          rows={parseResult.rows}
          selected={selected}
          onToggle={handleToggle}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onConfirm={handleConfirm}
          currency={currency}
        />
      )}

      {step === 2 && (
        <StepResult result={importResult} onClose={() => router.back()} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  title: { ...typography.heading.md, color: colors.text.primary },
  placeholder: { width: 24 },
});
