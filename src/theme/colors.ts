export interface Colors {
  background: { primary: string; secondary: string; tertiary: string };
  surface: { subtle: string; elevated: string };
  accent: { primary: string; muted: string; hover: string };
  semantic: {
    income: string; incomeMuted: string;
    expense: string; expenseMuted: string;
    warning: string; warningMuted: string;
  };
  text: { primary: string; secondary: string; tertiary: string; inverse: string };
  border: { default: string; subtle: string; focused: string };
  white: string; black: string; transparent: string;
}

export const darkColors: Colors = {
  background: {
    primary: '#0A0A0F',
    secondary: '#111118',
    tertiary: '#1A1A25',
  },
  surface: {
    subtle: '#222232',
    elevated: '#1E1E2E',
  },
  accent: {
    primary: '#C6F135',
    muted: 'rgba(198, 241, 53, 0.12)',
    hover: '#B5DF20',
  },
  semantic: {
    income: '#4ADE80',
    incomeMuted: 'rgba(74, 222, 128, 0.12)',
    expense: '#F87171',
    expenseMuted: 'rgba(248, 113, 113, 0.12)',
    warning: '#FBBF24',
    warningMuted: 'rgba(251, 191, 36, 0.12)',
  },
  text: {
    primary: '#F5F5F7',
    secondary: '#8E8EA0',
    tertiary: '#52526A',
    inverse: '#0A0A0F',
  },
  border: {
    default: '#2A2A3E',
    subtle: '#1E1E2E',
    focused: '#C6F135',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const lightColors: Colors = {
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F7',
    tertiary: '#EBEBF0',
  },
  surface: {
    subtle: '#E8E8EF',
    elevated: '#F0F0F8',
  },
  accent: {
    primary: '#5C7A00',
    muted: 'rgba(92, 122, 0, 0.12)',
    hover: '#4A6600',
  },
  semantic: {
    income: '#2D7A45',
    incomeMuted: 'rgba(45, 122, 69, 0.12)',
    expense: '#C0392B',
    expenseMuted: 'rgba(192, 57, 43, 0.12)',
    warning: '#D97706',
    warningMuted: 'rgba(217, 119, 6, 0.12)',
  },
  text: {
    primary: '#0A0A0F',
    secondary: '#52526A',
    tertiary: '#8E8EA0',
    inverse: '#F5F5F7',
  },
  border: {
    default: '#D0D0E0',
    subtle: '#E8E8F0',
    focused: '#3898ec',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const colors = darkColors;
