import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, typography } from '@theme/index';
import { HealthStatus } from '@hooks/use-financial-insights';

interface SmartGreetingProps {
  name: string;
  healthStatus: HealthStatus;
}

function buildGreeting(name: string, status: HealthStatus): { main: string; sub: string } {
  const display = name?.trim() ? name.split(' ')[0] : '';
  const prefix = display ? `Olá, ${display}` : 'Olá';

  switch (status) {
    case 'good':
      return { main: `${prefix}! 👍`, sub: 'Tudo sob controle este mês.' };
    case 'warning':
      return { main: `${prefix}!`, sub: 'Fique de olho nos gastos este mês.' };
    case 'danger':
      return { main: `${prefix}!`, sub: 'Orçamento estourado — hora de revisar.' };
    default:
      return { main: `${prefix} 👋`, sub: 'Seu resumo financeiro' };
  }
}

export function SmartGreeting({ name, healthStatus }: SmartGreetingProps) {
  const { main, sub } = buildGreeting(name, healthStatus);

  const subColor =
    healthStatus === 'danger'
      ? colors.semantic.expense
      : healthStatus === 'warning'
      ? '#F59E0B'
      : colors.text.secondary;

  return (
    <>
      <Text style={styles.main}>{main}</Text>
      <Text style={[styles.sub, { color: subColor }]}>{sub}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  main: { ...typography.heading.xl, color: colors.text.primary },
  sub: { ...typography.body.md, marginTop: 2 },
});
