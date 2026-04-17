import { usePreferencesStore } from '@store/preferences-store';
import { darkColors, lightColors, Colors } from './colors';

export type { Colors };

export function useTheme(): { colors: Colors; isDark: boolean } {
  const theme = usePreferencesStore((s) => s.preferences.theme);
  const isDark = theme !== 'light';
  return { colors: isDark ? darkColors : lightColors, isDark };
}
