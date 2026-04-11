import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, typography, spacing } from '@presentation/theme/index';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
}

export function ScreenHeader({ title, subtitle, showBack, rightAction }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
            <MaterialCommunityIcons name="arrow-left" size={24} color='#b0aea5' />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightAction && (
        <TouchableOpacity onPress={rightAction.onPress} hitSlop={8}>
          <MaterialCommunityIcons
            name={rightAction.icon as any}
            size={24}
            color='#b0aea5'
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const serifFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    backgroundColor: '#141413',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    marginRight: spacing.xs,
  },
  title: {
    ...typography.heading.xl,
    fontFamily: serifFont,
    fontWeight: '500',
    color: '#faf9f5',
  },
  subtitle: {
    ...typography.body.sm,
    color: '#b0aea5',
    marginTop: 2,
  },
});
