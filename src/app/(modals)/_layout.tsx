import { Stack } from 'expo-router';
import { useTheme } from '@theme';

export default function ModalsLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="new-transaction" />
      <Stack.Screen name="edit-transaction" />
      <Stack.Screen name="new-category" />
      <Stack.Screen name="edit-category" />
      <Stack.Screen name="import-csv" />
      <Stack.Screen name="onboarding-profile" />
      <Stack.Screen name="financial-profile" />
    </Stack>
  );
}
