import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@features/auth';
import { useTheme, Colors } from '@theme';

export function LoginScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { signIn, isLoading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) return;
    await signIn({ email: email.trim(), password });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Text style={styles.logo}>myCoins</Text>
          <Text style={styles.heading}>Entrar</Text>
          <Text style={styles.sub}>Acesse sua conta para continuar</Text>

          {/* Campos */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={colors.text.tertiary}
              secureTextEntry
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleSignIn}
              returnKeyType="go"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, (!email || !password || isLoading) && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={!email || !password || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Links */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot')}
            style={styles.link}
          >
            <Text style={styles.linkText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.footerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


function createStyles(c: Colors) {
    return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.background.primary,
    },
    flex: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 48,
    },
    logo: {
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: c.accent.primary,
      marginBottom: 12,
    },
    heading: {
      fontSize: 32,
      fontWeight: '700',
      color: c.text.primary,
      marginBottom: 8,
    },
    sub: {
      fontSize: 15,
      color: c.text.secondary,
      marginBottom: 36,
    },
    form: {
      gap: 12,
    },
    input: {
      backgroundColor: c.surface.default,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: c.text.primary,
      borderWidth: 1,
      borderColor: c.border.default,
    },
    error: {
      fontSize: 13,
      color: c.semantic.expense,
      marginTop: 2,
    },
    button: {
      backgroundColor: c.accent.primary,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.4,
    },
    buttonText: {
      color: c.text.inverse,
      fontSize: 16,
      fontWeight: '600',
    },
    link: {
      alignItems: 'center',
      marginTop: 20,
    },
    linkText: {
      color: c.text.accent,
      fontSize: 14,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 32,
    },
    footerText: {
      color: c.text.tertiary,
      fontSize: 14,
    },
    footerLink: {
      color: c.accent.primary,
      fontSize: 14,
      fontWeight: '600',
    },
  });
}

