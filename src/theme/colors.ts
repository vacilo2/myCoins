export const colors = {
  // Backgrounds — warm dark grays, Notion-like
  background: {
    primary: '#111111',
    secondary: '#191919',
    tertiary: '#212121',
  },

  // Surfaces
  surface: {
    subtle: '#262626',
    elevated: '#1e1e1e',
  },

  // Accent
  accent: {
    primary: '#C6F135',
    muted: 'rgba(198, 241, 53, 0.08)',
    hover: '#B5DF20',
  },

  // Semantic
  semantic: {
    income: '#4ADE80',
    incomeMuted: 'rgba(74, 222, 128, 0.08)',
    expense: '#F87171',
    expenseMuted: 'rgba(248, 113, 113, 0.08)',
    warning: '#FBBF24',
    warningMuted: 'rgba(251, 191, 36, 0.08)',
  },

  // Text — rgba for Notion-like softness
  text: {
    primary: 'rgba(255, 255, 255, 0.88)',
    secondary: 'rgba(255, 255, 255, 0.45)',
    tertiary: 'rgba(255, 255, 255, 0.25)',
    inverse: '#111111',
  },

  // Borders — very subtle, Notion-style
  border: {
    default: 'rgba(255, 255, 255, 0.08)',
    subtle: 'rgba(255, 255, 255, 0.05)',
    focused: '#C6F135',
  },

  // Static
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;
