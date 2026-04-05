import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, typography, spacing } from '@theme/index';
import { TransactionForm } from '@/components/transaction/transaction-form';

export default function NewTransactionModal() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Novo lançamento</Text>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
      <TransactionForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
  },
  title: {
    ...typography.heading.lg,
    color: colors.text.primary,
  },
});
