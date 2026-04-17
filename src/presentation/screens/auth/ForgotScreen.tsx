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

export function ForgotScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { resetPassword, isLoading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleReset() {
    if (!email.trim()) return;
    const result = await resetPassword(email.trim());
    if (result.success) {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>📬</Text>
          <Text style={styles.heading}>Email enviado!</Text>
          <Text style={styles.successText}>
            Verifique sua caixa de entrada em{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
            {'\n\n'}Clique no link para redefinir sua senha.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Voltar ao login</Text>
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
          <Text style={styles.heading}>Recuperar senha</Text>
          <Text style={styles.sub}>
            Informe seu email e enviaremos um link para criar uma nova senha.
          </Text>

          {/* Campo */}
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
              onSubmitEditing={handleReset}
              returnKeyType="send"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, (!email || isLoading) && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={!email || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={styles.buttonText}>Enviar link</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link voltar */}
          <TouchableOpacity style={styles.link} onPress={() => router.back()}>
            <Text style={styles.linkText}>← Voltar ao login</Text>
          </TouchableOpacity>
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
      lineHeight: 22,
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
      marginTop: 24,
    },
    linkText: {
      color: c.text.accent,
      fontSize: 14,
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
      color: c.text.secondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    emailHighlight: {
      color: c.text.primary,
      fontWeight: '600',
    },
  });
}

