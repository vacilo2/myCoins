import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
} as const;

export type Theme = typeof theme;

export { colors, typography, spacing, radius };
export { useTheme } from './ThemeContext';
export type { Colors } from './ThemeContext';
