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
import { useTopCategories } from '@hooks/use-summary';
import { useTransactions } from '@hooks/use-transactions';
import { useFinancialInsights } from '@hooks/use-financial-insights';
import { BalanceCard } from '@/components/dashboard/balance-card';
import { TopCategories } from '@/components/dashboard/top-categories';
import { TransactionCard } from '@/components/transaction/transaction-card';
import { SmartGreeting } from '@/components/dashboard/smart-greeting';
import { HealthIndicator } from '@/components/dashboard/health-indicator';
import { InsightCards } from '@/components/dashboard/insight-cards';
import { ProfileProgressCard } from '@/components/dashboard/profile-progress-card';
import { useCategoryStore } from '@store/category-store';
import { getPreviousMonth, getNextMonth, formatMonthYear } from '@utils/date';
import { useUIStore } from '@store/ui-store';

export default function DashboardScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const setSelectedDate = useUIStore((s) => s.setSelectedDate);

  function handleMonthChange(date: Date) {
    setCurrentDate(date);
    setSelectedDate(date.getMonth() + 1, date.getFullYear());
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const preferences = usePreferencesStore((s) => s.preferences);
  const topCategories = useTopCategories(year, month, 4);
  const recentTransactions = useTransactions({ month, year });
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);
  const insights = useFinancialInsights(year, month);

  const recent = recentTransactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com saudação inteligente */}
        <View style={styles.header}>
          <SmartGreeting name={preferences.name} healthStatus={insights.healthStatus} />
        </View>

        {/* Card de progresso do perfil */}
        <ProfileProgressCard />

        {/* Navegação de mês */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={() => handleMonthChange(getPreviousMonth(currentDate))}
            hitSlop={12}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{formatMonthYear(currentDate)}</Text>
          <TouchableOpacity
            onPress={() => handleMonthChange(getNextMonth(currentDate))}
            hitSlop={12}
          >
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Card de saldo + indicador de saúde */}
        <View style={styles.balanceBlock}>
          <BalanceCard
            balance={insights.balance}
            totalIncome={insights.totalIncome}
            totalExpense={insights.totalExpense}
            currentDate={currentDate}
            currency={preferences.currency}
          />
          <View style={styles.healthRow}>
            <HealthIndicator status={insights.healthStatus} />
          </View>
        </View>

        {/* Cards de insight (orçamento, poupança, projeção) */}
        {insights.monthlyIncome > 0 && (
          <View style={styles.insightSection}>
            <InsightCards insights={insights} currency={preferences.currency} />
          </View>
        )}

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
    gap: 2,
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
  balanceBlock: {
    gap: spacing.sm,
  },
  healthRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xs,
  },
  insightSection: {
    marginHorizontal: -spacing['2xl'],
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
