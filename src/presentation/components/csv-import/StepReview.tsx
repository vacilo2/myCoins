import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@presentation/theme/index';
import { Button } from '@presentation/ui/button';
import { ParsedRow } from '@services/csv-import';
import { ReviewRowCard } from './ReviewRowCard';

interface StepReviewProps {
  filename: string;
  rows: ParsedRow[];
  selected: Set<string>;
  onToggle: (key: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onConfirm: () => void;
  currency: string;
}

export function StepReview({
  filename,
  rows,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onConfirm,
  currency,
}: StepReviewProps) {
  const validRows = rows.filter((r) => !r.error);
  const errorRows = rows.filter((r) => !!r.error);
  const selectedCount = selected.size;
  const allSelected = validRows.length > 0 && selectedCount === validRows.length;

  return (
    <View style={styles.container}>
      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{rows.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.accent.primary }]}>{validRows.length}</Text>
          <Text style={styles.statLabel}>Válidos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.semantic.expense }]}>{errorRows.length}</Text>
          <Text style={styles.statLabel}>Com erro</Text>
        </View>
      </View>

      {/* File name */}
      <View style={styles.filenameRow}>
        <MaterialCommunityIcons name="file-delimited-outline" size={16} color={colors.text.tertiary} />
        <Text style={styles.filename} numberOfLines={1}>{filename}</Text>
      </View>

      {/* Select all / none */}
      <View style={styles.selectRow}>
        <Text style={styles.selectLabel}>
          {selectedCount} de {validRows.length} selecionados
        </Text>
        <TouchableOpacity onPress={allSelected ? onDeselectAll : onSelectAll} hitSlop={8}>
          <Text style={styles.selectAction}>{allSelected ? 'Desmarcar todos' : 'Selecionar todos'}</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={rows}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <ReviewRowCard
            row={item}
            selected={selected.has(item.dedupKey)}
            onToggle={() => onToggle(item.dedupKey)}
            currency={currency}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Confirm button */}
      <View style={styles.footer}>
        <Button
          label={selectedCount > 0 ? `Importar ${selectedCount} lançamento${selectedCount !== 1 ? 's' : ''}` : 'Nenhum selecionado'}
          onPress={onConfirm}
          size="lg"
          disabled={selectedCount === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    marginHorizontal: spacing['2xl'],
    marginTop: spacing.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { ...typography.heading.md, color: colors.text.primary },
  statLabel: { ...typography.label.sm, color: colors.text.tertiary },
  statDivider: { width: 1, backgroundColor: colors.border.subtle, marginVertical: 4 },
  filenameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing.md,
  },
  filename: {
    ...typography.label.sm,
    color: colors.text.tertiary,
    flex: 1,
  },
  selectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  selectLabel: { ...typography.label.md, color: colors.text.secondary },
  selectAction: { ...typography.label.md, color: colors.accent.primary },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
  },
  separator: { height: spacing.sm },
  footer: {
    padding: spacing['2xl'],
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
});
