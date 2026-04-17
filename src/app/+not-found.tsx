import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useTheme, typography, spacing, Colors } from '@theme';

export default function NotFound() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela não encontrada</Text>
      <Link href="/" style={styles.link}>
        Voltar para o início
      </Link>
    </View>
  );
}


function createStyles(c: Colors) {
    return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background.primary,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing['2xl'],
      gap: spacing.lg,
    },
    title: {
      ...typography.heading.lg,
      color: c.text.primary,
    },
    link: {
      ...typography.body.md,
      color: c.accent.primary,
    },
  });
}

