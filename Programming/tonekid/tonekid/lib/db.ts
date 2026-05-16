import { supabase } from './supabase';
import type { Database, Json } from './database.types';
import type {
  ActiveSetup,
  ExploreTone,
  Gear,
  GearType,
  Genre,
  OriginalSongDetail,
  PartType,
  SavedTone,
  SkillLevel,
  ToneDetail,
  ToneType,
  TonePreferences,
} from './types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type GearRow = Database['public']['Tables']['gear']['Row'];
type SavedToneRow = Database['public']['Tables']['saved_tones']['Row'];
type CommunityToneRow = Database['public']['Tables']['community_tones']['Row'];

const GEAR_TYPES: GearType[] = ['guitar', 'bass', 'amp', 'bassamp', 'multifx'];

function gearTypeFromString(v: string): GearType {
  return (GEAR_TYPES as string[]).includes(v) ? (v as GearType) : 'guitar';
}

function partTypeFromString(v: string): PartType {
  return v === 'Solo' ? 'Solo' : 'Riff';
}

function toneTypeFromString(v: string): ToneType {
  return v === 'Distorted' ? 'Distorted' : 'Clean';
}

function skillLevelFromString(v: string | null): SkillLevel | null {
  if (v === 'beginner' || v === 'hobbyist' || v === 'gigging' || v === 'pro') return v;
  return null;
}

function instrumentFromString(v: string | null): 'guitar' | 'bass' | null {
  return v === 'guitar' || v === 'bass' ? v : null;
}

export function gearRowToGear(row: GearRow, activeSetup: ActiveSetup | null): Gear {
  const isActive =
    activeSetup && (row.id === activeSetup.guitarId || row.id === activeSetup.rigId)
      ? true
      : undefined;
  return {
    id: row.id,
    type: gearTypeFromString(row.type),
    brand: row.brand,
    model: row.model,
    ...(isActive ? { isActive } : {}),
  };
}

export function savedToneRowToSavedTone(row: SavedToneRow): SavedTone {
  return {
    id: row.id,
    song: row.song,
    artist: row.artist,
    partType: partTypeFromString(row.part_type),
    gearSummary: row.gear_summary,
    favorited: row.favorited,
  };
}

export function communityRowToExploreTone(row: CommunityToneRow): ExploreTone {
  return {
    id: row.id,
    song: row.song,
    artist: row.artist,
    partType: partTypeFromString(row.part_type),
    toneType: toneTypeFromString(row.tone_type),
    likes: row.likes,
    placeholderShade: row.placeholder_shade ?? '#E8E8EA',
    artworkUrl: row.artwork_url ?? '',
    artworkDominantColor: row.artwork_dominant_color ?? undefined,
    genres: (row.genres ?? []) as Genre[],
    createdAt: row.created_at,
  };
}

export function profileRowToPrefs(row: ProfileRow): TonePreferences {
  return {
    skillLevel: skillLevelFromString(row.skill_level),
    instrumentType: instrumentFromString(row.instrument_type),
    genres: (row.genres ?? []) as Genre[],
    toneHeroes: row.tone_heroes ?? [],
    notificationsEnabled: row.notifications_enabled,
  };
}

export type RecentSearch = {
  id: string;
  song: string;
  artist: string;
  artwork?: string;
};

export type HydratedUser = {
  profile: ProfileRow;
  gear: Gear[];
  activeSetup: ActiveSetup;
  savedTones: SavedTone[];
  aiTones: Record<string, ToneDetail>;
  favorites: Record<string, boolean>;
  prefs: TonePreferences;
  adaptsLeft: number;
  likedToneIds: string[];
  recentSongIds: string[];
  recentSearches: RecentSearch[];
};

function parseRecentSearches(raw: unknown): RecentSearch[] {
  if (!Array.isArray(raw)) return [];
  const out: RecentSearch[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    if (typeof r.id !== 'string' || !r.id) continue;
    out.push({
      id: r.id,
      song: typeof r.song === 'string' ? r.song : '',
      artist: typeof r.artist === 'string' ? r.artist : '',
      artwork: typeof r.artwork === 'string' ? r.artwork : undefined,
    });
  }
  return out;
}

export async function ensureProfile(args: {
  userId: string;
  email: string | null;
  name: string | null;
}): Promise<ProfileRow> {
  const { userId, email, name } = args;
  const { data: existing, error: selErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing;
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, email, name })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function hydrateUser(args: {
  userId: string;
  email: string | null;
  name: string | null;
}): Promise<HydratedUser> {
  const profile = await ensureProfile(args);
  const [
    { data: gearRows, error: gearErr },
    { data: savedRows, error: savedErr },
    { data: likedRows, error: likedErr },
  ] = await Promise.all([
    supabase.from('gear').select('*').eq('user_id', args.userId).order('created_at'),
    supabase.from('saved_tones').select('*').eq('user_id', args.userId).order('created_at', {
      ascending: false,
    }),
    supabase.from('community_tone_likes').select('tone_id').eq('user_id', args.userId),
  ]);
  if (gearErr) throw gearErr;
  if (savedErr) throw savedErr;
  if (likedErr) throw likedErr;

  const activeSetup: ActiveSetup = {
    guitarId: profile.active_guitar_id ?? '',
    rigId: profile.active_rig_id ?? '',
  };

  const gear = (gearRows ?? []).map((r) => gearRowToGear(r, activeSetup));
  const savedTones = (savedRows ?? []).map(savedToneRowToSavedTone);

  const favorites: Record<string, boolean> = {};
  const aiTones: Record<string, ToneDetail> = {};
  for (const row of savedRows ?? []) {
    if (row.favorited) favorites[row.id] = true;
    if (row.tone_detail && typeof row.tone_detail === 'object') {
      aiTones[row.id] = row.tone_detail as unknown as ToneDetail;
    }
  }

  return {
    profile,
    gear,
    activeSetup,
    savedTones,
    aiTones,
    favorites,
    prefs: profileRowToPrefs(profile),
    adaptsLeft: profile.adapts_left,
    likedToneIds: (likedRows ?? []).map((r) => r.tone_id),
    recentSongIds: profile.recent_song_ids ?? [],
    recentSearches: parseRecentSearches(profile.recent_searches),
  };
}

export async function updateProfile(
  userId: string,
  patch: Partial<Database['public']['Tables']['profiles']['Update']>
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

export async function insertGear(
  userId: string,
  gear: Omit<Gear, 'id'>
): Promise<GearRow> {
  const { data, error } = await supabase
    .from('gear')
    .insert({
      user_id: userId,
      type: gear.type,
      brand: gear.brand,
      model: gear.model,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateGearRow(
  userId: string,
  id: string,
  patch: Partial<Omit<Gear, 'id'>>
): Promise<void> {
  const { error } = await supabase
    .from('gear')
    .update({
      ...(patch.type ? { type: patch.type } : {}),
      ...(patch.brand !== undefined ? { brand: patch.brand } : {}),
      ...(patch.model !== undefined ? { model: patch.model } : {}),
    })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteGearRow(userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('gear').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}

export async function upsertSavedTone(
  userId: string,
  tone: SavedTone,
  detail?: ToneDetail | null
): Promise<void> {
  const { error } = await supabase.from('saved_tones').upsert(
    {
      id: tone.id,
      user_id: userId,
      song: tone.song,
      artist: tone.artist,
      part_type: tone.partType,
      gear_summary: tone.gearSummary ?? '',
      favorited: tone.favorited ?? false,
      tone_detail: (detail ?? null) as Json | null,
    },
    { onConflict: 'id,user_id' }
  );
  if (error) throw error;
}

export async function setSavedToneFavorited(
  userId: string,
  id: string,
  favorited: boolean
): Promise<void> {
  const { error } = await supabase
    .from('saved_tones')
    .update({ favorited })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteSavedTone(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('saved_tones')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

const GREY_SHADES = ['#E8E8EA', '#DCDCDF', '#D2D2D6', '#C8C8CC', '#BFBFC4', '#E2E2E5', '#D7D7DB'];

/**
 * Publish a tone into the shared community_tones catalog so it bubbles up on
 * the "New" filter for everyone. Idempotent on the song id — if it already
 * exists, the original created_at and ranking are preserved.
 */
export async function publishCommunityTone(args: {
  id: string;
  song: string;
  artist: string;
  partType?: PartType;
  toneType?: ToneType;
  artwork?: string;
}): Promise<void> {
  const song = args.song.trim();
  const artist = args.artist.trim();
  if (!args.id || !song || !artist) return;
  const placeholder = GREY_SHADES[Math.floor(Math.random() * GREY_SHADES.length)];
  const { error } = await supabase.from('community_tones').insert({
    id: args.id,
    song,
    artist,
    part_type: args.partType ?? 'Riff',
    tone_type: args.toneType ?? 'Clean',
    artwork_url: args.artwork ?? null,
    placeholder_shade: placeholder,
  });
  // 23505 = already published, treat as success.
  if (error && (error as { code?: string }).code !== '23505') throw error;
}

export async function fetchCommunityTones(): Promise<ExploreTone[]> {
  // No default order — the explore screen sorts client-side based on the
  // selected filter (Trending → by likes, New → by created_at).
  const { data, error } = await supabase.from('community_tones').select('*');
  if (error) throw error;
  return (data ?? []).map(communityRowToExploreTone);
}

export async function fetchSongDetailFromCache(
  id: string
): Promise<OriginalSongDetail | null> {
  const { data, error } = await supabase
    .from('song_details')
    .select('detail')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return data.detail as unknown as OriginalSongDetail;
}

export async function fetchLikedToneIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('community_tone_likes')
    .select('tone_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.tone_id);
}

export async function setToneLiked(
  userId: string,
  toneId: string,
  liked: boolean
): Promise<void> {
  if (liked) {
    const { error } = await supabase
      .from('community_tone_likes')
      .insert({ user_id: userId, tone_id: toneId });
    // 23505 = already-liked race, treat as success
    if (error && (error as { code?: string }).code !== '23505') throw error;
  } else {
    const { error } = await supabase
      .from('community_tone_likes')
      .delete()
      .eq('user_id', userId)
      .eq('tone_id', toneId);
    if (error) throw error;
  }
}

// Removed: cacheSongDetail. The research-song edge function writes the cache
// row using its service-role key — clients no longer insert into song_details
// (the table's INSERT policy is service-role-only to prevent cache poisoning).
