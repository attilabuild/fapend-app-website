import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://btbfijdqtcovjktnvmcw.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0YmZpamRxdGNvdmprdG52bWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDA3ODEsImV4cCI6MjA3MDU3Njc4MX0.mHt6vKm0Xb6L4IHEeknWxSYZMsRmMoKF2_XEEOsf37I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to upsert skin score
export async function upsertSkinScore(userId: string, score: number) {
  const safeScore = Math.max(0, Math.min(100, Math.floor(score)));
  
  const { data, error } = await supabase
    .from('skin_scores')
    .upsert(
      { user_id: userId, score: safeScore },
      { onConflict: 'user_id' }
    );

  if (error) {
    throw new Error(`Failed to save skin score: ${error.message}`);
  }

  return { ok: true, data };
}

// Helper function to get recent skin scores
export async function getRecentSkinScores(userId: string, limit: number = 10) {
  const { data, error } = await supabase
    .from('skin_scores')
    .select('score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch skin scores: ${error.message}`);
  }

  return data || [];
}
