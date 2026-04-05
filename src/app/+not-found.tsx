import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { colors, typography, spacing } from '@theme/index';

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela não encontrada</Text>
      <Link href="/" style={styles.link}>
        Voltar para o início
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    gap: spacing.lg,
  },
  title: {
    ...typography.heading.lg,
    color: colors.text.primary,
  },
  link: {
    ...typography.body.md,
    color: colors.accent.primary,
  },
});
