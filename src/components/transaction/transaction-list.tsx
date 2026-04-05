import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Transaction } from '@/types';
import { useCategoryStore } from '@store/category-store';
import { TransactionCard } from './transaction-card';
import { EmptyState } from '@ui/empty-state';
import { colors, typography, spacing } from '@theme/index';
import { formatDate } from '@utils/date';

interface TransactionListProps {
  transactions: Transaction[];
  currency?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

interface GroupedTransactions {
  date: string;
  items: Transaction[];
}

function groupByDate(transactions: Transaction[]): GroupedTransactions[] {
  const map = new Map<string, Transaction[]>();
  transactions.forEach((t) => {
    const key = t.date.split('T')[0];
    const existing = map.get(key) ?? [];
    map.set(key, [...existing, t]);
  });

  return Array.from(map.entries())
    .map(([date, items]) => ({ date, items }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function TransactionList({
  transactions,
  currency = 'BRL',
  onRefresh,
  refreshing,
}: TransactionListProps) {
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);
  const grouped = groupByDate(transactions);

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<MaterialCommunityIcons name="cash-remove" size={48} color={colors.text.tertiary} />}
        title="Nenhum lançamento"
        description="Adicione sua primeira receita ou despesa tocando no botão +"
      />
    );
  }

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.date}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
          />
        ) : undefined
      }
      renderItem={({ item }) => (
        <View style={styles.group}>
          <Text style={styles.dateHeader}>{formatDate(item.date, 'EEEE, dd MMM')}</Text>
          <View style={styles.items}>
            {item.items.map((t) => (
              <TransactionCard
                key={t.id}
                transaction={t}
                category={getCategoryById(t.categoryId)}
                currency={currency}
                onPress={() =>
                  router.push({ pathname: '/(modals)/edit-transaction', params: { id: t.id } })
                }
              />
            ))}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 100,
    gap: spacing['2xl'],
  },
  group: {
    gap: spacing.sm,
  },
  dateHeader: {
    ...typography.label.md,
    color: colors.text.tertiary,
    textTransform: 'capitalize',
    paddingHorizontal: spacing.xs,
  },
  items: {
    gap: spacing.sm,
  },
});
