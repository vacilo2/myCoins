import { Platform } from 'react-native';

const serifFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });
const sansFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });
const monoFont = Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' });

export const typography = {
  // Display — saldo principal, valores grandes
  display: {
    xl: { fontFamily: serifFont, fontSize: 48, fontWeight: '700' as const, lineHeight: 52 },
    lg: { fontFamily: serifFont, fontSize: 36, fontWeight: '700' as const, lineHeight: 40 },
    md: { fontFamily: serifFont, fontSize: 28, fontWeight: '500' as const, lineHeight: 34 },
  },

  // Headings
  heading: {
    xl: { fontFamily: serifFont, fontSize: 24, fontWeight: '500' as const, lineHeight: 30 },
    lg: { fontFamily: serifFont, fontSize: 20, fontWeight: '500' as const, lineHeight: 26 },
    md: { fontFamily: serifFont, fontSize: 18, fontWeight: '500' as const, lineHeight: 24 },
    sm: { fontFamily: serifFont, fontSize: 16, fontWeight: '500' as const, lineHeight: 22 },
  },

  // Body
  body: {
    lg: { fontFamily: sansFont, fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    md: { fontFamily: sansFont, fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    sm: { fontFamily: sansFont, fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  },

  // Labels
  label: {
    lg: { fontFamily: sansFont, fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
    md: { fontFamily: sansFont, fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
    sm: { fontFamily: sansFont, fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
  },

  // Mono — valores monetários, números alinhados
  mono: {
    xl: { fontFamily: monoFont, fontSize: 36, fontWeight: '700' as const, lineHeight: 40, fontVariant: ['tabular-nums'] as any },
    lg: { fontFamily: monoFont, fontSize: 24, fontWeight: '700' as const, lineHeight: 30, fontVariant: ['tabular-nums'] as any },
    md: { fontFamily: monoFont, fontSize: 16, fontWeight: '600' as const, lineHeight: 22, fontVariant: ['tabular-nums'] as any },
    sm: { fontFamily: monoFont, fontSize: 14, fontWeight: '500' as const, lineHeight: 20, fontVariant: ['tabular-nums'] as any },
  },
} as const;
