import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@presentation/theme/index';
import { Button } from '@presentation/ui/button';

interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
}

interface StepResultProps {
  result: ImportResult;
  onClose: () => void;
}

export function StepResult({ result, onClose }: StepResultProps) {
  const { imported, skipped, errors } = result;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons
          name={imported > 0 ? 'check-circle' : 'information'}
          size={64}
          color={imported > 0 ? colors.accent.primary : colors.text.tertiary}
        />
      </View>

      <Text style={styles.title}>
        {imported > 0 ? 'Importação concluída!' : 'Nenhum lançamento novo'}
      </Text>

      <Text style={styles.subtitle}>
        {imported > 0
          ? `${imported} lançamento${imported !== 1 ? 's' : ''} adicionado${imported !== 1 ? 's' : ''} com sucesso.`
          : 'Todos os lançamentos selecionados já existem ou foram ignorados.'}
      </Text>

      <View style={styles.cards}>
        <ResultCard
          icon="check-circle-outline"
          color={colors.semantic.income}
          label="Importados"
          value={imported}
        />
        <ResultCard
          icon="skip-next-circle-outline"
          color={colors.text.tertiary}
          label="Duplicatas"
          value={skipped}
        />
        {errors > 0 && (
          <ResultCard
            icon="alert-circle-outline"
            color={colors.semantic.expense}
            label="Com erro"
            value={errors}
          />
        )}
      </View>

      <Button label="Fechar" onPress={onClose} size="lg" />
    </View>
  );
}

function ResultCard({
  icon,
  color,
  label,
  value,
}: {
  icon: string;
  color: string;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.resultCard}>
      <MaterialCommunityIcons name={icon as any} size={24} color={color} />
      <Text style={[styles.resultValue, { color }]}>{value}</Text>
      <Text style={styles.resultLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing['2xl'],
    gap: spacing.xl,
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.heading.lg,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  cards: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  resultCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.default,
    maxWidth: 110,
  },
  resultValue: {
    ...typography.heading.lg,
  },
  resultLabel: {
    ...typography.label.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
