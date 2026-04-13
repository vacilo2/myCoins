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
import { colors } from '@theme/index';

export function SignupScreen() {
  const router = useRouter();
  const { signUp, isLoading, error } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSignUp() {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    const result = await signUp({ name: name.trim(), email: email.trim(), password });
    if (result.success) {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={styles.heading}>Quase lá!</Text>
          <Text style={styles.successText}>
            Enviamos um link de confirmação para{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
            {'\n\n'}Verifique sua caixa de entrada e clique no link para ativar sua conta.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Ir para o login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
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
          <Text style={styles.heading}>Criar conta</Text>
          <Text style={styles.sub}>Comece a controlar suas finanças</Text>

          {/* Campos */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="words"
              autoComplete="name"
              value={name}
              onChangeText={setName}
            />
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
              placeholder="Senha (mínimo 6 caracteres)"
              placeholderTextColor={colors.text.tertiary}
              secureTextEntry
              autoComplete="new-password"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleSignUp}
              returnKeyType="go"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[
                styles.button,
                (!name || !email || !password || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={!name || !email || !password || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={styles.buttonText}>Criar conta</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
    color: colors.accent.primary,
    marginBottom: 12,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 36,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: colors.surface.default,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  error: {
    fontSize: 13,
    color: colors.semantic.expense,
    marginTop: 2,
  },
  button: {
    backgroundColor: colors.accent.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: colors.text.tertiary,
    fontSize: 14,
  },
  footerLink: {
    color: colors.accent.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Success state
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    color: colors.text.primary,
    fontWeight: '600',
  },
});
