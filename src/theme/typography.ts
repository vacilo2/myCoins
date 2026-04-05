import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  // Display — saldo principal, valores grandes
  display: {
    xl: { fontFamily, fontSize: 48, fontWeight: '700' as const, lineHeight: 52 },
    lg: { fontFamily, fontSize: 36, fontWeight: '700' as const, lineHeight: 40 },
    md: { fontFamily, fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  },

  // Headings
  heading: {
    xl: { fontFamily, fontSize: 24, fontWeight: '600' as const, lineHeight: 30 },
    lg: { fontFamily, fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
    md: { fontFamily, fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
    sm: { fontFamily, fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  },

  // Body
  body: {
    lg: { fontFamily, fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    md: { fontFamily, fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    sm: { fontFamily, fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  },

  // Labels
  label: {
    lg: { fontFamily, fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
    md: { fontFamily, fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
    sm: { fontFamily, fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
  },

  // Mono — valores monetários, números alinhados
  mono: {
    xl: { fontFamily, fontSize: 36, fontWeight: '700' as const, lineHeight: 40, fontVariant: ['tabular-nums'] as any },
    lg: { fontFamily, fontSize: 24, fontWeight: '700' as const, lineHeight: 30, fontVariant: ['tabular-nums'] as any },
    md: { fontFamily, fontSize: 16, fontWeight: '600' as const, lineHeight: 22, fontVariant: ['tabular-nums'] as any },
    sm: { fontFamily, fontSize: 14, fontWeight: '500' as const, lineHeight: 20, fontVariant: ['tabular-nums'] as any },
  },
} as const;
