import React, { useEffect } from 'react';
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
import { colors, typography, spacing } from '@presentation/theme/index';
import { BalanceCard } from '@presentation/components/dashboard/balance-card';
import { TopCategories } from '@presentation/components/dashboard/top-categories';
import { TransactionCard } from '@presentation/components/transaction/transaction-card';
import { SmartGreeting } from '@presentation/components/dashboard/smart-greeting';
import { HealthIndicator } from '@presentation/components/dashboard/health-indicator';
import { InsightCards } from '@presentation/components/dashboard/insight-cards';
import { ProfileProgressCard } from '@presentation/components/dashboard/profile-progress-card';
import { useDashboard } from '@features/dashboard/use-dashboard';

export function DashboardScreen() {
  const {
    currentDate,
    preferences,
    topCategories,
    recentTransactions,
    recent,
    getCategoryById,
    insights,
    onboardingCompleted,
    handleMonthChange,
    getPreviousMonth,
    getNextMonth,
    formatMonthYear,
  } = useDashboard();

  useEffect(() => {
    if (!onboardingCompleted) {
      const t = setTimeout(() => {
        router.push('/(modals)/onboarding-profile');
      }, 100);
      return () => clearTimeout(t);
    }
  }, [onboardingCompleted]);

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
