import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@theme/index';
import { Button } from '@ui/button';
import { pickAndParseCSV, ParseResult } from '@services/csv-import';

interface StepFilePickProps {
  onPicked: (result: ParseResult) => void;
  onError: (msg: string) => void;
}

export function StepFilePick({ onPicked, onError }: StepFilePickProps) {
  const [loading, setLoading] = useState(false);

  async function handlePick() {
    setLoading(true);
    try {
      const result = await pickAndParseCSV();
      if (!result) { setLoading(false); return; }

      if (result.rows.length === 0) {
        onError('Nenhuma linha válida encontrada no arquivo. Verifique se o CSV tem cabeçalho com colunas de data, descrição e valor.');
        setLoading(false);
        return;
      }

      onPicked(result);
    } catch (e: any) {
      onError('Erro ao ler o arquivo. Verifique se é um CSV válido.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons name="file-delimited-outline" size={56} color={colors.accent.primary} />
      </View>

      <Text style={styles.title}>Importar extrato CSV</Text>
      <Text style={styles.subtitle}>
        Selecione um arquivo CSV exportado do seu banco. O arquivo deve conter colunas de data, descrição e valor.
      </Text>

      <View style={styles.hints}>
        {HINTS.map((h) => (
          <View key={h} style={styles.hintRow}>
            <MaterialCommunityIcons name="check-circle-outline" size={16} color={colors.accent.primary} />
            <Text style={styles.hintText}>{h}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent.primary} size="large" style={styles.loader} />
      ) : (
        <Button label="Selecionar arquivo" onPress={handlePick} size="lg" />
      )}
    </View>
  );
}

const HINTS = [
  'Formatos de data: DD/MM/YYYY ou YYYY-MM-DD',
  'Valores negativos são importados como Despesas',
  'Duplicatas são automaticamente ignoradas',
];

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
  hints: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hintText: {
    ...typography.body.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  loader: { marginVertical: spacing.lg },
});
