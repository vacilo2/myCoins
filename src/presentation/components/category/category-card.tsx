import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@presentation/theme/index';
import { Category } from '@/types';
import { CategoryIcon } from '@presentation/ui/category-icon';

interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
  onDelete?: () => void;
  transactionCount?: number;
}

export function CategoryCard({ category, onPress, onDelete, transactionCount }: CategoryCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconWrapper, { backgroundColor: category.color + '22' }]}>
        <CategoryIcon icon={category.icon} size={22} color={category.color} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.type}>
          {category.type === 'income' ? 'Receita' : category.type === 'expense' ? 'Despesa' : 'Ambos'}
          {transactionCount !== undefined && ` · ${transactionCount} lançamentos`}
        </Text>
      </View>

      {!category.isDefault && onDelete && (
        <TouchableOpacity onPress={onDelete} hitSlop={8}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      )}

      {onPress && (
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.text.tertiary} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.body.md,
    color: colors.text.primary,
    fontWeight: '500',
  },
  type: {
    ...typography.label.sm,
    color: colors.text.tertiary,
  },
});
