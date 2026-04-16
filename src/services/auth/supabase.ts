import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Configuração — substitua pelas suas credenciais do projeto Supabase
// Crie um projeto em https://supabase.com e copie as chaves de Project Settings > API
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'your-anon-key';

// ---------------------------------------------------------------------------
// Adapter de storage seguro com chunking
// SecureStore tem limite de 2048 bytes por chave. O token de sessão do Supabase
// pode ultrapassar esse limite, então dividimos em chunks numerados.
// Usa localStorage na web (SecureStore não está disponível no browser).
// ---------------------------------------------------------------------------
const CHUNK_SIZE = 1900;

const secureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    const chunks: string[] = [];
    let i = 0;
    while (true) {
      const chunk = await SecureStore.getItemAsync(`${key}.${i}`);
      if (chunk === null) break;
      chunks.push(chunk);
      i++;
    }
    return chunks.length ? chunks.join('') : null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) ?? [];
    await Promise.all(chunks.map((chunk, i) => SecureStore.setItemAsync(`${key}.${i}`, chunk)));
    // Remove chunks antigos que possam ter sobrado de um valor maior anterior
    let i = chunks.length;
    while (true) {
      const existing = await SecureStore.getItemAsync(`${key}.${i}`);
      if (existing === null) break;
      await SecureStore.deleteItemAsync(`${key}.${i}`);
      i++;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    let i = 0;
    while (true) {
      const existing = await SecureStore.getItemAsync(`${key}.${i}`);
      if (existing === null) break;
      await SecureStore.deleteItemAsync(`${key}.${i}`);
      i++;
    }
  },
};

// ---------------------------------------------------------------------------
// Cliente Supabase
// ---------------------------------------------------------------------------
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // necessário para React Native
  },
});
