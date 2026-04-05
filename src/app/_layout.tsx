import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useTransactionStore } from '@store/transaction-store';
import { useCategoryStore } from '@store/category-store';
import { usePreferencesStore } from '@store/preferences-store';
import { colors } from '@theme/index';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const transactionHydrated = useTransactionStore((s) => s.isHydrated);
  const categoryHydrated = useCategoryStore((s) => s.isHydrated);
  const prefsHydrated = usePreferencesStore((s) => s.isHydrated);

  const isReady = transactionHydrated && categoryHydrated && prefsHydrated;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background.primary } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
