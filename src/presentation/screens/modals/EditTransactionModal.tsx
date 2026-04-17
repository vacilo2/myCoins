import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme, typography, spacing, Colors } from '@presentation/theme';
import { useTransactionStore } from '@store/transaction-store';
import { TransactionForm } from '@presentation/components/transaction/transaction-form';

export function EditTransactionModal() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const transaction = useTransactionStore((s) => s.transactions.find((t) => t.id === id));

  if (!transaction) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Editar lançamento</Text>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
      <TransactionForm existing={transaction} />
    </SafeAreaView>
  );
}


function createStyles(c: Colors) {
    return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background.primary },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing['2xl'],
      paddingVertical: spacing.lg,
    },
    title: {
      ...typography.heading.lg,
      color: c.text.primary,
    },
  });
}

