import { supabase } from './supabase';
import type { AuthResult, SignInCredentials, SignUpCredentials, Session } from '@/types/auth';

// ---------------------------------------------------------------------------
// Login com email e senha
// ---------------------------------------------------------------------------
export async function signIn({ email, password }: SignInCredentials): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: translateError(error.message) };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Cadastro com email, senha e nome
// ---------------------------------------------------------------------------
export async function signUp({ email, password, name }: SignUpCredentials): Promise<AuthResult> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }, // salvo em user_metadata
    },
  });
  if (error) return { success: false, error: translateError(error.message) };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------
export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: translateError(error.message) };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Recuperar senha (envia email)
// ---------------------------------------------------------------------------
export async function resetPassword(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { success: false, error: translateError(error.message) };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Sessão atual
// ---------------------------------------------------------------------------
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ---------------------------------------------------------------------------
// Listener de mudança de estado de autenticação
// Retorna a função de unsubscribe
// ---------------------------------------------------------------------------
export function onAuthStateChange(
  callback: (session: Session | null) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}

// ---------------------------------------------------------------------------
// Tradução de erros do Supabase para PT-BR
// ---------------------------------------------------------------------------
function translateError(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos.',
    'Email not confirmed': 'Confirme seu email antes de entrar.',
    'User already registered': 'Este email já está cadastrado.',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'Unable to validate email address: invalid format': 'Email inválido.',
    'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos.',
  };
  return map[message] ?? 'Ocorreu um erro. Tente novamente.';
}