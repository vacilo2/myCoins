import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, typography, spacing } from '@theme/index';
import { usePreferencesStore } from '@store/preferences-store';
import { useSummary, useTopCategories } from '@hooks/use-summary';
import { useTransactions } from '@hooks/use-transactions';
import { BalanceCard } from '@/components/dashboard/balance-card';
import { TopCategories } from '@/components/dashboard/top-categories';
import { TransactionCard } from '@/components/transaction/transaction-card';
import { useCategoryStore } from '@store/category-store';
import { getPreviousMonth, getNextMonth, formatMonthYear } from '@utils/date';

export default function DashboardScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const preferences = usePreferencesStore((s) => s.preferences);
  const summary = useSummary(year, month);
  const topCategories = useTopCategories(year, month, 4);
  const recentTransactions = useTransactions({ month, year });
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);

  const recent = recentTransactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {preferences.name ? `Olá, ${preferences.name}` : 'Olá 👋'}
            </Text>
            <Text style={styles.subtitle}>Seu resumo financeiro</Text>
          </View>
        </View>

        {/* Navegação de mês */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={() => setCurrentDate(getPreviousMonth(currentDate))}
            hitSlop={12}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{formatMonthYear(currentDate)}</Text>
          <TouchableOpacity
            onPress={() => setCurrentDate(getNextMonth(currentDate))}
            hitSlop={12}
          >
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Card de saldo */}
        <BalanceCard
          balance={summary.balance}
          totalIncome={summary.totalIncome}
          totalExpense={summary.totalExpense}
          currentDate={currentDate}
          currency={preferences.currency}
        />

        {/* Top Categorias */}
        {topCategories.length > 0 && (
          <TopCategories categories={topCategories} currency={preferences.currency} />
        )}

        {/* Lançamentos recentes */}
        {recent.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recentes</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
                <Text style={styles.seeAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.list}>
              {recent.map((t) => (
                <TransactionCard
                  key={t.id}
                  transaction={t}
                  category={getCategoryById(t.categoryId)}
                  currency={preferences.currency}
                  onPress={() =>
                    router.push({ pathname: '/(modals)/edit-transaction', params: { id: t.id } })
                  }
                />
              ))}
            </View>
          </View>
        )}

        {recentTransactions.length === 0 && (
          <View style={styles.emptyHint}>
            <Text style={styles.emptyText}>Nenhum lançamento neste mês.</Text>
            <Text style={styles.emptyText}>Toque no + para adicionar.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scroll: { flex: 1 },
  content: {
    padding: spacing['2xl'],
    gap: spacing['2xl'],
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    ...typography.heading.xl,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body.md,
    color: colors.text.secondary,
    marginTop: 2,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  monthText: {
    ...typography.label.lg,
    color: colors.text.primary,
    textTransform: 'capitalize',
    minWidth: 140,
    textAlign: 'center',
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.heading.sm,
    color: colors.text.primary,
  },
  seeAll: {
    ...typography.label.md,
    color: colors.accent.primary,
  },
  list: {
    gap: spacing.sm,
  },
  emptyHint: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.xs,
  },
  emptyText: {
    ...typography.body.md,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
