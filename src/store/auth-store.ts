import { create } from 'zustand';
import type { AuthState, Session, User } from '@/types/auth';

interface AuthStore extends AuthState {
  setSession: (session: Session | null) => void;
  setError: (error: string | null) => void;
  setLoading: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  // Estado inicial — loading até verificarmos a sessão existente
  session: null,
  user: null,
  status: 'loading',
  error: null,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      status: session ? 'authenticated' : 'unauthenticated',
      error: null,
    }),

  setError: (error) =>
    set({ error }),

  setLoading: () =>
    set({ status: 'loading', error: null }),

  clear: () =>
    set({ session: null, user: null, status: 'unauthenticated', error: null }),
}));
