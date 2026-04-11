export const colors = {
  background: {
    primary: '#141413',    // Anthropic Near Black
    secondary: '#1c1b18',  // Slightly lighter warm dark
    subtle: '#252523',     // Subtle section background
    // Keep tertiary as an alias for subtle for backward compat
    tertiary: '#252523',
  },
  surface: {
    default: '#30302e',    // Dark Surface — cards, containers
    elevated: '#3d3d3a',   // Dark Warm — elevated cards
    subtle: '#252523',     // Subtle surface
  },
  accent: {
    primary: '#c96442',    // Terracotta Brand
    hover: '#d97757',      // Coral Accent
    muted: '#3d2518',      // Terracotta background tint
    subtle: '#3d2518',     // Terracotta background tint
  },
  text: {
    primary: '#faf9f5',    // Ivory
    secondary: '#b0aea5',  // Warm Silver
    tertiary: '#87867f',   // Stone Gray
    inverse: '#141413',    // Text on accent backgrounds
    accent: '#d97757',     // Coral for links/emphasis
  },
  border: {
    default: '#30302e',    // Standard dark border
    subtle: '#252523',     // Subtle border
    strong: '#4d4c48',     // Charcoal Warm — stronger border
    focused: '#3898ec',    // Focus ring — only cool color allowed
  },
  // Financial semantic colors (flat, not nested under semantic)
  semantic: {
    income: '#4a7c59',       // Warm green
    incomeMuted: '#2d4d38',  // Warm green bg
    expense: '#b53333',      // Error Crimson
    expenseMuted: '#4d1f1f', // Crimson bg
    warning: '#c96442',      // Reuse terracotta
    warningMuted: '#3d2518', // Terracotta bg
  },
  income: '#4a7c59',
  incomeMuted: '#2d4d38',
  expense: '#b53333',
  expenseMuted: '#4d1f1f',
  warning: '#c96442',
  warningMuted: '#3d2518',
  // Static
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;
