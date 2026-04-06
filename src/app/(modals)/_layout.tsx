import { Stack } from 'expo-router';
import { colors } from '@theme/index';

export default function ModalsLayout() {
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
    </Stack>
  );
}
