import React from 'react';
import { Image, View, Text, StyleSheet, StyleProp, ViewStyle, ImageSourcePropType } from 'react-native';
import { colors, typography } from '@theme/index';
import { HealthStatus } from '@hooks/use-financial-insights';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MicoMood =
  | 'NEUTRO'
  | 'FELIZ'
  | 'PREOCUPADO'
  | 'ALERTA'
  | 'PERIGO'
  | 'ANALISANDO'
  | 'COMEMORANDO'
  | 'PENSATIVO';

// ─── Asset map ────────────────────────────────────────────────────────────────
// Set a mood to `null` when the PNG file is not yet available.
// The component will render a placeholder circle in that case.

const MICO_ASSETS: Record<MicoMood, ImageSourcePropType | null> = {
  NEUTRO: null,
  FELIZ: null,
  PREOCUPADO: null,
  ALERTA: null,
  PERIGO: null,
  ANALISANDO: null,
  COMEMORANDO: null,
  PENSATIVO: null,
};

// Uncomment each line as you add the PNG to assets/images/mico/:
// NEUTRO:      require('../../../assets/images/mico/mico-neutro.png'),
// FELIZ:       require('../../../assets/images/mico/mico-feliz.png'),
// PREOCUPADO:  require('../../../assets/images/mico/mico-preocupado.png'),
// ALERTA:      require('../../../assets/images/mico/mico-alerta.png'),
// PERIGO:      require('../../../assets/images/mico/mico-perigo.png'),
// ANALISANDO:  require('../../../assets/images/mico/mico-analisando.png'),
// COMEMORANDO: require('../../../assets/images/mico/mico-comemorando.png'),
// PENSATIVO:   require('../../../assets/images/mico/mico-pensativo.png'),

// ─── Mood → HealthStatus mapping ─────────────────────────────────────────────

const PLACEHOLDER_COLORS: Record<MicoMood, string> = {
  NEUTRO: colors.text.secondary,
  FELIZ: colors.semantic.income,
  PREOCUPADO: colors.semantic.warning,
  ALERTA: '#F59E0B',
  PERIGO: colors.semantic.expense,
  ANALISANDO: '#60A5FA',
  COMEMORANDO: '#A78BFA',
  PENSATIVO: colors.text.secondary,
};

/**
 * Converts a financial health status to the corresponding MICO mood.
 * This is the single source of truth for the mapping.
 *
 * Phase 2: add `budgetUsedPct?: number` parameter to distinguish
 * PREOCUPADO vs ALERTA within the 'warning' status.
 */
export function healthStatusToMood(status: HealthStatus): MicoMood {
  switch (status) {
    case 'good':
      return 'FELIZ';
    case 'warning':
      return 'PREOCUPADO';
    case 'danger':
      return 'PERIGO';
    default:
      return 'NEUTRO';
  }
}

// ─── Placeholder ──────────────────────────────────────────────────────────────

interface PlaceholderProps {
  size: number;
  mood: MicoMood;
}

function MicoPlaceholder({ size, mood }: PlaceholderProps) {
  const bgColor = PLACEHOLDER_COLORS[mood];
  const letter = mood.charAt(0);

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor + '26', // 15% opacity
          borderColor: bgColor + '66',     // 40% opacity
        },
      ]}
    >
      <Text style={[styles.placeholderText, { color: bgColor, fontSize: size * 0.38 }]}>
        {letter}
      </Text>
    </View>
  );
}

// ─── MicoMascot ───────────────────────────────────────────────────────────────

interface MicoMascotProps {
  mood: MicoMood;
  /** Rendered size in dp. Defaults to 72. */
  size?: number;
  style?: StyleProp<ViewStyle>;
  // Phase 2: animated?: boolean;
}

export function MicoMascot({ mood, size = 72, style }: MicoMascotProps) {
  const source = MICO_ASSETS[mood];

  return (
    <View style={[{ width: size, height: size }, style]}>
      {source ? (
        <Image
          source={source}
          style={{ width: size, height: size }}
          resizeMode="contain"
          // Phase 2: swap Image for Animated.Image + useAnimatedStyle
        />
      ) : (
        <MicoPlaceholder size={size} mood={mood} />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  placeholderText: {
    ...typography.heading.lg,
    fontWeight: '700',
  },
});
