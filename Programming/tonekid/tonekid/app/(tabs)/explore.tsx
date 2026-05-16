import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Heart, Leaf, Sparkles, Zap } from 'lucide-react-native';

import { Pill, SearchInput, ToneCardSkeleton } from '@/components/ui';
import { colors } from '@/constants/tokens';
import { fetchCommunityTones } from '@/lib/db';
import { exploreTones as fallbackTones } from '@/lib/mockData';
import type { ITunesTrack } from '@/lib/musicSearch';
import { useApp } from '@/lib/store';
import type { ExploreTone } from '@/lib/types';
import { useSongSearch } from '@/lib/useSongSearch';

type Filter = 'For You' | 'Trending' | 'New' | 'Clean' | 'Distorted';

const FILTERS: { label: Filter; Icon: typeof Flame }[] = [
  { label: 'Trending', Icon: Flame },
  { label: 'New', Icon: Sparkles },
  { label: 'Clean', Icon: Leaf },
  { label: 'Distorted', Icon: Zap },
];

export default function ExploreScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const { prefs, recentSongIds, recentSearches, savedTones } = useApp();
  const hasGenres = prefs.genres.length > 0;
  const hasRecent = recentSongIds.length > 0;
  const [filter, setFilter] = useState<Filter>(
    hasRecent || hasGenres ? 'For You' : 'Trending'
  );
  const [query, setQuery] = useState(params.q ?? '');
  const [tones, setTones] = useState<ExploreTone[]>([]);
  const [tonesLoading, setTonesLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTones = useCallback(async () => {
    try {
      const rows = await fetchCommunityTones();
      setTones(rows.length ? rows : fallbackTones);
    } catch {
      setTones(fallbackTones);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadTones();
      if (!cancelled) setTonesLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadTones]);

  // Re-fetch the community catalog whenever the user's saved set grows, so the
  // song they just saved (and published to community_tones) appears under New.
  const savedCount = savedTones.length;
  const lastSavedCount = useRef(savedCount);
  useEffect(() => {
    if (savedCount > lastSavedCount.current) {
      loadTones();
    }
    lastSavedCount.current = savedCount;
  }, [savedCount, loadTones]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTones();
    setRefreshing(false);
  }, [loadTones]);
  useEffect(() => {
    if (params.q && params.q !== query) setQuery(params.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q]);
  const searching = query.trim().length >= 2;
  const { loading, results, error } = useSongSearch(query);

  const curated = useMemo(() => {
    if (filter === 'For You') {
      // For You = your recently-viewed songs (most recent first) followed by
      // trending songs that aren't already in the history. Songs that come
      // from iTunes search (not in the community catalog) get rendered from
      // the recentSearches metadata cache.
      const byId = new Map(tones.map((t) => [t.id, t]));
      const searchById = new Map(recentSearches.map((r) => [r.id, r]));
      const seen = new Set<string>();
      const history: ExploreTone[] = [];
      const greyShades = ['#E8E8EA', '#DCDCDF', '#D2D2D6', '#C8C8CC', '#BFBFC4'];
      for (const id of recentSongIds) {
        if (seen.has(id)) continue;
        const t = byId.get(id);
        if (t) {
          history.push(t);
          seen.add(id);
          continue;
        }
        const r = searchById.get(id);
        if (r) {
          // Synthesize a minimal ExploreTone so the grid can render the card.
          history.push({
            id: r.id,
            song: r.song || 'Untitled',
            artist: r.artist || 'Unknown',
            partType: 'Riff',
            toneType: 'Clean',
            likes: 0,
            placeholderShade: greyShades[history.length % greyShades.length],
            artworkUrl: r.artwork ?? '',
          });
          seen.add(id);
        }
      }

      const trendingTail = tones.filter((t) => !seen.has(t.id));
      const userGenres = new Set(prefs.genres);
      const genreScore = (t: ExploreTone) =>
        (t.genres ?? []).reduce((n, g) => n + (userGenres.has(g) ? 1 : 0), 0);
      trendingTail.sort((a, b) => {
        if (hasGenres) {
          const diff = genreScore(b) - genreScore(a);
          if (diff !== 0) return diff;
        }
        const likeDiff = (b.likes ?? 0) - (a.likes ?? 0);
        if (likeDiff !== 0) return likeDiff;
        return a.id.localeCompare(b.id);
      });

      return [...history, ...trendingTail];
    }

    let list = tones;
    if (filter === 'Clean') {
      list = list.filter((t) => t.toneType === 'Clean');
    } else if (filter === 'Distorted') {
      list = list.filter((t) => t.toneType === 'Distorted');
    }

    if (filter === 'New') {
      list = [...list].sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
        const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
        if (tb !== ta) return tb - ta;
        return a.id.localeCompare(b.id);
      });
    } else {
      // Trending / Clean / Distorted → most-liked first.
      list = [...list].sort((a, b) => {
        const diff = (b.likes ?? 0) - (a.likes ?? 0);
        if (diff !== 0) return diff;
        return a.id.localeCompare(b.id);
      });
    }

    return list;
  }, [filter, hasGenres, prefs.genres, tones, recentSongIds, recentSearches]);

  // SearchInput is rendered as a sibling above the FlatList (NOT inside
  // ListHeaderComponent) so it stays mounted when `searching` flips and
  // we swap which list is rendered below — otherwise iOS drops keyboard focus.
  const stickyTop = (
    <>
      <View className="px-5 pb-3 pt-2">
        <Text className="text-ink text-[36px] font-extrabold tracking-tight">Explore</Text>
      </View>
      <View className="px-5">
        <SearchInput
          placeholder="Search songs, artists..."
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
    </>
  );

  const browseHeader = (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}>
        {hasGenres || hasRecent ? (
          <Pill
            label="For You"
            variant={filter === 'For You' ? 'selected' : 'filled'}
            onPress={() => setFilter('For You')}
            leftIcon={
              <Heart
                size={14}
                color={filter === 'For You' ? '#FFFFFF' : colors.ink}
                fill={filter === 'For You' ? '#FFFFFF' : 'transparent'}
              />
            }
          />
        ) : null}
        {FILTERS.map(({ label, Icon }) => {
          const selected = label === filter;
          return (
            <Pill
              key={label}
              label={label}
              variant={selected ? 'selected' : 'filled'}
              onPress={() => setFilter(label)}
              leftIcon={
                <Icon
                  size={14}
                  color={selected ? '#FFFFFF' : colors.ink}
                  fill={label === 'Trending' && selected ? '#FFFFFF' : 'transparent'}
                />
              }
            />
          );
        })}
      </ScrollView>
    </>
  );

  const searchHeader = (
    <View className="px-5 pb-3 pt-3 flex-row items-center justify-between">
      <Text className="text-ink-muted text-xs">
        {loading
          ? 'Searching...'
          : error
            ? 'Could not reach iTunes. Check connection.'
            : `${results.length} result${results.length === 1 ? '' : 's'} for "${query.trim()}"`}
      </Text>
      {loading ? <ActivityIndicator size="small" color={colors.ink} /> : null}
    </View>
  );

  const placeholders = Array.from({ length: 8 }, (_, i) => `s${i}`);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      {stickyTop}
      {searching ? (
        <FlatList
          key="search"
          data={results}
          keyExtractor={(t) => t.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
          contentContainerStyle={{ paddingBottom: 120, gap: 12 }}
          ListHeaderComponent={searchHeader}
          ListEmptyComponent={
            !loading && !error ? (
              <View className="items-center px-5 pt-10">
                <Text className="text-ink-muted text-sm">No songs matched.</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => <SearchResultCard track={item} />}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        />
      ) : tonesLoading ? (
        <FlatList
          key="loading"
          data={placeholders}
          keyExtractor={(k) => k}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
          contentContainerStyle={{ paddingBottom: 120, gap: 12 }}
          ListHeaderComponent={browseHeader}
          renderItem={() => <ToneCardSkeleton />}
          scrollEnabled={false}
        />
      ) : (
        <FlatList
          key="browse"
          data={curated}
          keyExtractor={(t) => t.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
          contentContainerStyle={{ paddingBottom: 120, gap: 12 }}
          ListHeaderComponent={browseHeader}
          renderItem={({ item }) => <ToneCard tone={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />
          }
        />
      )}
    </SafeAreaView>
  );
}

function ToneCard({ tone }: { tone: ExploreTone }) {
  const { savedTones, addSavedTone, removeSavedTone, likedToneIds, toggleCommunityLike } = useApp();
  const saved = savedTones.some((t) => t.id === tone.id);
  const liked = likedToneIds.includes(tone.id);

  const onToggle = async () => {
    if (saved) {
      await removeSavedTone(tone.id);
    } else {
      await addSavedTone(
        {
          id: tone.id,
          song: tone.song,
          artist: tone.artist,
          partType: tone.partType,
          gearSummary: '',
        },
        { artwork: tone.artworkUrl }
      );
    }
    // Mirror the community like so the heart and the trending counter stay in sync.
    if (saved === liked) {
      // saved=true,liked=true → about to remove both
      // saved=false,liked=false → about to add both
      toggleCommunityLike(tone.id);
    }
  };

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/song/[id]',
          params: {
            id: tone.id,
            title: tone.song,
            artist: tone.artist,
            artwork: tone.artworkUrl,
          },
        })
      }
      className="bg-surface flex-1 overflow-hidden rounded-2xl">
      {({ pressed }) => (
        <View style={{ opacity: pressed ? 0.85 : 1 }}>
          <View
            style={{ aspectRatio: 1, backgroundColor: tone.placeholderShade }}
            className="w-full">
            <Image
              source={{ uri: tone.artworkUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={150}
            />
            <View
              pointerEvents="none"
              className="absolute bottom-2 left-2 self-start rounded-full bg-black/70 px-2 py-1">
              <Text className="text-white text-[10px] font-semibold">{tone.toneType}</Text>
            </View>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              hitSlop={8}
              className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-black/40">
              <Heart
                size={14}
                color="#FFFFFF"
                fill={saved ? '#FFFFFF' : 'transparent'}
                strokeWidth={2.2}
              />
            </Pressable>
          </View>
          <View className="p-3">
            <Text className="text-ink text-[15px] font-bold" numberOfLines={1}>
              {tone.song}
            </Text>
            <Text className="text-ink-muted mt-0.5 text-[13px]" numberOfLines={1}>
              {tone.artist}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

function SearchResultCard({ track }: { track: ITunesTrack }) {
  const onPress = () => {
    router.push({
      pathname: '/song/[id]',
      params: {
        id: track.id,
        title: track.song,
        artist: track.artist,
        album: track.album,
        year: track.year ?? '',
        artwork: track.artworkUrl,
      },
    });
  };
  return (
    <Pressable onPress={onPress} className="bg-surface flex-1 overflow-hidden rounded-2xl">
      {({ pressed }) => (
        <View style={{ opacity: pressed ? 0.85 : 1 }}>
          <View style={{ aspectRatio: 1 }} className="bg-surface-elevated w-full">
            {track.artworkUrl ? (
              <Image
                source={{ uri: track.artworkUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={150}
              />
            ) : null}
          </View>
          <View className="p-3">
            <Text className="text-ink text-[15px] font-bold" numberOfLines={1}>
              {track.song}
            </Text>
            <Text className="text-ink-muted mt-0.5 text-[13px]" numberOfLines={1}>
              {track.artist}
            </Text>
            <Text className="text-ink-muted mt-1.5 text-[11px]" numberOfLines={1}>
              {track.album}
              {track.year ? ` · ${track.year}` : ''}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
