import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@presentation/theme/index';
import { TransactionType } from '@/types';
import { useTransactions } from '@features/transacoes/use-transactions';
import { usePreferencesStore } from '@store/preferences-store';
import { TransactionList } from '@presentation/components/transaction/transaction-list';
import { ScreenHeader } from '@presentation/layouts/screen-header';
import { Badge } from '@presentation/ui/badge';
import { TouchableOpacity } from 'react-native';

export function TransactionsScreen() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>();
  const currency = usePreferencesStore((s) => s.preferences.currency);

  const transactions = useTransactions({
    search: search || undefined,
    type: typeFilter,
  });

  const filters: { label: string; value: TransactionType | undefined }[] = [
    { label: 'Todos', value: undefined },
    { label: 'Receitas', value: 'income' },
    { label: 'Despesas', value: 'expense' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Lançamentos" subtitle={`${transactions.length} registros`} />

      {/* Busca */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lançamento..."
            placeholderTextColor={colors.text.tertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={String(f.value)}
            style={[styles.filterBtn, typeFilter === f.value && styles.filterBtnActive]}
            onPress={() => setTypeFilter(f.value)}
            activeOpacity={0.75}
          >
            <Badge
              label={f.label}
              variant={
                f.value === 'income' ? 'income' : f.value === 'expense' ? 'expense' : undefined
              }
              size="md"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <View style={styles.list}>
        <TransactionList transactions={transactions} currency={currency} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  searchWrapper: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    height: 48,
  },
  searchInput: {
    flex: 1,
    ...typography.body.md,
    color: colors.text.primary,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  filterBtn: {
    opacity: 0.5,
  },
  filterBtnActive: {
    opacity: 1,
  },
  list: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
  },
});
