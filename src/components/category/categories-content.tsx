import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, typography, spacing, radius } from '@theme/index';
import { TransactionType } from '@/types';
import { useCategoryStore } from '@store/category-store';
import { useTransactionStore } from '@store/transaction-store';
import { CategoryCard } from './category-card';
import { EmptyState } from '@ui/empty-state';

export function CategoriesContent() {
  const [tab, setTab] = useState<TransactionType>('expense');
  const allCategories = useCategoryStore((s) => s.categories);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);
  const transactions = useTransactionStore((s) => s.transactions);

  const categories = allCategories.filter((c) => c.type === tab || c.type === 'both');

  function getTransactionCount(categoryId: string) {
    return transactions.filter((t) => t.categoryId === categoryId).length;
  }

  function handleDelete(id: string, name: string) {
    Alert.alert(`Excluir "${name}"`, 'Tem certeza? Os lançamentos desta categoria não serão afetados.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteCategory(id) },
    ]);
  }

  return (
    <>
      <View style={styles.tabs}>
        {(['expense', 'income'] as TransactionType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'expense' ? 'Despesas' : 'Receitas'}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => router.push('/(modals)/new-category')}
          hitSlop={8}
        >
          <MaterialCommunityIcons name="plus" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {categories.length === 0 ? (
          <EmptyState
            icon={<MaterialCommunityIcons name="tag-outline" size={40} color={colors.text.tertiary} />}
            title="Nenhuma categoria"
            description="Crie categorias para organizar seus lançamentos"
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
    </>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing['2xl'],
    marginBottom: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.background.tertiary,
  },
  tabText: {
    ...typography.label.md,
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.text.primary,
  },
  list: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 100,
  },
});
