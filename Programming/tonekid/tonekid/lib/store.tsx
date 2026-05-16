import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import type { Session } from '@supabase/supabase-js';

import {
  deleteGearRow,
  deleteSavedTone as deleteSavedToneRow,
  hydrateUser,
  insertGear,
  publishCommunityTone,
  setSavedToneFavorited,
  setToneLiked,
  updateGearRow,
  updateProfile,
  upsertSavedTone,
  type RecentSearch,
} from './db';
import { useRevenueCat } from './revenuecat';
import { supabase } from './supabase';
import { cancelTrialNotifications } from './trialNotifications';
import type {
  ActiveSetup,
  Gear,
  GearType,
  Genre,
  SavedTone,
  SkillLevel,
  ToneDetail,
  TonePreferences,
} from './types';

export type SortKey = 'recent' | 'artist' | 'song';

export type AuthResult = { ok: true } | { ok: false; error: string };

type AppState = {
  hydrated: boolean;
  authReady: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  memberSince: string | null;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (args: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthResult & { requiresEmailConfirmation?: boolean }>;
  signInWithApple: () => Promise<AuthResult>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<AuthResult>;
  refreshUserData: () => Promise<void>;
  onboardingCompleted: boolean;
  completeOnboarding: () => Promise<void>;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  isPro: boolean;
  devProOverride: boolean;
  setDevProOverride: (v: boolean) => void;
  gear: Gear[];
  addGear: (g: Omit<Gear, 'id'>) => Promise<void>;
  updateGear: (id: string, patch: Partial<Omit<Gear, 'id'>>) => Promise<void>;
  removeGear: (id: string) => Promise<void>;
  activeSetup: ActiveSetup;
  setActiveSetup: (s: ActiveSetup) => Promise<void>;
  savedTones: SavedTone[];
  addSavedTone: (
    t: SavedTone,
    hints?: { artwork?: string; toneType?: 'Clean' | 'Distorted' }
  ) => Promise<void>;
  removeSavedTone: (id: string) => Promise<void>;
  favorites: Record<string, boolean>;
  toggleFavorite: (id: string) => Promise<void>;
  adaptsLeft: number;
  consumeAdapt: () => void;
  prefs: TonePreferences;
  setSkillLevel: (s: SkillLevel) => Promise<void>;
  setInstrumentType: (t: 'guitar' | 'bass') => Promise<void>;
  setGenres: (g: Genre[]) => Promise<void>;
  setToneHeroes: (h: string[]) => Promise<void>;
  setNotificationsEnabled: (v: boolean) => Promise<void>;
  aiTones: Record<string, ToneDetail>;
  addAiTone: (t: ToneDetail) => void;
  generatingTones: Record<string, boolean>;
  setGenerating: (id: string, value: boolean) => void;
  savedSort: SortKey;
  setSavedSort: (k: SortKey) => void;
  recentSongIds: string[];
  recentSearches: RecentSearch[];
  trackSongView: (input: string | { id: string; song?: string; artist?: string; artwork?: string }) => void;
  likedToneIds: string[];
  toggleCommunityLike: (toneId: string) => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = 'tonekid:cache:v2';

type PersistedShape = {
  userId: string | null;
  gear: Gear[];
  activeSetup: ActiveSetup;
  savedTones: SavedTone[];
  favorites: Record<string, boolean>;
  adaptsLeft: number;
  aiTones: Record<string, ToneDetail>;
  prefs: TonePreferences;
  savedSort: SortKey;
  recentSongIds?: string[];
  recentSearches?: RecentSearch[];
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  devProOverride?: boolean;
};

const DEFAULT_PREFS: TonePreferences = {
  skillLevel: null,
  instrumentType: null,
  genres: [],
  toneHeroes: [],
  notificationsEnabled: false,
};

const EMPTY_ACTIVE_SETUP: ActiveSetup = { guitarId: '', rigId: '' };

function errMsg(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message;
  }
  return fallback;
}

function recomputeActiveFlags(gear: Gear[], setup: ActiveSetup): Gear[] {
  return gear.map((g) => ({
    ...g,
    isActive: g.id === setup.guitarId || g.id === setup.rigId ? true : undefined,
  }));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { isPro: rcIsPro, identify, logOut: rcLogOut } = useRevenueCat();
  const [devProOverride, setDevProOverrideState] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [gear, setGear] = useState<Gear[]>([]);
  const [activeSetup, setActiveSetupLocal] = useState<ActiveSetup>(EMPTY_ACTIVE_SETUP);
  const [savedTones, setSavedTones] = useState<SavedTone[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [adaptsLeft, setAdaptsLeft] = useState(3);
  const [aiTones, setAiTones] = useState<Record<string, ToneDetail>>({});
  const [prefs, setPrefs] = useState<TonePreferences>(DEFAULT_PREFS);
  const [savedSort, setSavedSort] = useState<SortKey>('recent');
  const [recentSongIds, setRecentSongIds] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [likedToneIds, setLikedToneIds] = useState<string[]>([]);
  const [generatingTones, setGeneratingTones] = useState<Record<string, boolean>>({});
  const [userName, setUserName] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [onboardingStep, setOnboardingStepState] = useState(1);

  const userId = session?.user.id ?? null;
  const userEmail = session?.user.email ?? null;
  const isAuthenticated = Boolean(userId);

  // Restore cached state for instant first paint while Supabase resolves.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const data = JSON.parse(raw) as Partial<PersistedShape>;
          if (Array.isArray(data.gear)) setGear(data.gear);
          if (data.activeSetup) setActiveSetupLocal(data.activeSetup);
          if (Array.isArray(data.savedTones)) setSavedTones(data.savedTones);
          if (data.favorites) setFavorites(data.favorites);
          if (typeof data.adaptsLeft === 'number') setAdaptsLeft(data.adaptsLeft);
          if (data.aiTones) setAiTones(data.aiTones);
          if (data.prefs) setPrefs({ ...DEFAULT_PREFS, ...data.prefs });
          if (data.savedSort === 'recent' || data.savedSort === 'artist' || data.savedSort === 'song') {
            setSavedSort(data.savedSort);
          }
          if (Array.isArray(data.recentSongIds)) {
            setRecentSongIds(data.recentSongIds.filter((s): s is string => typeof s === 'string'));
          }
          if (Array.isArray(data.recentSearches)) {
            const valid = (data.recentSearches as unknown[])
              .filter((r): r is RecentSearch => Boolean(r) && typeof r === 'object' && typeof (r as { id?: unknown }).id === 'string');
            setRecentSearches(valid);
          }
          if (typeof data.onboardingCompleted === 'boolean') {
            setOnboardingCompleted(data.onboardingCompleted);
          }
          if (typeof data.onboardingStep === 'number' && data.onboardingStep >= 1) {
            setOnboardingStepState(Math.floor(data.onboardingStep));
          }
          if (__DEV__ && typeof data.devProOverride === 'boolean') {
            setDevProOverrideState(data.devProOverride);
          }
        }
      } catch {
        // ignore — fall back to defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Subscribe to Supabase auth state.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        setSession(data.session ?? null);
        setAuthReady(true);
      }
    })();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  // When the session changes, hydrate from DB and tie RevenueCat to the user.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!session?.user) {
        // Logged out → reset local state but keep splash quick.
        setGear([]);
        setActiveSetupLocal(EMPTY_ACTIVE_SETUP);
        setSavedTones([]);
        setFavorites({});
        setAdaptsLeft(3);
        setAiTones({});
        setPrefs(DEFAULT_PREFS);
        setUserName(null);
        setMemberSince(null);
        setOnboardingCompleted(false);
        setRecentSongIds([]);
        setRecentSearches([]);
        setLikedToneIds([]);
        setHydrated(true);
        return;
      }
      // Mark unhydrated so the Splash screen waits for fresh DB state before
      // routing. Without this, the previous logout left hydrated=true, so the
      // Splash would route on stale (reset) state and the user would land on
      // /onboarding/1 even though the DB has onboarding_completed=true.
      setHydrated(false);
      try {
        await identify(session.user.id);
        const data = await hydrateUser({
          userId: session.user.id,
          email: session.user.email ?? null,
          name: (session.user.user_metadata?.name as string | undefined) ?? null,
        });
        if (cancelled) return;
        setGear(recomputeActiveFlags(data.gear, data.activeSetup));
        setActiveSetupLocal(data.activeSetup);
        setSavedTones(data.savedTones);
        setFavorites(data.favorites);
        setAdaptsLeft(data.adaptsLeft);
        setAiTones(data.aiTones);
        setPrefs(data.prefs);
        setUserName(data.profile.name ?? (session.user.user_metadata?.name as string | undefined) ?? null);
        setMemberSince(data.profile.member_since);
        // Onboarding is sticky: once true (locally or remotely), never silently
        // flip back to false. The DB is authoritative when it says true; when
        // it says false, trust the local cache in case a previous completion
        // hasn't synced yet (e.g. completeOnboarding write failed offline).
        setOnboardingCompleted((prev) => {
          const remote = data.profile.onboarding_completed === true;
          const next = remote || prev;
          // Self-heal: if local says we're done but the DB hasn't recorded it,
          // try to write it through. Best-effort, ignored on failure.
          if (next && !remote) {
            updateProfile(session.user.id, { onboarding_completed: true }).catch(() => {});
          }
          return next;
        });
        setLikedToneIds(data.likedToneIds);
        // Merge DB history with whatever is already in local cache so we don't
        // lose entries the user accumulated offline. DB order wins for entries
        // that exist on both sides.
        setRecentSongIds((prev) => {
          const seen = new Set<string>();
          const merged: string[] = [];
          for (const id of data.recentSongIds) {
            if (!seen.has(id)) {
              merged.push(id);
              seen.add(id);
            }
          }
          for (const id of prev) {
            if (!seen.has(id)) {
              merged.push(id);
              seen.add(id);
            }
          }
          return merged.slice(0, 20);
        });
        setRecentSearches((prev) => {
          const byId = new Map<string, RecentSearch>();
          for (const r of data.recentSearches) byId.set(r.id, r);
          for (const r of prev) if (!byId.has(r.id)) byId.set(r.id, r);
          return Array.from(byId.values()).slice(0, 40);
        });
      } catch (e) {
        if (__DEV__) console.log('[store] hydrate failed', e);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, identify]);

  // Cache state locally for instant paint on next launch.
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      const payload: PersistedShape = {
        userId,
        gear,
        activeSetup,
        savedTones,
        favorites,
        adaptsLeft,
        aiTones,
        prefs,
        savedSort,
        recentSongIds,
        recentSearches,
        onboardingCompleted,
        onboardingStep,
        devProOverride: __DEV__ ? devProOverride : undefined,
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
    }, 200);
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [
    hydrated,
    userId,
    gear,
    activeSetup,
    savedTones,
    favorites,
    adaptsLeft,
    aiTones,
    prefs,
    savedSort,
    recentSongIds,
    recentSearches,
    onboardingCompleted,
    onboardingStep,
    devProOverride,
  ]);

  // -------------------- Auth --------------------
  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    []
  );

  const signUpWithEmail = useCallback(
    async ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }): Promise<AuthResult & { requiresEmailConfirmation?: boolean }> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) return { ok: false, error: error.message };
      // Supabase returns a user without a session when email confirmation is on.
      const requiresEmailConfirmation = Boolean(data.user && !data.session);
      return { ok: true, requiresEmailConfirmation };
    },
    []
  );

  const sendPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const signInWithApple = useCallback(async (): Promise<AuthResult> => {
    if (Platform.OS !== 'ios') {
      return { ok: false, error: 'Apple Sign In is only available on iOS.' };
    }
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) return { ok: false, error: 'Apple Sign In is not available on this device.' };

      // Nonce-bound flow: Apple receives the SHA-256 hash; Supabase receives
      // the raw nonce and verifies it matches the hash inside the JWT. Prevents
      // identity-token replay between sessions.
      const rawNonce = Array.from(Crypto.getRandomBytes(32))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      if (!credential.identityToken) {
        return { ok: false, error: 'No identity token returned from Apple.' };
      }
      const name = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName]
            .filter(Boolean)
            .join(' ')
            .trim()
        : '';
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      });
      if (error) return { ok: false, error: error.message };
      if (name) {
        // Apple only returns the name on the very first authentication — capture it if present.
        await supabase.auth.updateUser({ data: { name } });
      }
      return { ok: true };
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === 'ERR_REQUEST_CANCELED') return { ok: false, error: 'cancelled' };
      return { ok: false, error: errMsg(e, 'Apple Sign In failed') };
    }
  }, []);

  const signOut = useCallback(async () => {
    await rcLogOut();
    await cancelTrialNotifications();
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, [rcLogOut]);

  const refreshUserData = useCallback(async () => {
    if (!session?.user) return;
    try {
      const data = await hydrateUser({
        userId: session.user.id,
        email: session.user.email ?? null,
        name: (session.user.user_metadata?.name as string | undefined) ?? null,
      });
      setGear(recomputeActiveFlags(data.gear, data.activeSetup));
      setActiveSetupLocal(data.activeSetup);
      setSavedTones(data.savedTones);
      setFavorites(data.favorites);
      setAdaptsLeft(data.adaptsLeft);
      setAiTones((prev) => ({ ...prev, ...data.aiTones }));
      setPrefs(data.prefs);
      setUserName(
        data.profile.name ?? (session.user.user_metadata?.name as string | undefined) ?? null
      );
      setMemberSince(data.profile.member_since);
      setOnboardingCompleted((prev) =>
        data.profile.onboarding_completed === true ? true : prev
      );
      setLikedToneIds(data.likedToneIds);
      setRecentSongIds(data.recentSongIds);
      setRecentSearches(data.recentSearches);
    } catch (e) {
      if (__DEV__) console.log('[store] refresh failed', e);
    }
  }, [session]);

  const deleteAccount = useCallback(async (): Promise<AuthResult> => {
    const { data, error } = await supabase.functions.invoke<{ ok?: boolean; error?: string }>(
      'delete-account',
      { body: {} }
    );
    if (error) return { ok: false, error: error.message || 'Could not delete account' };
    if (!data?.ok) return { ok: false, error: data?.error || 'Could not delete account' };
    // Clean up local state — the auth row is already gone server-side.
    await rcLogOut();
    await cancelTrialNotifications();
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(STORAGE_KEY);
    return { ok: true };
  }, [rcLogOut]);

  const toggleCommunityLike = useCallback(
    async (toneId: string) => {
      if (!userId || !toneId) return;
      const wasLiked = likedToneIds.includes(toneId);
      const nextLiked = !wasLiked;
      // Optimistic local update.
      setLikedToneIds((prev) =>
        nextLiked ? [...prev, toneId] : prev.filter((id) => id !== toneId)
      );
      try {
        await setToneLiked(userId, toneId, nextLiked);
      } catch (e) {
        // Roll back on failure.
        setLikedToneIds((prev) =>
          nextLiked ? prev.filter((id) => id !== toneId) : [...prev, toneId]
        );
        if (__DEV__) console.log('[store] toggleCommunityLike failed', e);
      }
    },
    [userId, likedToneIds]
  );

  const trackSongView = useCallback(
    (input: string | { id: string; song?: string; artist?: string; artwork?: string }) => {
      const meta = typeof input === 'string' ? { id: input } : input;
      if (!meta.id) return;

      let nextIds: string[] = [];
      let nextSearches: RecentSearch[] = [];

      setRecentSongIds((prev) => {
        const without = prev.filter((s) => s !== meta.id);
        nextIds = [meta.id, ...without].slice(0, 20);
        return nextIds;
      });

      // If the caller passed metadata (typical for iTunes-search adapts), keep
      // a copy so the For You grid can render a card even though the song
      // isn't in the community catalog. Merge with any existing entry so a
      // later call without an artwork URL doesn't clobber an earlier one
      // that had it.
      if (meta.song || meta.artist || meta.artwork) {
        setRecentSearches((prev) => {
          const existing = prev.find((r) => r.id === meta.id);
          const without = prev.filter((r) => r.id !== meta.id);
          nextSearches = [
            {
              id: meta.id,
              song: meta.song || existing?.song || '',
              artist: meta.artist || existing?.artist || '',
              artwork: meta.artwork ?? existing?.artwork,
            },
            ...without,
          ].slice(0, 40);
          return nextSearches;
        });
      } else {
        nextSearches = recentSearches;
      }

      if (userId) {
        const patch: { recent_song_ids: string[]; recent_searches?: RecentSearch[] } = {
          recent_song_ids: nextIds,
        };
        if (meta.song || meta.artist || meta.artwork) {
          patch.recent_searches = nextSearches;
        }
        updateProfile(userId, patch).catch(() => {});
      }
    },
    [userId, recentSearches]
  );

  const setDevProOverride = useCallback(
    (v: boolean) => {
      if (!__DEV__) return;
      setDevProOverrideState(v);
      // Mirror the override on the server so the adapt-tone Edge Function
      // doesn't 402 us. This is a no-op in production builds.
      if (userId) {
        updateProfile(userId, {
          tier: v ? 'pro' : 'free',
          adapts_left: v ? 999 : 3,
        }).catch(() => {});
      }
    },
    [userId]
  );

  const setOnboardingStep = useCallback((step: number) => {
    setOnboardingStepState(Math.max(1, Math.floor(step)));
  }, []);

  const completeOnboarding = useCallback(async () => {
    setOnboardingCompleted(true);
    setOnboardingStepState(1);
    if (!userId) return;
    try {
      await updateProfile(userId, { onboarding_completed: true });
    } catch (e) {
      if (__DEV__) console.log('[store] completeOnboarding failed', e);
    }
  }, [userId]);

  // -------------------- Gear --------------------
  const addGear = useCallback(
    async (g: Omit<Gear, 'id'>) => {
      if (!userId) return;
      const row = await insertGear(userId, g);
      setGear((prev) => recomputeActiveFlags([...prev, { id: row.id, type: g.type, brand: g.brand, model: g.model }], activeSetup));
    },
    [userId, activeSetup]
  );

  const updateGear = useCallback(
    async (id: string, patch: Partial<Omit<Gear, 'id'>>) => {
      if (!userId) return;
      await updateGearRow(userId, id, patch);
      setGear((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    },
    [userId]
  );

  const removeGear = useCallback(
    async (id: string) => {
      if (!userId) return;
      const isActiveGuitar = activeSetup.guitarId === id;
      const isActiveRig = activeSetup.rigId === id;
      if (isActiveGuitar || isActiveRig) {
        const next: ActiveSetup = {
          guitarId: isActiveGuitar ? '' : activeSetup.guitarId,
          rigId: isActiveRig ? '' : activeSetup.rigId,
        };
        await updateProfile(userId, {
          active_guitar_id: next.guitarId || null,
          active_rig_id: next.rigId || null,
        });
        setActiveSetupLocal(next);
      }
      await deleteGearRow(userId, id);
      setGear((prev) => prev.filter((g) => g.id !== id));
    },
    [userId, activeSetup]
  );

  const setActiveSetup = useCallback(
    async (s: ActiveSetup) => {
      if (!userId) return;
      await updateProfile(userId, {
        active_guitar_id: s.guitarId || null,
        active_rig_id: s.rigId || null,
      });
      setActiveSetupLocal(s);
      setGear((prev) => recomputeActiveFlags(prev, s));
    },
    [userId]
  );

  // -------------------- Saved tones --------------------
  const addSavedTone = useCallback(
    async (
      t: SavedTone,
      hints?: { artwork?: string; toneType?: 'Clean' | 'Distorted' }
    ) => {
      if (!userId) return;
      const detail = aiTones[t.id] ?? null;
      await upsertSavedTone(userId, t, detail);
      setSavedTones((prev) => {
        const without = prev.filter((p) => p.id !== t.id);
        return [t, ...without];
      });
      // Saving counts as engagement — surface it in the For You history.
      // Reuse trackSongView so we also keep the metadata cache populated for
      // songs that aren't in the community catalog (iTunes-searched songs).
      const detailArtwork =
        detail && typeof detail === 'object' && 'artworkUrl' in detail
          ? ((detail as { artworkUrl?: string }).artworkUrl ?? undefined)
          : undefined;
      const artwork = hints?.artwork || detailArtwork;
      trackSongView({
        id: t.id,
        song: t.song,
        artist: t.artist,
        artwork,
      });
      // Publish to the shared community catalog so it bubbles up under "New"
      // for everyone. Idempotent on song id — already-published songs no-op.
      publishCommunityTone({
        id: t.id,
        song: t.song,
        artist: t.artist,
        partType: t.partType,
        toneType: hints?.toneType,
        artwork,
      }).catch(() => {});
    },
    [userId, aiTones, trackSongView]
  );

  const removeSavedTone = useCallback(
    async (id: string) => {
      if (!userId) return;
      await deleteSavedToneRow(userId, id);
      setSavedTones((prev) => prev.filter((t) => t.id !== id));
      setFavorites((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [userId]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      if (!userId) return;
      const next = !favorites[id];
      setFavorites((prev) => ({ ...prev, [id]: next }));
      setSavedTones((prev) => prev.map((t) => (t.id === id ? { ...t, favorited: next } : t)));
      try {
        await setSavedToneFavorited(userId, id, next);
      } catch (e) {
        // Revert on failure.
        setFavorites((prev) => ({ ...prev, [id]: !next }));
        setSavedTones((prev) => prev.map((t) => (t.id === id ? { ...t, favorited: !next } : t)));
        if (__DEV__) console.log('[store] toggleFavorite failed', e);
      }
    },
    [userId, favorites]
  );

  // -------------------- Adapts + AI tones --------------------
  // Server-authoritative: the adapt-tone Edge Function decrements profiles.adapts_left
  // when it runs. Here we just mirror that locally for instant UI feedback.
  const consumeAdapt = useCallback(() => {
    setAdaptsLeft((n) => Math.max(0, n - 1));
  }, []);

  const addAiTone = useCallback((t: ToneDetail) => {
    setAiTones((prev) => ({ ...prev, [t.id]: t }));
  }, []);

  const setGenerating = useCallback((id: string, value: boolean) => {
    setGeneratingTones((prev) => {
      if (value) return { ...prev, [id]: true };
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  // -------------------- Prefs --------------------
  const persistPrefPatch = useCallback(
    async (
      next: TonePreferences,
      patch: Partial<{
        skill_level: string | null;
        instrument_type: string | null;
        genres: string[];
        tone_heroes: string[];
        notifications_enabled: boolean;
      }>
    ) => {
      setPrefs(next);
      if (!userId) return;
      try {
        await updateProfile(userId, patch);
      } catch (e) {
        if (__DEV__) console.log('[store] persistPrefPatch failed', e);
      }
    },
    [userId]
  );

  const setSkillLevel = useCallback(
    async (s: SkillLevel) => {
      await persistPrefPatch({ ...prefs, skillLevel: s }, { skill_level: s });
    },
    [persistPrefPatch, prefs]
  );

  const setInstrumentType = useCallback(
    async (t: 'guitar' | 'bass') => {
      await persistPrefPatch({ ...prefs, instrumentType: t }, { instrument_type: t });
    },
    [persistPrefPatch, prefs]
  );

  const setGenres = useCallback(
    async (g: Genre[]) => {
      await persistPrefPatch({ ...prefs, genres: g }, { genres: g });
    },
    [persistPrefPatch, prefs]
  );

  const setToneHeroes = useCallback(
    async (h: string[]) => {
      await persistPrefPatch({ ...prefs, toneHeroes: h }, { tone_heroes: h });
    },
    [persistPrefPatch, prefs]
  );

  const setNotificationsEnabled = useCallback(
    async (v: boolean) => {
      await persistPrefPatch({ ...prefs, notificationsEnabled: v }, { notifications_enabled: v });
    },
    [persistPrefPatch, prefs]
  );

  const value = useMemo<AppState>(
    () => ({
      hydrated,
      authReady,
      isAuthenticated,
      userId,
      userEmail,
      userName,
      memberSince,
      signInWithEmail,
      signUpWithEmail,
      signInWithApple,
      sendPasswordReset,
      signOut,
      deleteAccount,
      refreshUserData,
      onboardingCompleted,
      completeOnboarding,
      onboardingStep,
      setOnboardingStep,
      isPro: rcIsPro || (__DEV__ && devProOverride),
      devProOverride,
      setDevProOverride,
      gear,
      addGear,
      updateGear,
      removeGear,
      activeSetup,
      setActiveSetup,
      savedTones,
      addSavedTone,
      removeSavedTone,
      favorites,
      toggleFavorite,
      adaptsLeft,
      consumeAdapt,
      prefs,
      setSkillLevel,
      setInstrumentType,
      setGenres,
      setToneHeroes,
      setNotificationsEnabled,
      aiTones,
      addAiTone,
      generatingTones,
      setGenerating,
      savedSort,
      setSavedSort,
      recentSongIds,
      recentSearches,
      trackSongView,
      likedToneIds,
      toggleCommunityLike,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      hydrated,
      authReady,
      isAuthenticated,
      userId,
      userEmail,
      userName,
      memberSince,
      signInWithEmail,
      signUpWithEmail,
      signInWithApple,
      sendPasswordReset,
      signOut,
      deleteAccount,
      refreshUserData,
      onboardingCompleted,
      completeOnboarding,
      onboardingStep,
      setOnboardingStep,
      rcIsPro,
      devProOverride,
      setDevProOverride,
      gear,
      addGear,
      updateGear,
      removeGear,
      activeSetup,
      setActiveSetup,
      savedTones,
      addSavedTone,
      removeSavedTone,
      favorites,
      toggleFavorite,
      adaptsLeft,
      consumeAdapt,
      prefs,
      setSkillLevel,
      setInstrumentType,
      setGenres,
      setToneHeroes,
      setNotificationsEnabled,
      aiTones,
      addAiTone,
      generatingTones,
      setGenerating,
      savedSort,
      recentSongIds,
      recentSearches,
      trackSongView,
      likedToneIds,
      toggleCommunityLike,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function gearCountByType(gear: Gear[], type: GearType): number {
  return gear.filter((g) => g.type === type).length;
}
