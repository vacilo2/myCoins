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
//
// Layout das chaves:
//   ${key}.0, ${key}.1, ...  — chunks do valor
//   ${key}.meta              — JSON { v: 1, n: <total_chunks> }, escrito por último
//                              como marcador de commit atômico
//
// Fallbacks em getItem (do mais novo ao mais antigo):
//   1. meta presente → lê exatamente n chunks
//   2. sem meta mas chunks existem → heal: grava meta e retorna valor
//   3. sem chunks mas chave legada existe → migra para chunks + meta
// ---------------------------------------------------------------------------
const CHUNK_SIZE = 1900;
const META_SUFFIX = '.meta';

type ChunkMeta = { v: 1; n: number };

async function _readMeta(key: string): Promise<ChunkMeta | null> {
  const raw = await SecureStore.getItemAsync(`${key}${META_SUFFIX}`);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    if (p && p.v === 1 && typeof p.n === 'number') return p as ChunkMeta;
  } catch {}
  return null;
}

async function _readChunks(key: string, n: number): Promise<string | null> {
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const c = await SecureStore.getItemAsync(`${key}.${i}`);
    if (c === null) return null;
    parts.push(c);
  }
  return parts.join('');
}

async function _probeLegacyChunks(key: string): Promise<string[] | null> {
  const parts: string[] = [];
  let i = 0;
  while (true) {
    const c = await SecureStore.getItemAsync(`${key}.${i}`);
    if (c === null) break;
    parts.push(c);
    i++;
  }
  return parts.length ? parts : null;
}

const secureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return localStorage.getItem(key);

    // 1. Caminho principal: meta presente
    const meta = await _readMeta(key);
    if (meta) return _readChunks(key, meta.n);

    // 2. Chunks sem meta (escrita antiga ou crash antes do commit) → heal
    const legacyChunks = await _probeLegacyChunks(key);
    if (legacyChunks) {
      const value = legacyChunks.join('');
      await SecureStore.setItemAsync(
        `${key}${META_SUFFIX}`,
        JSON.stringify({ v: 1, n: legacyChunks.length } satisfies ChunkMeta),
      );
      return value;
    }

    // 3. Chave única legada (pré-chunking) → migra para chunks + meta
    const legacy = await SecureStore.getItemAsync(key);
    if (legacy !== null) {
      try {
        await secureStoreAdapter.setItem(key, legacy);
        await SecureStore.deleteItemAsync(key);
      } catch (e) {
        // Migração falhou; retorna o valor assim mesmo para não deslogar
        console.warn('[auth] migração de sessão legada falhou', e);
      }
      return legacy;
    }

    return null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }

    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) ?? [];
    const prevMeta = await _readMeta(key);

    try {
      await Promise.all(
        chunks.map((chunk, i) => SecureStore.setItemAsync(`${key}.${i}`, chunk)),
      );
    } catch (err) {
      // Rollback best-effort dos chunks já escritos; re-lança para o Supabase tratar
      await Promise.allSettled(chunks.map((_, i) => SecureStore.deleteItemAsync(`${key}.${i}`)));
      throw err;
    }

    // Commit: meta só é gravada depois que todos os chunks estão salvos
    await SecureStore.setItemAsync(
      `${key}${META_SUFFIX}`,
      JSON.stringify({ v: 1, n: chunks.length } satisfies ChunkMeta),
    );

    // Remove trailing chunks de escrita anterior maior
    const prevN = prevMeta?.n ?? chunks.length;
    for (let i = chunks.length; i < prevN; i++) {
      await SecureStore.deleteItemAsync(`${key}.${i}`);
    }
    // Se não havia meta, faz probe para limpar possíveis chunks órfãos
    if (!prevMeta) {
      let i = chunks.length;
      while (true) {
        const existing = await SecureStore.getItemAsync(`${key}.${i}`);
        if (existing === null) break;
        await SecureStore.deleteItemAsync(`${key}.${i}`);
        i++;
      }
    }
  },

  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }

    const meta = await _readMeta(key);
    if (meta) {
      await Promise.all(
        Array.from({ length: meta.n }, (_, i) => SecureStore.deleteItemAsync(`${key}.${i}`)),
      );
    } else {
      let i = 0;
      while (true) {
        const existing = await SecureStore.getItemAsync(`${key}.${i}`);
        if (existing === null) break;
        await SecureStore.deleteItemAsync(`${key}.${i}`);
        i++;
      }
    }
    await SecureStore.deleteItemAsync(`${key}${META_SUFFIX}`);
    await SecureStore.deleteItemAsync(key); // chave legada pré-chunking
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
