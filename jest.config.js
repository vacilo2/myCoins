module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$':             '<rootDir>/src/$1',
    '^@utils/(.*)$':        '<rootDir>/src/utils/$1',
    '^@features/(.*)$':     '<rootDir>/src/features/$1',
    '^@store/(.*)$':        '<rootDir>/src/store/$1',
    '^@services/(.*)$':     '<rootDir>/src/services/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@hooks/(.*)$':        '<rootDir>/src/hooks/$1',
  },
};
