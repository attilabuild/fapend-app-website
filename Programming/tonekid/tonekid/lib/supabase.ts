import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

function readConfig(): { url: string; anonKey: string } | null {
  const extra = Constants.expoConfig?.extra as
    | { supabaseUrl?: string; supabaseAnonKey?: string }
    | undefined;
  const url = extra?.supabaseUrl;
  const anonKey = extra?.supabaseAnonKey;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

function buildClient(): SupabaseClient<Database> {
  const cfg = readConfig();
  if (!cfg) {
    // Fall back to a placeholder. The client throws on first network call instead of crashing on import.
    return createClient<Database>('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: { persistSession: false },
    });
  }
  return createClient<Database>(cfg.url, cfg.anonKey, {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = buildClient();

export const supabaseConfigured = readConfig() !== null;
