import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@theme/index';
import { Category } from '@/types';
import { CategoryIcon } from '@ui/category-icon';

interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
  onDelete?: () => void;
  transactionCount?: number;
}

export function CategoryCard({ category, onPress, onDelete, transactionCount }: CategoryCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.iconWrapper, { backgroundColor: category.color + '15' }]}>
        <CategoryIcon icon={category.icon} size={18} color={category.color} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.type}>
          {category.type === 'income' ? 'Receita' : category.type === 'expense' ? 'Despesa' : 'Ambos'}
          {transactionCount !== undefined && ` · ${transactionCount}`}
        </Text>
      </View>

      {!category.isDefault && onDelete && (
        <TouchableOpacity onPress={onDelete} hitSlop={8}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.text.tertiary} />
        </TouchableOpacity>
      )}

      {onPress && (
        <MaterialCommunityIcons name="chevron-right" size={16} color={colors.text.tertiary} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
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
  },
  type: {
    ...typography.label.sm,
    color: colors.text.tertiary,
  },
});
