import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useTransactionStore } from '@store/transaction-store';
import { useCategoryStore } from '@store/category-store';
import { usePreferencesStore } from '@store/preferences-store';
import { useAuthStore } from '@store/auth-store';
import { onAuthStateChange } from '@services/auth/auth-service';
import { colors } from '@theme/index';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const transactionHydrated = useTransactionStore((s) => s.isHydrated);
  const categoryHydrated = useCategoryStore((s) => s.isHydrated);
  const prefsHydrated = usePreferencesStore((s) => s.isHydrated);
  const [timedOut, setTimedOut] = useState(false);

  const authStatus = useAuthStore((s) => s.status);
  const setSession = useAuthStore((s) => s.setSession);

  const router = useRouter();
  const segments = useSegments();

  const storesReady = (transactionHydrated && categoryHydrated && prefsHydrated) || timedOut;
  const authReady = authStatus !== 'loading';
  const isReady = storesReady && authReady;

  // Inicializa listener de sessão do Supabase
  useEffect(() => {
    return onAuthStateChange((session) => {
      setSession(session);
    });
  }, [setSession]);

  // Timeout de segurança para hydration dos stores
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Esconde splash quando tudo estiver pronto
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Guard de autenticação — redireciona após o layout estar montado
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isAuthenticated = authStatus === 'authenticated';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isReady, authStatus, segments, router]);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background.primary } }}>
        <Stack.Screen name="(auth)" />
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
