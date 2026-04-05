import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, typography, spacing } from '@theme/index';
import { TransactionType } from '@/types';
import { useCategoryStore } from '@store/category-store';
import { useTransactionStore } from '@store/transaction-store';
import { CategoryCard } from '@/components/category/category-card';
import { ScreenHeader } from '@/components/layout/screen-header';
import { EmptyState } from '@ui/empty-state';

export default function CategoriesScreen() {
  const [tab, setTab] = useState<TransactionType>('expense');
  const categories = useCategoryStore((s) => s.getCategoriesByType(tab));
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);
  const transactions = useTransactionStore((s) => s.transactions);

  function getTransactionCount(categoryId: string) {
    return transactions.filter((t) => t.categoryId === categoryId).length;
  }

  function handleDelete(id: string, name: string) {
    Alert.alert(`Excluir "${name}"`, 'Tem certeza? Os lançamentos desta categoria não serão afetados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => deleteCategory(id),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Categorias"
        rightAction={{
          icon: 'plus',
          onPress: () => router.push('/(modals)/new-category'),
        }}
      />

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['expense', 'income'] as TransactionType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'expense' ? 'Despesas' : 'Receitas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {categories.length === 0 ? (
          <EmptyState
            icon={<MaterialCommunityIcons name="tag-outline" size={48} color={colors.text.tertiary} />}
            title="Nenhuma categoria"
            description="Crie categorias para organizar melhor seus lançamentos"
            actionLabel="Nova categoria"
            onAction={() => router.push('/(modals)/new-category')}
          />
        ) : (
          categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              transactionCount={getTransactionCount(cat.id)}
              onPress={() =>
                router.push({ pathname: '/(modals)/edit-category', params: { id: cat.id } })
              }
              onDelete={cat.isDefault ? undefined : () => handleDelete(cat.id, cat.name)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.primary },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.background.secondary,
  },
  tabText: {
    ...typography.label.md,
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: spacing['2xl'],
    gap: spacing.sm,
    paddingBottom: 100,
  },
});
