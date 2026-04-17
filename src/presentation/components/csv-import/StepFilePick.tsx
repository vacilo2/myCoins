import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, typography, spacing, radius, Colors } from '@presentation/theme';
import { Button } from '@presentation/ui/button';
import { pickAndParseCSV, ParseResult } from '@services/csv-import';

interface StepFilePickProps {
  onPicked: (result: ParseResult) => void;
  onError: (msg: string) => void;
}

export function StepFilePick({ onPicked, onError }: StepFilePickProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [loading, setLoading] = useState(false);

  async function handlePick() {
    setLoading(true);
    try {
      const result = await pickAndParseCSV();
      if (!result) { setLoading(false); return; }

      if (result.rows.length === 0) {
        onError(
          'Nenhuma linha reconhecida no arquivo.\n\n' +
          'O CSV precisa ter colunas de data, descrição e valor no cabeçalho.\n\n' +
          'Colunas aceitas:\n• Data: date, data, dt\n• Descrição: title, description, historico, memo\n• Valor: amount, valor, value'
        );
        setLoading(false);
        return;
      }

      onPicked(result);
    } catch (e: any) {
      onError('Erro ao ler o arquivo: ' + (e?.message ?? String(e)));
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


function createStyles(c: Colors) {
    return StyleSheet.create({
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
      color: c.text.primary,
      textAlign: 'center',
    },
    subtitle: {
      ...typography.body.md,
      color: c.text.secondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    hints: {
      backgroundColor: c.background.tertiary,
      borderRadius: radius.md,
      padding: spacing.lg,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: c.border.default,
    },
    hintRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    hintText: {
      ...typography.body.sm,
      color: c.text.secondary,
      flex: 1,
    },
    loader: { marginVertical: spacing.lg },
  });
}

