export const colors = {
  // Backgrounds
  background: {
    primary: '#0A0A0F',
    secondary: '#111118',
    tertiary: '#1A1A25',
  },

  // Surfaces
  surface: {
    subtle: '#222232',
    elevated: '#1E1E2E',
  },

  // Accent
  accent: {
    primary: '#C6F135',
    muted: 'rgba(198, 241, 53, 0.12)',
    hover: '#B5DF20',
  },

  // Semantic
  semantic: {
    income: '#4ADE80',
    incomeMuted: 'rgba(74, 222, 128, 0.12)',
    expense: '#F87171',
    expenseMuted: 'rgba(248, 113, 113, 0.12)',
    warning: '#FBBF24',
    warningMuted: 'rgba(251, 191, 36, 0.12)',
  },

  // Text
  text: {
    primary: '#F5F5F7',
    secondary: '#8E8EA0',
    tertiary: '#52526A',
    inverse: '#0A0A0F',
  },

  // Borders
  border: {
    default: '#2A2A3E',
    subtle: '#1E1E2E',
    focused: '#C6F135',
  },

  // Static
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;
