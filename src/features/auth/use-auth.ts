import { useCallback } from 'react';
import { useAuthStore } from '@store/auth-store';
import * as authService from '@services/auth/auth-service';
import type { SignInCredentials, SignUpCredentials } from '@/types/auth';

export function useAuth() {
  const { session, user, status, error, setError, setLoading } = useAuthStore();

  // -------------------------------------------------------------------------
  // Login
  // -------------------------------------------------------------------------
  const signIn = useCallback(async (credentials: SignInCredentials) => {
    setLoading();
    const result = await authService.signIn(credentials);
    if (!result.success) {
      setError(result.error ?? 'Erro ao entrar.');
    }
    return result;
  }, [setLoading, setError]);

  // -------------------------------------------------------------------------
  // Cadastro
  // -------------------------------------------------------------------------
  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    setLoading();
    const result = await authService.signUp(credentials);
    if (!result.success) {
      setError(result.error ?? 'Erro ao cadastrar.');
    }
    return result;
  }, [setLoading, setError]);

  // -------------------------------------------------------------------------
  // Logout
  // -------------------------------------------------------------------------
  const signOut = useCallback(async () => {
    setLoading();
    await authService.signOut();
  }, [setLoading]);

  // -------------------------------------------------------------------------
  // Recuperar senha
  // -------------------------------------------------------------------------
  const resetPassword = useCallback(async (email: string) => {
    const result = await authService.resetPassword(email);
    if (!result.success) {
      setError(result.error ?? 'Erro ao enviar email.');
    }
    return result;
  }, [setError]);

  return {
    // Estado
    session,
    user,
    status,
    error,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    // Ações
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}
