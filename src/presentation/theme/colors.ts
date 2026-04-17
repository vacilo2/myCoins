export interface Colors {
  background: { primary: string; secondary: string; subtle: string; tertiary: string };
  surface: { default: string; elevated: string; subtle: string };
  accent: { primary: string; hover: string; muted: string; subtle: string };
  text: { primary: string; secondary: string; tertiary: string; inverse: string; accent: string };
  border: { default: string; subtle: string; strong: string; focused: string };
  semantic: {
    income: string; incomeMuted: string;
    expense: string; expenseMuted: string;
    warning: string; warningMuted: string;
  };
  income: string; incomeMuted: string;
  expense: string; expenseMuted: string;
  warning: string; warningMuted: string;
  white: string; black: string; transparent: string;
}

export const darkColors: Colors = {
  background: {
    primary: '#141413',
    secondary: '#1c1b18',
    subtle: '#252523',
    tertiary: '#252523',
  },
  surface: {
    default: '#30302e',
    elevated: '#3d3d3a',
    subtle: '#252523',
  },
  accent: {
    primary: '#c96442',
    hover: '#d97757',
    muted: '#3d2518',
    subtle: '#3d2518',
  },
  text: {
    primary: '#faf9f5',
    secondary: '#b0aea5',
    tertiary: '#87867f',
    inverse: '#141413',
    accent: '#d97757',
  },
  border: {
    default: '#30302e',
    subtle: '#252523',
    strong: '#4d4c48',
    focused: '#3898ec',
  },
  semantic: {
    income: '#4a7c59',
    incomeMuted: '#2d4d38',
    expense: '#b53333',
    expenseMuted: '#4d1f1f',
    warning: '#c96442',
    warningMuted: '#3d2518',
  },
  income: '#4a7c59',
  incomeMuted: '#2d4d38',
  expense: '#b53333',
  expenseMuted: '#4d1f1f',
  warning: '#c96442',
  warningMuted: '#3d2518',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const lightColors: Colors = {
  background: {
    primary: '#FDFCFA',
    secondary: '#F5F3EF',
    subtle: '#EDE9E3',
    tertiary: '#EDE9E3',
  },
  surface: {
    default: '#E8E4DC',
    elevated: '#DDD8CE',
    subtle: '#EDE9E3',
  },
  accent: {
    primary: '#c96442',
    hover: '#d97757',
    muted: 'rgba(201,100,66,0.12)',
    subtle: 'rgba(201,100,66,0.08)',
  },
  text: {
    primary: '#141413',
    secondary: '#52514c',
    tertiary: '#87867f',
    inverse: '#FDFCFA',
    accent: '#c96442',
  },
  border: {
    default: '#D5D1C8',
    subtle: '#E8E4DC',
    strong: '#B8B3A8',
    focused: '#3898ec',
  },
  semantic: {
    income: '#2d6b45',
    incomeMuted: 'rgba(45,107,69,0.12)',
    expense: '#a52929',
    expenseMuted: 'rgba(165,41,41,0.12)',
    warning: '#c96442',
    warningMuted: 'rgba(201,100,66,0.12)',
  },
  income: '#2d6b45',
  incomeMuted: 'rgba(45,107,69,0.12)',
  expense: '#a52929',
  expenseMuted: 'rgba(165,41,41,0.12)',
  warning: '#c96442',
  warningMuted: 'rgba(201,100,66,0.12)',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const colors = darkColors;
