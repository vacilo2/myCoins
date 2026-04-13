import type { Session, User } from '@supabase/supabase-js';

export type { Session, User };

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  error: string | null;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}
