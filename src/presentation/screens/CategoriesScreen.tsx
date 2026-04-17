import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme, typography, spacing, Colors } from '@presentation/theme';
import { TransactionType } from '@/types';
import { useCategoryStore } from '@store/category-store';
import { useTransactionStore } from '@store/transaction-store';
import { CategoryCard } from '@presentation/components/category/category-card';
import { ScreenHeader } from '@presentation/layouts/screen-header';
import { EmptyState } from '@presentation/ui/empty-state';

export function CategoriesScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
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


function createStyles(c: Colors) {
    return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background.primary },
    tabs: {
      flexDirection: 'row',
      marginHorizontal: spacing['2xl'],
      marginBottom: spacing.md,
      backgroundColor: c.background.tertiary,
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
      backgroundColor: c.background.secondary,
    },
    tabText: {
      ...typography.label.md,
      color: c.text.tertiary,
    },
    tabTextActive: {
      color: c.text.primary,
      fontWeight: '600',
    },
    list: {
      paddingHorizontal: spacing['2xl'],
      gap: spacing.sm,
      paddingBottom: 100,
    },
  });
}

